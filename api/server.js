import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env manually for local dev
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
  console.log('✓ .env cargado');
} catch {
  console.log('⚠ No se encontró .env - asegúrate de configurar GROQ_API_KEY');
}

import handler from './analyze.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/analyze', (req, res) => handler(req, res));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 API Server corriendo en http://localhost:${PORT}`);
  console.log(`   Groq API Key: ${process.env.GROQ_API_KEY ? '✓ Configurada' : '✗ NO CONFIGURADA'}\n`);
});
