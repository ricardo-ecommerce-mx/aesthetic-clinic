const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const pino = require("pino");
const path = require("path");
const fs = require("fs");

const AUTH_FOLDER = path.join(__dirname, "../../.wa_auth");

async function initWhatsApp() {
  if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: "silent" });

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    logger,
    browser: ["AestheticAI Clinic", "Chrome", "1.0.0"],
    syncFullHistory: false,
  });

  global.whatsappSock = sock;

  // Handle connection updates (QR, ready, disconnected)
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { width: 256, margin: 2 });
        console.log("📱 New QR generated — scan with WhatsApp");
        if (global.onQR) global.onQR(qrDataUrl);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    }

    if (connection === "open") {
      if (global.onReady) global.onReady();
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (global.onDisconnected) global.onDisconnected();

      if (shouldReconnect) {
        console.log("🔄 Reconnecting WhatsApp...");
        setTimeout(initWhatsApp, 5000);
      } else {
        console.log("🚪 Logged out — delete .wa_auth folder to re-link");
        // Clear auth to force fresh QR
        fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        setTimeout(initWhatsApp, 3000);
      }
    }
  });

  // Save credentials whenever updated
  sock.ev.on("creds.update", saveCreds);

  // Handle incoming messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Skip status updates, broadcasts, own messages
      if (
        msg.key.remoteJid === "status@broadcast" ||
        msg.key.fromMe ||
        !msg.message
      ) continue;

      const jid = msg.key.remoteJid;
      const pushName = msg.pushName || jid.split("@")[0];

      // Extract text from different message types
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        null;

      if (!text) continue;

      console.log(`📨 [${pushName}]: ${text}`);
      if (global.onIncomingMessage) {
        await global.onIncomingMessage(jid, pushName, text);
      }
    }
  });

  return sock;
}

module.exports = { initWhatsApp };
