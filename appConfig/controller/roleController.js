import Role from '../model/Role.js';
import User from '../../auth/model/User.js';

// Helper: attach live userCount to a role
const withUserCount = async (role) => {
  const userCount = await User.countDocuments({ role: role.name.toLowerCase() });
  const obj = role.toJSON();
  return { ...obj, userCount };
};

// ─── Get all roles ───────────────────────────────────────────────────────────
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    const data = await Promise.all(roles.map(withUserCount));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get role by ID ──────────────────────────────────────────────────────────
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle non trouvé' });
    res.status(200).json({ data: await withUserCount(role) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Create role ─────────────────────────────────────────────────────────────
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });

    const existing = await Role.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Ce rôle existe déjà' });

    const role = await Role.create({ name, description: description || '', permissions: permissions || {} });
    res.status(201).json({ data: await withUserCount(role) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update role (full update, including permissions) ────────────────────────
export const updateRole = async (req, res) => {
  try {
    const allowed = ['name', 'description', 'permissions'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });

    const role = await Role.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!role) return res.status(404).json({ message: 'Rôle non trouvé' });
    res.status(200).json({ data: await withUserCount(role) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Toggle one permission ────────────────────────────────────────────────────
export const updateRolePermission = async (req, res) => {
  try {
    const { permission, value } = req.body;
    if (typeof permission !== 'string' || typeof value !== 'boolean') {
      return res.status(400).json({ message: 'permission (string) et value (boolean) requis' });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { [`permissions.${permission}`]: value },
      { new: true }
    );
    if (!role) return res.status(404).json({ message: 'Rôle non trouvé' });
    res.status(200).json({ data: await withUserCount(role) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete role ─────────────────────────────────────────────────────────────
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle non trouvé' });
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
