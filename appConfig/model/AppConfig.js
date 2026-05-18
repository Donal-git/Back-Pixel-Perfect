import mongoose from 'mongoose';

// Singleton config document — only one record in this collection
const appConfigSchema = new mongoose.Schema(
  {
    companyName:              { type: String, default: 'Entreprise RH' },
    maxSurveysPerMonth:       { type: Number, default: 10 },
    allowAnonymousSurveys:    { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    sessionTimeout:           { type: Number, default: 30 },
    maxLoginAttempts:         { type: Number, default: 5 }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

export default AppConfig;
