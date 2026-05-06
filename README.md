# ⟨/⟩ CodeScan — Detector de Errores con IA (Groq + Llama)

Plataforma web que detecta errores en código HTML, CSS y JavaScript usando **Groq AI (100% gratis)**. Pensada para estudiantes y desarrolladores junior.

## ✨ Funcionalidades

- 🔍 **Análisis con IA** — Llama 3.3 70B via Groq, explicaciones en español
- 🎨 **Editor profesional** — Syntax highlighting con CodeMirror
- 📊 **Score de calidad** — Puntuación 0-100 de tu código
- ⚡ **Errores, advertencias y sugerencias** — Organizados por severidad
- 💡 **Antes / Después** — Ve exactamente cómo mejorar tu código
- ★ **Buenas prácticas** — Consejos para escribir mejor código
- 💸 **100% GRATIS** — Groq ofrece 30 req/min sin costo

---

## 🚀 PASO A PASO — Configuración Local

### Paso 1 — Instala Node.js (si no lo tienes)

Descarga desde: https://nodejs.org  
Elige la versión **LTS** (la recomendada).

Verifica que quedó instalado:
```bash
node --version
npm --version
```

### Paso 2 — Abre el proyecto en VS Code

1. Descarga y descomprime el ZIP del proyecto
2. Abre VS Code
3. Haz clic en **File → Open Folder**
4. Selecciona la carpeta `code-detector`

### Paso 3 — Abre la terminal en VS Code

Presiona `` Ctrl + ` `` (la tecla del acento grave, arriba del Tab)

### Paso 4 — Instala las dependencias

Escribe esto en la terminal y presiona Enter:
```bash
npm run install:all
```
Espera que termine (puede tardar 1-2 minutos la primera vez).

### Paso 5 — Obtén tu API Key de Groq (GRATIS)

1. Ve a 👉 https://console.groq.com
2. Crea una cuenta gratis (puedes usar Google)
3. En el menú izquierdo haz clic en **"API Keys"**
4. Haz clic en **"Create API Key"**
5. Dale un nombre (ej: `mi-codescan`) y copia la clave

### Paso 6 — Configura tu API Key

En la terminal de VS Code:
```bash
# En Windows:
copy .env.example .env

# En Mac/Linux:
cp .env.example .env
```

Luego abre el archivo `.env` que se creó y reemplaza el valor:
```
GROQ_API_KEY=gsk_TU_CLAVE_AQUI
```

### Paso 7 — Corre el proyecto

```bash
npm run dev
```

Verás algo así:
```
✓ .env cargado
🚀 API Server corriendo en http://localhost:3001
   Groq API Key: ✓ Configurada

  VITE v5.x  ready in 500 ms
  ➜  Local:   http://localhost:5173
```

Abre tu navegador en 👉 **http://localhost:5173** ¡y listo!

---

## 🌐 PASO A PASO — Deploy en Vercel (GRATIS)

### Paso 1 — Sube el código a GitHub

1. Crea una cuenta en https://github.com si no tienes
2. Haz clic en **"New repository"** (botón verde)
3. Nombre: `code-detector`, déjalo público, haz clic en **"Create repository"**
4. En la terminal de VS Code ejecuta:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/code-detector.git
git push -u origin main
```

(Reemplaza `TU_USUARIO` con tu usuario de GitHub)

### Paso 2 — Despliega en Vercel

1. Ve a 👉 https://vercel.com y crea cuenta (puedes usar GitHub)
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio `code-detector`
4. Antes de hacer deploy, busca la sección **"Environment Variables"** y agrega:
   - **Name:** `GROQ_API_KEY`
   - **Value:** tu clave de Groq (la que copiaste antes)
5. Haz clic en **"Deploy"** 🎉

En 2-3 minutos tendrás tu app en vivo en una URL como:
`https://code-detector-tuusuario.vercel.app`

### Paso 3 — Actualizaciones futuras

Cada vez que hagas cambios y quieras actualizar Vercel:
```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y actualiza automáticamente.

---

## 📁 Estructura del Proyecto

```
code-detector/
├── api/
│   ├── analyze.js      ← Llama a Groq API (serverless en Vercel)
│   └── server.js       ← Servidor Express para desarrollo local
├── client/
│   ├── src/
│   │   ├── App.jsx     ← Toda la interfaz React
│   │   ├── App.css     ← Estilos (tema terminal oscuro)
│   │   ├── main.jsx    ← Entry point
│   │   └── index.css   ← Reset CSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.js  ← Proxy /api → localhost:3001
├── .env                ← Tu API Key (NO subir a GitHub)
├── .env.example        ← Plantilla del .env
├── .gitignore          ← Excluye .env y node_modules
├── package.json        ← Scripts y deps del backend
├── vercel.json         ← Configuración de Vercel
└── README.md
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Editor | CodeMirror 6 |
| Backend (local) | Node.js + Express |
| Backend (producción) | Vercel Serverless Functions |
| IA | Llama 3.3 70B via Groq API |
| Deploy | Vercel |

## 💸 Costo

**Todo gratis:**
- Groq: gratis (30 req/min, sin tarjeta de crédito)
- Vercel: gratis (plan Hobby)
- GitHub: gratis

---

## ❓ Problemas Comunes

**"GROQ_API_KEY no configurada"**
→ Verifica que el archivo `.env` existe y tiene la clave correcta. La clave empieza con `gsk_`.

**"Error al procesar la respuesta de la IA"**
→ El modelo a veces falla con código muy corto. Intenta con más código.

**"Cannot find module"**
→ Corre `npm run install:all` de nuevo.

**El frontend carga pero la API no responde**
→ Asegúrate de haber corrido `npm run dev` (no solo `npm run dev:client`).
