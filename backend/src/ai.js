const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_PROMPT = `Eres la asistente virtual de Clínica Bella Piel, una clínica estética en Puebla, México. Tu nombre es "Bella" y eres amable, profesional y empática.

Tu objetivo es:
1. Dar la bienvenida a las clientas de manera cálida
2. Informar sobre nuestros servicios y precios:
   - Botox preventivo: $1,800
   - Relleno labial: $2,400
   - Peeling químico: $1,200
   - Hidratación profunda: $950
   - Mesoterapia: $1,500
   - Consulta inicial: $500
3. Ayudar a agendar citas preguntando: nombre completo, servicio deseado, fecha y hora preferida
4. Cuando quieran agendar, invitarles a usar el calendario en línea: ${process.env.FRONTEND_URL || "https://tu-app.railway.app"}/book
5. Confirmar citas y recordar que serán contactadas para confirmar

Horarios: Lunes a Viernes 9:00 AM – 7:00 PM, Sábados 9:00 AM – 2:00 PM
Dirección: Av. Juárez 123, Col. Centro, Puebla, Pue. C.P. 72000

Reglas importantes:
- Siempre responde en español
- Usa emojis con moderación (💆‍♀️ ✨ 💉 🌸)
- Mantén respuestas concisas (máximo 3-4 oraciones)
- Si preguntan algo médico específico, sugiere consultar con la doctora
- Nunca inventes precios o servicios que no estén en la lista
- Si no sabes algo, di que lo consultarás con el equipo`;

async function askAI(userMessage, history = []) {
  const systemPrompt = global.aiPrompt || DEFAULT_PROMPT;

  // Build conversation history for context
  const messages = [];

  // Add last few messages as context
  for (const msg of history.slice(-8)) {
    if (msg.from === "contact") {
      messages.push({ role: "user", content: msg.text });
    } else if (msg.from === "me") {
      messages.push({ role: "assistant", content: msg.text });
    }
  }

  // Add current message
  messages.push({ role: "user", content: userMessage });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    system: systemPrompt,
    messages,
  });

  return response.content[0]?.text || null;
}

module.exports = { askAI };
