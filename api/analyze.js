export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { code, language } = req.body || {};

  if (!code || code.trim() === '') {
    return res.status(400).json({ error: 'No hay código para analizar' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el servidor' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Eres un experto analizador de código educativo para estudiantes y desarrolladores junior latinoamericanos.
Tu tarea es revisar código y dar retroalimentación clara, útil y educativa SIEMPRE en español.
Responde ÚNICAMENTE con JSON válido y bien formado. Sin texto adicional, sin backticks, sin markdown.`
          },
          {
            role: 'user',
            content: `Analiza este código ${language?.toUpperCase() || 'desconocido'} y devuelve EXACTAMENTE este JSON:

{
  "score": <número entero 0-100 que representa calidad del código>,
  "summary": "<resumen del análisis en 1-2 oraciones, tono educativo>",
  "errors": [
    {
      "line": <número de línea como entero, o null si no aplica>,
      "code": "<fragmento exacto del código problemático, máx 60 chars>",
      "message": "<descripción corta del error>",
      "explanation": "<explicación educativa: por qué es un error y qué consecuencias tiene>"
    }
  ],
  "warnings": [
    {
      "line": <número o null>,
      "code": "<fragmento del código>",
      "message": "<descripción de la advertencia>",
      "explanation": "<por qué es mala práctica y cómo afecta al código>"
    }
  ],
  "suggestions": [
    {
      "message": "<sugerencia de mejora concreta>",
      "before": "<código original a mejorar>",
      "after": "<código mejorado>"
    }
  ],
  "best_practices": ["<consejo práctico 1>", "<consejo práctico 2>", "<consejo práctico 3>"]
}

Código a analizar:
\`\`\`${language || 'text'}
${code}
\`\`\`

Reglas:
- Si el código está correcto, los arrays errors/warnings pueden estar vacíos
- score >= 90 = excelente, 70-89 = bueno, 50-69 = regular, menor a 50 = necesita trabajo
- Máximo 5 errores, 4 advertencias, 4 sugerencias, 3 buenas prácticas
- Responde SOLO con el JSON, absolutamente nada más`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Error de Groq: ${response.status}`);
    }

    const rawText = data.choices?.[0]?.message?.content?.trim() || '';

    const cleanJson = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const result = JSON.parse(cleanJson);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error en analyze:', error);

    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'Error al procesar la respuesta de la IA. Intenta de nuevo.' });
    }

    return res.status(500).json({
      error: error.message || 'Error interno al analizar el código'
    });
  }
}
