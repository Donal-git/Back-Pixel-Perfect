import Formation from '../model/Formation.js';
import FormationRegistration from '../model/FormationRegistration.js';

// ─── Get all formations ──────────────────────────────────────────────────────
export const getAllFormations = async (req, res) => {
  try {
    const { status, category, term } = req.query;
    const filter = {};

    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (term && term.trim()) {
      const re = { $regex: term.trim(), $options: 'i' };
      filter.$or = [{ title: re }, { description: re }];
    }

    const formations = await Formation.find(filter).sort({ created_at: -1 });
    res.status(200).json({ data: formations.map(f => f.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get formation by ID ─────────────────────────────────────────────────────
export const getFormationById = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.status(200).json({ data: formation.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Create formation ────────────────────────────────────────────────────────
export const createFormation = async (req, res) => {
  try {
    const { title, description, category, duration, level, status, departments, participants } = req.body;
    if (!title || !duration) {
      return res.status(400).json({ message: 'Titre et durée sont requis' });
    }

    const formation = await Formation.create({
      title,
      description: description || '',
      category:    category    || 'Autre',
      duration,
      level:       level       || 'débutant',
      status:      status      || 'disponible',
      departments: departments || [],
      participants: participants || 0,
      createdBy: req.user.id
    });

    res.status(201).json({ data: formation.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update formation ────────────────────────────────────────────────────────
export const updateFormation = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'category', 'duration', 'level', 'status', 'departments', 'participants'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });

    const formation = await Formation.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.status(200).json({ data: formation.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete formation ────────────────────────────────────────────────────────
export const deleteFormation = async (req, res) => {
  try {
    const formation = await Formation.findByIdAndDelete(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    // Clean up registrations
    await FormationRegistration.deleteMany({ formation_id: req.params.id });
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
