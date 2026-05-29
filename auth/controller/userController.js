import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendWelcomeEmail } from '../../services/emailService.js';

dotenv.config();

// ─── Register (create personnel member) ─────────────────────────────────────
export const registerUser = async (req, res) => {
  const { username, name, email, phone = '', password: plainPassword, department, poste, position, role, status } = req.body;
  const resolvedName = name || username;
  const resolvedPosition = position || poste;

  try {
    if (!resolvedName || !email || !plainPassword || !department || !resolvedPosition) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name: resolvedName,
      email,
      phone,
      password: hashedPassword,
      department,
      position: resolvedPosition,
      role: role || 'employee',
      status: status || 'actif'
    });

    res.status(201).json({ data: true, user: user.toJSON() });

    // Send welcome email without blocking the response
    sendWelcomeEmail({ name: resolvedName, email, password: plainPassword }).catch((err) => {
      console.error('[emailService] Échec envoi email de bienvenue:', err.message);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.status === 'inactif') {
      return res.status(403).json({ message: 'Compte désactivé', code: 'ACCOUNT_DISABLED' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all users (paginated + filtered) ────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const { term, role, department, status, position } = req.query;

    const filter = {};

    if (term && term.trim()) {
      const re = { $regex: term.trim(), $options: 'i' };
      filter.$or = [
        { name: re },
        { email: re },
        { department: re },
        { position: re },
        { phone: re }
      ];
    }
    if (role)       filter.role       = role;
    if (department) filter.department = department;
    if (status)     filter.status     = status;
    if (position)   filter.position   = position;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ registeredAt: -1 }),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      data: users.map(u => u.toJSON()),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get user by ID ──────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update user ─────────────────────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.email; // email change not allowed via this route

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Toggle status (actif ↔ inactif) ─────────────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.status = user.status === 'actif' ? 'inactif' : 'actif';
    await user.save();

    res.status(200).json({ data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete user ──────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
