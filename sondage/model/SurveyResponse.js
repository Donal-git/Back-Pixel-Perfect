import mongoose from 'mongoose';

// Matches frontend SurveyResponse interface
const surveyResponseSchema = new mongoose.Schema(
  {
    survey_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // answers: { questionId: answerValue }
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    submitted_at: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id          = ret._id.toString();
        ret.survey_id   = ret.survey_id?.toString();
        ret.employee_id = ret.employee_id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// One response per employee per survey
surveyResponseSchema.index({ survey_id: 1, employee_id: 1 }, { unique: true });

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

export default SurveyResponse;
