// api/gemini-proxy.js
// Serverless function (runs on Vercel). Keeps the Gemini API key on the server.
// The browser sends { model, requestBody } and never sees the real key.

module.exports = async function handler(req, res) {
  // Basic CORS (same-origin in production, but harmless to allow during local testing)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const apiKey = 'AQ.Ab8RN6KT3TmwG2e83po1zlza2fErrtjeZHVy4hJjgOumFrkmKQ';

  try {
    const { model, requestBody } = req.body || {};

    // Only allow the specific models this app uses, to avoid the proxy being abused
    // as an open relay to any Gemini endpoint.
    const allowedModels = ['gemini-2.0-flash'];
    if (!model || !allowedModels.includes(model)) {
      return res.status(400).json({ error: 'Modelo inválido ou não permitido.' });
    }

    if (!requestBody || typeof requestBody !== 'object') {
      return res.status(400).json({ error: 'requestBody é obrigatório.' });
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Erro retornado pela API Gemini:', data);
      return res.status(googleResponse.status).json({
        error: (data && data.error && data.error.message) || 'Erro ao chamar a API Gemini.',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro no proxy Gemini:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a requisição de IA.' });
  }
};
