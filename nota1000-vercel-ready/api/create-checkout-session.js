// api/create-checkout-session.js
// Serverless function (runs on Vercel). Keeps the Stripe SECRET key on the server.

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const secretKey = 'sk_test_51SJwE9ChawD1WPmHE5rY9DzLalb7zYUOipixiwNSEZeFtMvIQeJmR5VKccDIxotwyItRrmcuMkZPiPHCacEp1fEs00hUnppQLz';

  const stripe = Stripe(secretKey);

  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = req.body || {};

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID é obrigatório.' });
    }

    // Same-origin fallback if the client didn't send explicit URLs
    const origin = `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${origin}/minhas-redacoes.html?payment=success`,
      cancel_url: cancelUrl || `${origin}/planos.html?payment=cancel`,
      customer_email: customerEmail || undefined,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('ERRO AO CRIAR SESSÃO STRIPE:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
