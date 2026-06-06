# Fluxo Store Recruitment

Sistema completo de recrutamento para servidor Discord **Fluxo Store**.

Inclui:

- Site de recrutamento com React, TypeScript e Tailwind CSS.
- Login com Discord OAuth2.
- Formulário de candidatura.
- API Node.js/Express com MongoDB.
- Dashboard admin com JWT, filtros, dark mode, logs, SSE em tempo real e exportação CSV.
- Webhook para Discord ao receber candidatura.
- DM ao candidato quando aprovado/reprovado usando token do bot.
- Email de confirmação e email de decisão via SMTP.
- Proteções: Helmet, CORS com credenciais, rate limiting, CSRF double-submit, cookies HttpOnly, JWT, bcrypt e whitelist opcional de IP.

## Estrutura

```txt
fluxo-recruitment/
├─ apps/
│  ├─ api/      # Backend Express + MongoDB
│  ├─ web/      # Frontend React + Vite + Tailwind
│  └─ bot/      # Worker Discord opcional para manter bot online/health
├─ .env.example
├─ package.json
└─ README.md
```

## Pré-requisitos

- Node.js 20+
- MongoDB local ou MongoDB Atlas
- Aplicação criada no Discord Developer Portal
- Webhook de um canal do Discord
- Conta SMTP, como Gmail App Password, Brevo, SendGrid, Resend SMTP, etc.

## 1. Instalar dependências

Na pasta raiz:

```bash
npm install
```

## 2. Configurar variáveis

Crie estes arquivos:

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp .env.example apps/bot/.env
```

Edite principalmente:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `DISCORD_BOT_TOKEN`
- `DISCORD_WEBHOOK_URL`
- `SMTP_*`
- `VITE_API_URL`

Para local, use:

```env
DISCORD_REDIRECT_URI=http://localhost:3333/api/auth/discord/callback
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3333
```

No Discord Developer Portal, a redirect URI precisa ser exatamente igual ao valor `DISCORD_REDIRECT_URI`.

## 3. Rodar tudo local

```bash
npm run dev
```

Serviços:

- Web: `http://localhost:5173`
- API: `http://localhost:3333/health`
- Bot health: `http://localhost:3334/health`

## 4. Criar primeiro admin

O backend cria o primeiro admin automaticamente no startup se não existir nenhum admin no banco e se as variáveis abaixo estiverem preenchidas:

```env
ADMIN_BOOTSTRAP_NAME=Administrador Fluxo
ADMIN_BOOTSTRAP_EMAIL=admin@fluxostore.local
ADMIN_BOOTSTRAP_PASSWORD=senha-forte
```

Depois entre em:

```txt
http://localhost:5173/admin
```

## 5. Fluxo do candidato

1. Usuário acessa landing page.
2. Clica em **Entrar com Discord**.
3. Autoriza no Discord.
4. É redirecionado para o formulário.
5. Envia candidatura.
6. Sistema salva no MongoDB, envia webhook no Discord, envia email de confirmação e atualiza dashboard em tempo real.

## 6. Fluxo do admin

1. Admin acessa `/admin`.
2. Faz login com email e senha.
3. Visualiza candidatos por filtro: pendente/aprovado/reprovado.
4. Abre detalhes.
5. Aprova ou reprova.
6. O sistema registra histórico, audit log, envia DM no Discord e email de decisão.

## 7. CSV

No dashboard há botão **Baixar CSV**. A rota é:

```txt
GET /api/admin/candidates.csv?status=pending
```

## 8. Webhook Discord

Crie um webhook em um canal do Discord e coloque a URL em:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 9. Bot Discord / DM

O envio de DM é feito pela API usando `DISCORD_BOT_TOKEN`. O app `apps/bot` serve como worker opcional para manter o bot online e validar o token em produção.

Permissões recomendadas do bot:

- Bot básico no servidor.
- Sem intents privilegiadas obrigatórias para DM por REST.

Observação: o candidato precisa permitir mensagens privadas de membros do servidor ou a DM pode falhar. Mesmo assim, o status será salvo e o email será enviado.

## 10. Deploy sugerido

### Frontend na Vercel

Configure o projeto apontando para `apps/web` e adicione:

```env
VITE_API_URL=https://sua-api.com
```

### API no Render/Railway/Heroku/VPS

Configure o root como `apps/api` e comando:

```bash
npm install && npm run build && npm start
```

Variáveis obrigatórias no servidor:

```env
NODE_ENV=production
API_URL=https://sua-api.com
CLIENT_URL=https://seu-site.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=uma-chave-muito-forte
DISCORD_REDIRECT_URI=https://sua-api.com/api/auth/discord/callback
```

### Bot na Discloud/Railway/VPS

Configure o root como `apps/bot` e comando:

```bash
npm install && npm run build && npm start
```

## 11. Segurança

Checklist aplicado no código:

- Cookies HttpOnly para tokens JWT.
- CSRF double-submit em rotas mutáveis.
- Rate limit global, login e formulário.
- Validação com Zod.
- Senha admin com bcrypt.
- CORS restrito ao `CLIENT_URL`.
- Helmet.
- Whitelist opcional de IP no admin via `ADMIN_IP_WHITELIST`.
- Audit logs em todas as decisões.
- Histórico por candidato.

## 12. Comandos úteis

```bash
npm run dev
npm run build
npm run dev:api
npm run dev:web
npm run dev:bot
```

Gerar zip manual no PowerShell:

```powershell
Compress-Archive -Path .\fluxo-recruitment\* -DestinationPath .\fluxo-recruitment.zip -Force
```
