import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

const transporter = hasSmtpConfig()
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null;

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  if (!transporter) {
    console.log('ℹ️ SMTP não configurado. Email ignorado:', input.subject, input.to);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });
}

export async function sendApplicationConfirmation(to: string, name: string) {
  await sendEmail({
    to,
    subject: 'Recebemos sua candidatura - Fluxo Store',
    text: `Olá ${name}, recebemos sua candidatura para a equipe da Fluxo Store. Nossa equipe vai analisar e responder em breve.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Recebemos sua candidatura ✅</h2>
        <p>Olá <strong>${name}</strong>, sua candidatura para a equipe da <strong>Fluxo Store</strong> foi recebida.</p>
        <p>Nossa equipe vai analisar suas informações e responder em breve.</p>
        <p>Atenciosamente,<br/>Equipe Fluxo Store</p>
      </div>
    `
  });
}

export async function sendDecisionEmail(to: string, name: string, approved: boolean, note?: string) {
  const title = approved ? 'Candidatura aprovada - Fluxo Store' : 'Atualização sobre sua candidatura - Fluxo Store';
  const text = approved
    ? `Olá ${name}, sua candidatura foi aprovada. Seja bem-vindo(a) à Fluxo Store! ${note || ''}`
    : `Olá ${name}, agradecemos sua candidatura. Neste momento ela não foi aprovada. ${note || ''}`;

  await sendEmail({
    to,
    subject: title,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>${approved ? 'Parabéns, você foi aprovado(a)! 🎉' : 'Obrigado por participar'}</h2>
        <p>Olá <strong>${name}</strong>,</p>
        <p>${approved ? 'Sua candidatura para a Fluxo Store foi aprovada. Em breve nossa equipe entrará em contato para os próximos passos.' : 'Analisamos sua candidatura com atenção, mas neste momento ela não foi aprovada.'}</p>
        ${note ? `<blockquote style="background:#f3f4f6;padding:12px;border-radius:8px">${note}</blockquote>` : ''}
        <p>Atenciosamente,<br/>Equipe Fluxo Store</p>
      </div>
    `
  });
}
