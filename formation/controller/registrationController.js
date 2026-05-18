import Formation from '../model/Formation.js';
import FormationRegistration from '../model/FormationRegistration.js';

// ─── Register current user for a formation ───────────────────────────────────
export const registerForFormation = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

    const exists = await FormationRegistration.findOne({
      formation_id: req.params.id,
      employee_id: req.user.id
    });
    if (exists) return res.status(400).json({ message: 'Déjà inscrit à cette formation' });

    const reg = await FormationRegistration.create({
      formation_id: req.params.id,
      employee_id: req.user.id,
      status: 'inscrit'
    });

    // Increment participant count
    await Formation.findByIdAndUpdate(req.params.id, { $inc: { participants: 1 } });

    res.status(201).json({ data: reg.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Unregister current user ─────────────────────────────────────────────────
export const unregisterFromFormation = async (req, res) => {
  try {
    const reg = await FormationRegistration.findOneAndDelete({
      formation_id: req.params.id,
      employee_id: req.user.id
    });
    if (!reg) return res.status(404).json({ message: 'Inscription non trouvée' });

    await Formation.findByIdAndUpdate(req.params.id, { $inc: { participants: -1 } });
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Check if current user is registered ────────────────────────────────────
export const checkRegistration = async (req, res) => {
  try {
    const exists = await FormationRegistration.findOne({
      formation_id: req.params.id,
      employee_id: req.user.id
    });
    res.status(200).json({ data: exists ? exists.toJSON() : null, isRegistered: !!exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all registrations for a formation (admin/grh) ───────────────────────
export const getFormationRegistrations = async (req, res) => {
  try {
    const regs = await FormationRegistration.find({ formation_id: req.params.id });
    res.status(200).json({ data: regs.map(r => r.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get formations registered by current user ───────────────────────────────
export const getMyFormations = async (req, res) => {
  try {
    const regs = await FormationRegistration.find({ employee_id: req.user.id });
    const formationIds = regs.map(r => r.formation_id);
    const formations = await Formation.find({ _id: { $in: formationIds } });
    res.status(200).json({ data: formations.map(f => f.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update registration status (admin/grh) ───────────────────────────────────
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['inscrit', 'en_cours', 'complété'].includes(status)) {
      return res.status(400).json({ message: "Status invalide" });
    }

    const updates = { status };
    if (status === 'complété') updates.completion_date = new Date();

    const reg = await FormationRegistration.findByIdAndUpdate(
      req.params.regId, updates, { new: true }
    );
    if (!reg) return res.status(404).json({ message: 'Inscription non trouvée' });
    res.status(200).json({ data: reg.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
