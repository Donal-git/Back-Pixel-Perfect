import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import RegistrationRequest from '../model/RegistrationRequest.js';
import User from '../../auth/model/User.js';
import { sendWelcomeEmail } from '../../services/emailService.js';

// Génère un mot de passe aléatoire sécurisé (12 caractères)
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from(crypto.randomBytes(12))
    .map(b => chars[b % chars.length])
    .join('');
};

// ─── Soumettre une demande (public) ──────────────────────────────────────────
export const createRequest = async (req, res) => {
  try {
    const { fullName, email, phone = '', department, position } = req.body;

    if (!fullName || !email || !department || !position) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (fullName, email, department, position)' });
    }

    const emailNorm = email.trim().toLowerCase();

    // Vérifier qu'aucune demande n'est déjà en cours pour cet email
    const existingRequest = await RegistrationRequest.findOne({ email: emailNorm });
    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return res.status(409).json({ message: 'Une demande est déjà en attente pour cet email' });
      }
      if (existingRequest.status === 'APPROVED') {
        return res.status(409).json({ message: 'Un compte existe déjà pour cet email' });
      }
      // REJECTED → autoriser une nouvelle demande (mise à jour)
      existingRequest.fullName   = fullName.trim();
      existingRequest.phone      = phone.trim();
      existingRequest.department = department.trim();
      existingRequest.position   = position.trim();
      existingRequest.status     = 'PENDING';
      await existingRequest.save();
      return res.status(200).json({ data: existingRequest.toJSON() });
    }

    // Vérifier qu'aucun compte utilisateur n'existe avec cet email
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà pour cet email' });
    }

    const request = await RegistrationRequest.create({
      fullName: fullName.trim(),
      email: emailNorm,
      phone: phone.trim(),
      department: department.trim(),
      position: position.trim()
    });

    res.status(201).json({ data: request.toJSON() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Une demande existe déjà pour cet email' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Lister les demandes (admin/grh) ─────────────────────────────────────────
export const getAllRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await RegistrationRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ data: requests.map(r => r.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Récupérer une demande par ID (admin/grh) ────────────────────────────────
export const getRequestById = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    res.status(200).json({ data: request.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Approuver une demande → créer le compte (admin) ─────────────────────────
export const approveRequest = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Impossible d'approuver une demande au statut "${request.status}"` });
    }

    // Vérifier qu'aucun compte n'existe déjà
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      request.status = 'APPROVED';
      await request.save();
      return res.status(409).json({ message: 'Un compte existe déjà pour cet email' });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name:       request.fullName,
      email:      request.email,
      phone:      request.phone,
      password:   hashedPassword,
      department: request.department,
      position:   request.position,
      role:       'employee',
      status:     'actif'
    });

    request.status = 'APPROVED';
    await request.save();

    res.status(200).json({ data: { request: request.toJSON(), user: user.toJSON() } });

    // Email non-bloquant
    sendWelcomeEmail({ name: request.fullName, email: request.email, password: plainPassword })
      .catch(err => console.error('[emailService] Échec envoi email approbation:', err.message));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Refuser une demande (admin) ──────────────────────────────────────────────
export const rejectRequest = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Impossible de refuser une demande au statut "${request.status}"` });
    }

    request.status = 'REJECTED';
    await request.save();

    res.status(200).json({ data: request.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
