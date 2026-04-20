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
    const { max_tokens, messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Requisição inválida. Faltam campos obrigatórios.' });
    }

    // Tenta múltiplos modelos até um funcionar
    const modelsToTry = [
      'claude-3-5-sonnet-20240620',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: max_tokens || 2000,
            messages,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          return res.status(200).json(data);
        }

        lastError = data;
      } catch (err) {
        lastError = { error: err.message };
      }
    }

    return res.status(500).json({
      error: 'Nenhum modelo disponível funcionou',
      details: lastError,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
