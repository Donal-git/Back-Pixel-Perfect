import AppConfig from '../model/AppConfig.js';

// ─── Get config (singleton) ──────────────────────────────────────────────────
export const getConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) {
      config = await AppConfig.create({});
    }
    res.status(200).json({ data: config.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update config (upsert singleton) ────────────────────────────────────────
export const updateConfig = async (req, res) => {
  try {
    const allowed = [
      'companyName', 'maxSurveysPerMonth', 'allowAnonymousSurveys',
      'requireEmailVerification', 'sessionTimeout', 'maxLoginAttempts'
    ];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });

    const config = await AppConfig.findOneAndUpdate(
      {},
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ data: config.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
