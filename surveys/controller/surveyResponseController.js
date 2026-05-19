import SurveyResponse from '../model/SurveyResponse.js';
import Survey from '../model/Survey.js';

// ─── Submit or save draft response ───────────────────────────────────────────
export const upsertResponse = async (req, res) => {
  try {
    const { id: survey_id } = req.params;
    const employee_id = req.user.id;
    const { answers, status = 'submitted' } = req.body;

    if (!['draft', 'submitted'].includes(status)) {
      return res.status(400).json({ message: "status doit être 'draft' ou 'submitted'" });
    }

    const survey = await Survey.findById(survey_id);
    if (!survey) return res.status(404).json({ message: 'Sondage non trouvé' });

    const response = await SurveyResponse.findOneAndUpdate(
      { survey_id, employee_id },
      { answers: answers || {}, status, submitted_at: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ data: response.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get my response for a survey ────────────────────────────────────────────
export const getMyResponse = async (req, res) => {
  try {
    const response = await SurveyResponse.findOne({
      survey_id: req.params.id,
      employee_id: req.user.id
    });
    res.status(200).json({ data: response ? response.toJSON() : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all responses for a survey (admin/grh) ───────────────────────────────
export const getSurveyResponses = async (req, res) => {
  try {
    const responses = await SurveyResponse.find({ survey_id: req.params.id });
    res.status(200).json({ data: responses.map(r => r.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all responses from the connected employee ───────────────────────────
export const getEmployeeResponses = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { employee_id: req.user.id };
    if (status) filter.status = status;

    const responses = await SurveyResponse.find(filter);
    res.status(200).json({ data: responses.map(r => r.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
