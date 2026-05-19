import Survey from '../model/Survey.js';

// ─── Get all surveys ─────────────────────────────────────────────────────────
export const getAllSurveys = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    // Ensure authenticated (defensive) — routes should already ensure it
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Employees only see active surveys
    const userRole = req.user.role;
    if (userRole === 'employee') {
      filter.status = 'active';
    } else if (status) {
      filter.status = status;
    }

    const surveys = await Survey.find(filter).sort({ created_at: -1 });
    res.status(200).json({ data: surveys.map(s => s.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get survey by ID ────────────────────────────────────────────────────────
export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Sondage non trouvé' });
    res.status(200).json({ data: survey.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Create survey ───────────────────────────────────────────────────────────
export const createSurvey = async (req, res) => {
  try {
    const { title, description, isAnonymous, questions, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Le titre est requis' });

    const survey = await Survey.create({
      title,
      description: description || '',
      isAnonymous: !!isAnonymous,
      questions: questions || [],
      status: status || 'draft',
      sent_to: [],
      createdBy: req.user.id
    });

    res.status(201).json({ data: survey.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update survey ───────────────────────────────────────────────────────────
export const updateSurvey = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'isAnonymous', 'questions', 'status'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });

    const survey = await Survey.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    if (!survey) return res.status(404).json({ message: 'Sondage non trouvé' });
    res.status(200).json({ data: survey.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete survey ───────────────────────────────────────────────────────────
export const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Sondage non trouvé' });
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Send survey to departments (activates it) ───────────────────────────────
export const sendSurvey = async (req, res) => {
  try {
    const { departments } = req.body;
    if (!Array.isArray(departments)) {
      return res.status(400).json({ message: 'departments requis (tableau)' });
    }

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status: 'active', sent_to: departments },
      { new: true }
    );
    if (!survey) return res.status(404).json({ message: 'Sondage non trouvé' });
    res.status(200).json({ data: survey.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
