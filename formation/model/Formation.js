import mongoose from 'mongoose';

// Matches frontend Formation interface exactly
const formationSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Informatique', 'Management', 'Soft Skills', 'Technique', 'Sécurité', 'Juridique', 'Finance', 'Autre'],
      default: 'Autre'
    },
    duration:    { type: String, required: true }, // e.g. '2 jours'
    level: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé'],
      default: 'débutant'
    },
    status: {
      type: String,
      enum: ['brouillon', 'disponible', 'en_cours', 'terminée'],
      default: 'disponible'
    },
    departments: [{ type: String }],
    participants: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updatedAt' },
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

const Formation = mongoose.model('Formation', formationSchema);

export default Formation;
