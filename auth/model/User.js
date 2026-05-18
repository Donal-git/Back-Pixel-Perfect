import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'grh', 'employee'],
      default: 'employee'
    },
    status: {
      type: String,
      enum: ['actif', 'inactif'],
      default: 'actif'
    }
  },
  {
    timestamps: { createdAt: 'registeredAt', updatedAt: 'updatedAt' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

const User = mongoose.model('User', userSchema);

export default User;
