import axios from 'axios';
import { env } from '../config/env.js';
import type { ApplicationDocument } from '../models/Application.js';

export async function sendApplicationWebhook(app: ApplicationDocument) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  await axios.post(env.DISCORD_WEBHOOK_URL, {
    username: 'Fluxo Store Recruitment',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png',
    embeds: [
      {
        title: '📥 Nova candidatura recebida',
        color: 0x5865f2,
        fields: [
          { name: 'Nome', value: app.fullName, inline: true },
          { name: 'Email', value: app.email, inline: true },
          { name: 'Idade', value: String(app.age), inline: true },
          { name: 'Discord', value: `${app.discordUsername} (${app.discordId})`, inline: false },
          { name: 'Status', value: 'Pendente', inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Fluxo Store • Recrutamento' }
      }
    ]
  });
}

async function discordRequest<T>(method: 'GET' | 'POST', path: string, data?: unknown): Promise<T> {
  if (!env.DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN não configurado.');
  const response = await axios.request<T>({
    method,
    url: `https://discord.com/api/v10${path}`,
    data,
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function sendCandidateDm(discordId: string, message: string) {
  if (!env.DISCORD_BOT_TOKEN) return;

  try {
    const dm = await discordRequest<{ id: string }>('POST', '/users/@me/channels', { recipient_id: discordId });
    await discordRequest('POST', `/channels/${dm.id}/messages`, {
      content: message,
      allowed_mentions: { parse: [] }
    });
  } catch (error) {
    console.warn('⚠️ Não foi possível enviar DM ao candidato:', discordId, error instanceof Error ? error.message : error);
  }
}

export function approvalMessage(name: string) {
  return [
    `Olá, ${name}! 🎉`,
    '',
    'Sua candidatura para a equipe da **Fluxo Store** foi aprovada.',
    'Seja bem-vindo(a)! Em breve nossa equipe entrará em contato para orientar os próximos passos.',
    '',
    'Obrigado por querer fazer parte da nossa equipe.'
  ].join('\n');
}

export function rejectionMessage(name: string) {
  return [
    `Olá, ${name}.`,
    '',
    'Agradecemos muito sua candidatura para a equipe da **Fluxo Store**.',
    'Após análise, neste momento não seguiremos com a aprovação.',
    '',
    'Isso não impede que você tente novamente em uma próxima oportunidade. Obrigado pelo interesse e pela dedicação.'
  ].join('\n');
}
