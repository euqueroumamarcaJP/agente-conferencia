export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no ambiente.' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Requisição inválida. Faltam campos obrigatórios.' });
    }

    // Converte mensagens para formato OpenAI
    const openaiMessages = messages.map(msg => {
      if (!msg.content) return msg;
      
      // Se content é array (multimodal), converte cada item
      if (Array.isArray(msg.content)) {
        const convertedContent = msg.content.map(item => {
          // Texto
          if (item.type === 'text') {
            return { type: 'text', text: item.text };
          }
          
          // Imagem
          if (item.type === 'image') {
            return {
              type: 'image_url',
              image_url: {
                url: `data:${item.source.media_type};base64,${item.source.data}`
              }
            };
          }
          
          // Documento (PDF) - OpenAI não suporta nativamente, então ignoramos
          // O texto do prompt já está no content
          if (item.type === 'document') {
            return null;
          }
          
          return item;
        }).filter(Boolean);
        
        return { role: msg.role, content: convertedContent };
      }
      
      return msg;
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Erro da OpenAI: ${errorText.slice(0, 200)}`
      });
    }

    const data = await response.json();
    
    // Converte resposta OpenAI para formato compatível com o frontend
    const convertedResponse = {
      content: [
        {
          type: 'text',
          text: data.choices[0].message.content
        }
      ]
    };

    return res.status(200).json(convertedResponse);
    
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
