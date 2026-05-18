import mongoose from 'mongoose';

// Embedded question schema (matches frontend SurveyQuestion interface)
const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question_text: { type: String, required: true },
    question_type: {
      type: String,
      enum: ['multiple_choice', 'open_text', 'likert', 'checkbox', 'rating'],
      required: true
    },
    options: [{ type: String }],
    is_required: { type: Boolean, default: false }
  },
  { _id: false } // use explicit 'id' field, not Mongoose _id
);

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft'
    },
    questions: [questionSchema],
    sent_to: [{ type: String }], // department names
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

const Survey = mongoose.model('Survey', surveySchema);

export default Survey;
