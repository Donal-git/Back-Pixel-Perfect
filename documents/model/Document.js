import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: { type: String, required: true },       // nom d'affichage (original)
    type: {
      type: String,
      enum: ['contrat', 'diplome', 'attestation', 'bulletin_salaire', 'piece_identite', 'autre'],
      required: true
    },
    mimetype: { type: String, required: true },
    filename: { type: String, required: true },   // nom stocké sur disque
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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

const Document = mongoose.model('Document', documentSchema);

export default Document;
