// Vercel Serverless Function
// Este arquivo roda no servidor, protege a API key e repassa a chamada para a Anthropic.

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no ambiente.' });
  }

  try {
    const { model, max_tokens, messages } = req.body;

    if (!messages || !model) {
      return res.status(400).json({ error: 'Requisição inválida. Faltam campos obrigatórios.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens || 2000,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
