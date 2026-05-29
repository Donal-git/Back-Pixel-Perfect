import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const SMTP_HOST = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[emailService] SMTP non configuré (EMAIL_USER/EMAIL_PASS manquants). Les emails ne seront pas envoyés.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      servername: SMTP_HOST,
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

const transporter = createTransporter();

export const sendWelcomeEmail = async ({ name, email, password }) => {
  if (!transporter) {
    console.warn(`[emailService] E-mail non envoyé à ${email} : SMTP non configuré.`);
    return;
  }

  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1d4ed8;">Bienvenue sur PixelPerfect RH</h2>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Votre compte a été créé par un administrateur. Voici vos identifiants de connexion :</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 16px 8px 0; font-weight: bold;">Email :</td>
          <td style="padding: 8px 0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; font-weight: bold;">Mot de passe :</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 15px;">${password}</td>
        </tr>
      </table>
      <p>
        <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 6px;">
          Se connecter
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après la première connexion.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PixelPerfect RH" <${EMAIL_USER}>`,
      to: email,
      subject: 'Vos identifiants de connexion — PixelPerfect RH',
      html,
    });
  } catch (error) {
    console.error('[emailService] Échec de l’envoi de l’e-mail:', error.message);
    throw error;
  }
};
