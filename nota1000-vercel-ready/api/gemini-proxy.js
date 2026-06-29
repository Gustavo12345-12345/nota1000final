export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { model, requestBody } = req.body;
    
    // This looks for the secret key you will put in Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in Vercel.");
      return res.status(500).json({ error: 'Chave da API Gemini não configurada no servidor.' });
    }

    // Google's official Gemini endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Send the request to Google
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // If Google rejects the request, pass the error back to the frontend
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json(data);
    }

    // Send the successful AI response back to your website
    return res.status(200).json(data);

  } catch (error) {
    console.error('Internal server error:', error);
    return res.status(500).json({ error: 'Erro interno ao comunicar com a IA.' });
  }
}
