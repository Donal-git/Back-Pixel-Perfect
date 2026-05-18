import mongoose from 'mongoose';

// Matches frontend Role + RolePermissions interfaces exactly
const permissionsSchema = new mongoose.Schema(
  {
    survey_create:     { type: Boolean, default: false },
    survey_edit:       { type: Boolean, default: false },
    survey_delete:     { type: Boolean, default: false },
    survey_view_all:   { type: Boolean, default: false },
    personnel_create:  { type: Boolean, default: false },
    personnel_edit:    { type: Boolean, default: false },
    personnel_delete:  { type: Boolean, default: false },
    personnel_view_all:{ type: Boolean, default: false },
    formation_create:  { type: Boolean, default: false },
    formation_edit:    { type: Boolean, default: false },
    formation_delete:  { type: Boolean, default: false },
    formation_view_all:{ type: Boolean, default: false },
    reports_view:      { type: Boolean, default: false },
    settings_edit:     { type: Boolean, default: false },
    roles_edit:        { type: Boolean, default: false },
    departments_edit:  { type: Boolean, default: false }
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    permissions: { type: permissionsSchema, default: () => ({}) },
    userCount:   { type: Number, default: 0 } // computed on-the-fly
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

const Role = mongoose.model('Role', roleSchema);

export default Role;
