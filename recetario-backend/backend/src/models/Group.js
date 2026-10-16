const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El nombre del grupo es obligatorio'], trim: true, maxlength: 80 },
    nameNormalized: { type: String },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

groupSchema.index({ owner: 1, nameNormalized: 1 }, { unique: true });

groupSchema.pre('validate', function (next) {
  if (this.name) this.nameNormalized = this.name.trim().toLowerCase();
  next();
});

groupSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.nameNormalized;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Group', groupSchema);
