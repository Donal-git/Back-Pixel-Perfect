import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
const SENDER_EMAIL = (process.env.EMAIL_USER || '').trim();

if (!BREVO_API_KEY) {
  console.warn('[emailService] BREVO_API_KEY manquant — les emails ne seront pas envoyés.');
} else {
  console.log('[emailService] Brevo HTTP API configuré — envoi d\'emails activé');
}

export const sendWelcomeEmail = async ({ name, email, password }) => {
  if (!BREVO_API_KEY) {
    console.warn(`[emailService] Email non envoyé à ${email} : BREVO_API_KEY non configuré.`);
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

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'PixelPerfect RH', email: SENDER_EMAIL },
      to: [{ email, name }],
      subject: 'Vos identifiants de connexion — PixelPerfect RH',
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Brevo ${response.status}: ${body.message || 'Erreur inconnue'}`);
  }

  console.log(`[emailService] Email envoyé avec succès à ${email}`);
};
