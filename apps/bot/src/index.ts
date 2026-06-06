import 'dotenv/config';
import express from 'express';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const port = Number(process.env.BOT_PORT || 3334);

if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN não configurado.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user?.tag}`);
  client.user?.setPresence({
    activities: [{ name: 'recrutamento da Fluxo Store', type: ActivityType.Watching }],
    status: 'online'
  });
});

client.on('error', (error) => console.error('Discord client error:', error));

const app = express();
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'fluxo-bot',
    logged: Boolean(client.user),
    tag: client.user?.tag || null,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => console.log(`🚑 Bot health em http://localhost:${port}/health`));
client.login(token);
