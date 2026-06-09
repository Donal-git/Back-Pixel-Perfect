import mongoose from 'mongoose';

const registrationRequestSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:      { type: String, default: '' },
    department: { type: String, required: true, trim: true },
    position:   { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    }
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

const RegistrationRequest = mongoose.model('RegistrationRequest', registrationRequestSchema);

export default RegistrationRequest;
