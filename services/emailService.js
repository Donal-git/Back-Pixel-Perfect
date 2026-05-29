import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,         // STARTTLS
  family: 4,             // Force IPv4 socket
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Check SMTP connectivity at startup
transporter.verify((error) => {
  if (error) {
    console.error('[emailService] SMTP non disponible:', error.message);
  } else {
    console.log('[emailService] SMTP Gmail prêt — envoi d\'emails activé');
  }
});

export const sendWelcomeEmail = async ({ name, email, password }) => {
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

  await transporter.sendMail({
    from: `"PixelPerfect RH" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vos identifiants de connexion — PixelPerfect RH',
    html,
  });
};
