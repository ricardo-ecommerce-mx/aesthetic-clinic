# 🌿 AestheticAI Clinic

Sistema completo de gestión para clínicas estéticas con agente IA en WhatsApp Business.

---

## 🏗️ Estructura del proyecto

```
aesthetic-clinic/
├── backend/          ← Node.js + Express + Baileys + Anthropic
│   ├── src/
│   │   ├── index.js      ← Servidor principal + Socket.IO
│   │   ├── whatsapp.js   ← Conexión WhatsApp (Baileys)
│   │   └── ai.js         ← Agente IA (Anthropic Claude)
│   └── package.json
└── frontend/         ← React + Vite
    ├── src/
    │   ├── pages/         ← Landing, Auth, Dashboard, PublicBooking
    │   ├── components/    ← Tabs del dashboard
    │   └── lib/api.js     ← Cliente API + Socket.IO
    └── package.json
```

---

## 🚀 Despliegue en Railway (paso a paso)

### Prerrequisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Railway](https://railway.app)
- API Key de [Anthropic](https://console.anthropic.com)

---

### Paso 1: Subir a GitHub

```bash
# En tu computadora, en la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit: AestheticAI Clinic MVP"

# Crea un repositorio nuevo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/aesthetic-clinic.git
git branch -M main
git push -u origin main
```

---

### Paso 2: Desplegar el Backend en Railway

1. Ve a [railway.app](https://railway.app) → **New Project**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu cuenta de GitHub y selecciona `aesthetic-clinic`
4. Railway detectará el proyecto → En la configuración del servicio:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. En la pestaña **Variables**, agrega:
   ```
   ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxx
   FRONTEND_URL      = https://TU-FRONTEND.up.railway.app
   PORT              = 3001
   ```
   *(El FRONTEND_URL lo agregas después de crear el servicio frontend)*

6. Clic en **Deploy** → Anota la URL generada (ej: `https://aesthetic-clinic-backend.up.railway.app`)

---

### Paso 3: Desplegar el Frontend en Railway

1. En el mismo proyecto de Railway → **"New Service"** → **GitHub Repo**
2. Selecciona el mismo repo `aesthetic-clinic`
3. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -p $PORT`

4. En **Variables**, agrega:
   ```
   VITE_BACKEND_URL = https://TU-BACKEND.up.railway.app
   ```
   *(La URL del backend del paso 2)*

5. Clic en **Deploy**

---

### Paso 4: Actualizar URLs cruzadas

Una vez que ambos servicios estén activos:

**En el servicio Backend** → Variables:
```
FRONTEND_URL = https://TU-FRONTEND.up.railway.app
```

**Redeploy** del backend para aplicar el cambio.

---

### Paso 5: Conectar WhatsApp

1. Ve a tu frontend en Railway → abre la app
2. Navega a **Configuración** → sección "Conexión WhatsApp Business"
3. Aparecerá el QR en pantalla
4. Abre WhatsApp en tu teléfono → **Ajustes → Dispositivos vinculados → Vincular dispositivo**
5. Escanea el QR
6. El estado cambiará a ✅ Conectado

**Nota:** La sesión persiste en Railway gracias a la carpeta `.wa_auth`. Si Railway reinicia el servicio, es posible que necesites re-escanear el QR.

---

## 💻 Desarrollo local

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env
# Edita .env con tu ANTHROPIC_API_KEY
npm install
npm run dev

# Terminal 2 — Frontend  
cd frontend
cp .env.example .env
# VITE_BACKEND_URL=http://localhost:3001 (ya viene así)
npm install
npm run dev
```

Abre http://localhost:5173

---

## 🔗 URLs del sistema

| URL | Descripción |
|-----|-------------|
| `https://TU-FRONTEND.up.railway.app` | Dashboard principal |
| `https://TU-FRONTEND.up.railway.app/book` | Calendario público para clientes |
| `https://TU-BACKEND.up.railway.app/health` | Health check del backend |
| `https://TU-BACKEND.up.railway.app/api/status` | Estado WhatsApp |

---

## ⚙️ Variables de entorno

### Backend (`backend/.env`)
| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic |
| `FRONTEND_URL` | URL del frontend (para CORS) |
| `PORT` | Puerto del servidor (Railway lo asigna automáticamente) |

### Frontend (`frontend/.env`)
| Variable | Descripción |
|----------|-------------|
| `VITE_BACKEND_URL` | URL del backend |

---

## 🤖 Personalizar el agente IA

En el Dashboard → **Configuración** → **Prompt del Agente IA**, puedes escribir las instrucciones que definirán cómo responderá el agente. El prompt se actualiza en tiempo real sin necesidad de redeploy.

---

## 📱 Funcionalidades

- ✅ Landing page con diseño premium
- ✅ Dashboard con métricas y agenda
- ✅ Gestión de citas con tabla detallada  
- ✅ Chat estilo WhatsApp con IA integrada
- ✅ Calendario con booking y slots
- ✅ Página pública de booking (`/book`)
- ✅ QR para conectar WhatsApp Business
- ✅ Agente IA con prompt personalizable
- ✅ Socket.IO para mensajes en tiempo real

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| WhatsApp | @whiskeysockets/baileys |
| IA | Anthropic Claude (claude-sonnet-4) |
| Realtime | Socket.IO |
| Deploy | Railway |
| Fonts | Plus Jakarta Sans |
