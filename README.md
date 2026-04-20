# Agente de Conferência de Documentação

Aplicação web que valida automaticamente a pasta de documentação do cliente contra o checklist do processo de ativação do Grupo Conexão.

## Estrutura

```
agente-deploy/
├── index.html          Frontend completo da aplicação
├── api/
│   └── analyze.js      Função serverless que protege a API key
├── vercel.json         Configuração de deploy
├── package.json        Metadados do projeto
└── README.md           Este arquivo
```

## Como funciona

1. O usuário acessa a URL e seleciona o perfil do cliente
2. Envia os documentos em PDF ou imagem
3. A aplicação envia os arquivos para o Claude via função serverless
4. O Claude analisa, confere contra o checklist e retorna o diagnóstico estruturado
5. A interface apresenta status, pendências, pontos de atenção e próximos passos

A chave da API Anthropic fica no servidor, nunca exposta no navegador.

---

## Deploy na Vercel

### 1. Criar conta Anthropic e gerar API key

Acesse https://console.anthropic.com/

Crie uma conta, adicione crédito (recomendado US$ 20 iniciais para cobrir vários meses) e gere uma API key em Settings > API Keys. Copie a chave que começa com `sk-ant-`.

### 2. Subir o projeto para o GitHub

Crie um repositório novo no GitHub. Faça upload dos arquivos desta pasta (pode ser via interface web do GitHub, arrastando os arquivos).

### 3. Conectar com a Vercel

Acesse https://vercel.com/ e crie conta gratuita (use o próprio GitHub para login).

Clique em **Add New > Project**. Selecione o repositório que você acabou de criar. Na tela de configuração:

- Framework Preset: **Other**
- Root Directory: deixe em branco
- Build Command: deixe em branco
- Output Directory: deixe em branco

### 4. Adicionar a variável de ambiente

Ainda na tela de configuração, expanda **Environment Variables** e adicione:

- Name: `ANTHROPIC_API_KEY`
- Value: cole a chave que começa com `sk-ant-`

Clique em **Deploy**.

### 5. Acessar a aplicação

Em 30 segundos a Vercel entrega uma URL do tipo `seu-projeto.vercel.app`. Essa URL é pública e pode ser compartilhada com a equipe.

### 6. Domínio próprio (opcional)

Na Vercel, vá em Settings > Domains e adicione o subdomínio desejado (ex: `conferencia.grupoconexao.com.br`). A Vercel mostra os registros DNS necessários. Configure no painel do seu provedor de domínio e em até 1 hora está ativo.

---

## Custos estimados

Para volume de 100 conferências por mês com média de 5 documentos cada:

- API Anthropic: US$ 6 a US$ 10 por mês
- Vercel: gratuito (plano Hobby cobre até 100GB de banda e 100 horas de serverless)
- Domínio: opcional

Custo total estimado: US$ 10 por mês.

---

## Ajustes comuns

### Atualizar o checklist

Edite o objeto `CHECKLISTS` dentro de `index.html` (próximo à linha 240). Faça commit e push. A Vercel faz deploy automático.

### Alterar mensagens ou layout

Tudo está em `index.html`. Cores ficam nas variáveis CSS no topo (`:root`). Textos estão diretamente no HTML.

### Monitorar uso da API

Acesse https://console.anthropic.com/ > Usage para ver consumo em tempo real.

---

## Limites técnicos

- Tamanho máximo de cada arquivo enviado: 4 MB
- Tamanho total da requisição: 4,5 MB (limite da Vercel free tier)
- Tempo máximo de análise: 60 segundos
- Formatos aceitos: PDF, JPG, PNG

Para arquivos maiores, instrua a equipe a compactar PDFs antes do envio. Ferramentas como ilovepdf.com reduzem PDFs sem perder qualidade.

---

## Suporte

Em caso de problemas no deploy, verifique:

1. A variável `ANTHROPIC_API_KEY` está configurada na Vercel (Settings > Environment Variables)
2. A chave começa com `sk-ant-` e tem crédito disponível
3. Os arquivos foram enviados na estrutura correta (index.html na raiz, analyze.js dentro de /api)

Logs de erro aparecem em Vercel Dashboard > Deployments > Functions.
