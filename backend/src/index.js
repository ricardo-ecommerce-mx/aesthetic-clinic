require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { initWhatsApp } = require("./whatsapp");
const { askAI } = require("./ai");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Store active conversations in memory (use DB in production)
const conversations = {};

// ─── REST ENDPOINTS ───────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all conversations
app.get("/api/conversations", (req, res) => {
  const list = Object.entries(conversations).map(([jid, data]) => ({
    jid,
    name: data.name || jid.split("@")[0],
    messages: data.messages || [],
    lastMessage: data.messages?.[data.messages.length - 1] || null,
    unread: data.unread || 0,
  }));
  res.json(list);
});

// Get messages for a specific chat
app.get("/api/conversations/:jid", (req, res) => {
  const { jid } = req.params;
  res.json(conversations[jid] || { messages: [] });
});

// Send a manual message (from dashboard)
app.post("/api/send", async (req, res) => {
  const { jid, text } = req.body;
  if (!jid || !text) return res.status(400).json({ error: "jid and text required" });

  try {
    const sock = global.whatsappSock;
    if (!sock) return res.status(503).json({ error: "WhatsApp not connected" });

    await sock.sendMessage(jid, { text });
    addMessage(jid, { from: "me", text, timestamp: Date.now() });
    io.emit("new_message", { jid, from: "me", text, timestamp: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update AI prompt
app.post("/api/prompt", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  global.aiPrompt = prompt;
  res.json({ success: true });
});

// Test AI agent
app.post("/api/test-ai", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await askAI(message || "Hola, ¿qué servicios tienen?");
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp connection status
app.get("/api/status", (req, res) => {
  res.json({
    connected: global.whatsappConnected || false,
    qr: global.lastQR || null,
  });
});

// ─── SOCKET.IO ────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log("Dashboard connected:", socket.id);

  // Send current QR or status on connect
  if (global.lastQR) socket.emit("qr", global.lastQR);
  if (global.whatsappConnected) socket.emit("whatsapp_ready");

  socket.on("disconnect", () => {
    console.log("Dashboard disconnected:", socket.id);
  });
});

// ─── HELPERS ─────────────────────────────────────────────────────

function addMessage(jid, msg) {
  if (!conversations[jid]) conversations[jid] = { messages: [], unread: 0 };
  conversations[jid].messages.push(msg);
  if (conversations[jid].messages.length > 200) {
    conversations[jid].messages = conversations[jid].messages.slice(-200);
  }
}

// ─── WHATSAPP MESSAGE HANDLER ────────────────────────────────────

global.onIncomingMessage = async (jid, name, text) => {
  // Save incoming message
  if (!conversations[jid]) conversations[jid] = { messages: [], name, unread: 0 };
  conversations[jid].name = name;
  conversations[jid].unread = (conversations[jid].unread || 0) + 1;

  const inMsg = { from: "contact", name, text, timestamp: Date.now() };
  addMessage(jid, inMsg);
  io.emit("new_message", { jid, ...inMsg });

  // Auto-respond with AI
  try {
    const aiResponse = await askAI(text, conversations[jid].messages.slice(-10));
    const sock = global.whatsappSock;
    if (sock && aiResponse) {
      await sock.sendMessage(jid, { text: aiResponse });
      const aiMsg = { from: "me", text: aiResponse, isAI: true, timestamp: Date.now() };
      addMessage(jid, aiMsg);
      io.emit("new_message", { jid, ...aiMsg });
      conversations[jid].unread = 0;
    }
  } catch (err) {
    console.error("AI response error:", err.message);
  }
};

global.onQR = (qrDataUrl) => {
  global.lastQR = qrDataUrl;
  io.emit("qr", qrDataUrl);
};

global.onReady = () => {
  global.whatsappConnected = true;
  global.lastQR = null;
  io.emit("whatsapp_ready");
  console.log("✅ WhatsApp connected!");
};

global.onDisconnected = () => {
  global.whatsappConnected = false;
  io.emit("whatsapp_disconnected");
  console.log("❌ WhatsApp disconnected");
};

// ─── START ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initWhatsApp();
});
