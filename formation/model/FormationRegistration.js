import mongoose from 'mongoose';

// Matches frontend FormationRegistration interface exactly
const registrationSchema = new mongoose.Schema(
  {
    formation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      required: true
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['inscrit', 'en_cours', 'complété'],
      default: 'inscrit'
    },
    completion_date: { type: Date }
  },
  {
    timestamps: { createdAt: 'registered_at', updatedAt: 'updatedAt' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id           = ret._id.toString();
        ret.formation_id = ret.formation_id?.toString();
        ret.employee_id  = ret.employee_id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// One registration per employee per formation
registrationSchema.index({ formation_id: 1, employee_id: 1 }, { unique: true });

const FormationRegistration = mongoose.model('FormationRegistration', registrationSchema);

export default FormationRegistration;
