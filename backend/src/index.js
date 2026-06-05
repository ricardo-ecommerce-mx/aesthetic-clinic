require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { initWhatsApp } = require("./whatsapp");
const { askAI } = require("./ai");

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.FRONTEND_URL || "*";

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// ─── PERSISTENCIA JSON ────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, "../../data");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}
  return fallback;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Carga inicial
let appointments = readJSON(APPOINTMENTS_FILE, []);
let conversations = readJSON(CONVERSATIONS_FILE, {});
let config = readJSON(CONFIG_FILE, { prompt: "", clinicName: "Clínica Bella Piel" });

function saveAppointments() { writeJSON(APPOINTMENTS_FILE, appointments); }
function saveConversations() { writeJSON(CONVERSATIONS_FILE, conversations); }
function saveConfig() { writeJSON(CONFIG_FILE, config); }

// ─── HEALTH ───────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── CITAS ────────────────────────────────────────────────────────
// Obtener todas las citas
app.get("/api/appointments", (req, res) => res.json(appointments));

// Crear nueva cita (desde calendario dashboard o /book público)
app.post("/api/appointments", (req, res) => {
  const { name, email, phone, service, date, time } = req.body;
  if (!name || !date || !time) return res.status(400).json({ error: "name, date y time son requeridos" });

  const appointment = {
    id: Date.now().toString(),
    name,
    email: email || "",
    phone: phone || "",
    service: service || "Consulta inicial",
    date,
    time,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);
  saveAppointments();
  io.emit("appointment_created", appointment);
  res.json(appointment);
});

// Actualizar estado de cita
app.patch("/api/appointments/:id", (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Cita no encontrada" });
  appointments[idx] = { ...appointments[idx], ...req.body };
  saveAppointments();
  io.emit("appointment_updated", appointments[idx]);
  res.json(appointments[idx]);
});

// Eliminar cita
app.delete("/api/appointments/:id", (req, res) => {
  appointments = appointments.filter(a => a.id !== req.params.id);
  saveAppointments();
  io.emit("appointment_deleted", { id: req.params.id });
  res.json({ success: true });
});

// Horarios ocupados para una fecha
app.get("/api/appointments/slots/:date", (req, res) => {
  const taken = appointments
    .filter(a => a.date === req.params.date && a.status !== "cancelled")
    .map(a => a.time);
  res.json({ taken });
});

// ─── CONVERSACIONES ───────────────────────────────────────────────
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

app.post("/api/send", async (req, res) => {
  const { jid, text } = req.body;
  if (!jid || !text) return res.status(400).json({ error: "jid y text requeridos" });
  try {
    const sock = global.whatsappSock;
    if (sock) await sock.sendMessage(jid, { text });
    addMessage(jid, { from: "me", text, timestamp: Date.now() });
    io.emit("new_message", { jid, from: "me", text, timestamp: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONFIG / PROMPT ─────────────────────────────────────────────
app.get("/api/config", (req, res) => res.json(config));

app.post("/api/prompt", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt requerido" });
  config.prompt = prompt;
  global.aiPrompt = prompt;
  saveConfig();
  res.json({ success: true });
});

app.post("/api/config", (req, res) => {
  config = { ...config, ...req.body };
  if (req.body.prompt) global.aiPrompt = req.body.prompt;
  saveConfig();
  res.json(config);
});

// ─── TEST IA ─────────────────────────────────────────────────────
app.post("/api/test-ai", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await askAI(message || "Hola, ¿qué servicios tienen?");
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── WHATSAPP STATUS ─────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({ connected: global.whatsappConnected || false, qr: global.lastQR || null });
});

// ─── SOCKET.IO ───────────────────────────────────────────────────
io.on("connection", (socket) => {
  if (global.lastQR) socket.emit("qr", global.lastQR);
  if (global.whatsappConnected) socket.emit("whatsapp_ready");
});

// ─── HELPERS ─────────────────────────────────────────────────────
function addMessage(jid, msg) {
  if (!conversations[jid]) conversations[jid] = { messages: [], unread: 0 };
  conversations[jid].messages.push(msg);
  if (conversations[jid].messages.length > 200)
    conversations[jid].messages = conversations[jid].messages.slice(-200);
  saveConversations();
}

// ─── WHATSAPP HANDLERS ───────────────────────────────────────────
global.onIncomingMessage = async (jid, name, text) => {
  if (!conversations[jid]) conversations[jid] = { messages: [], name, unread: 0 };
  conversations[jid].name = name;
  conversations[jid].unread = (conversations[jid].unread || 0) + 1;
  const inMsg = { from: "contact", name, text, timestamp: Date.now() };
  addMessage(jid, inMsg);
  io.emit("new_message", { jid, ...inMsg });

  try {
    const aiResponse = await askAI(text, conversations[jid].messages.slice(-10));
    const sock = global.whatsappSock;
    if (sock && aiResponse) {
      await sock.sendMessage(jid, { text: aiResponse });
      const aiMsg = { from: "me", text: aiResponse, isAI: true, timestamp: Date.now() };
      addMessage(jid, aiMsg);
      io.emit("new_message", { jid, ...aiMsg });
      conversations[jid].unread = 0;
      saveConversations();
    }
  } catch (err) {
    console.error("AI error:", err.message);
  }
};

global.onQR = (qrDataUrl) => { global.lastQR = qrDataUrl; io.emit("qr", qrDataUrl); };
global.onReady = () => { global.whatsappConnected = true; global.lastQR = null; io.emit("whatsapp_ready"); };
global.onDisconnected = () => { global.whatsappConnected = false; io.emit("whatsapp_disconnected"); };

// Cargar prompt guardado
if (config.prompt) global.aiPrompt = config.prompt;

// ─── START ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initWhatsApp();
});
