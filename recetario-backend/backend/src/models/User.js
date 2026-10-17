const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Las reglas de formato solo se aplican cuando el campo es nuevo o cambia.
// (Así un usuario ya existente puede editar su perfil aunque su clave ya esté cifrada.)
const whenChanged = (path, test) =>
  function (value) {
    return this.isNew || this.isModified(path) ? test(value) : true;
  };

const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]+(?<!\.)@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      validate: [
        { validator: whenChanged('name', (v) => v.length >= 4), message: 'El nombre debe tener al menos 4 caracteres' },
        { validator: whenChanged('name', (v) => v.length <= 20), message: 'El nombre no puede pasar de 20 caracteres' },
      ],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        { validator: whenChanged('email', (v) => v.length <= 100), message: 'El correo no puede pasar de 100 caracteres' },
        { validator: whenChanged('email', (v) => EMAIL_REGEX.test(v)), message: 'Correo no válido (ejemplo: nombre@empresa.com)' },
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      validate: [
        { validator: whenChanged('password', (v) => v.length >= 6), message: 'La contraseña debe tener al menos 6 caracteres' },
        { validator: whenChanged('password', (v) => v.length <= 14), message: 'La contraseña no puede pasar de 14 caracteres' },
      ],
      select: false,
    },
    bio: { type: String, trim: true, maxlength: 300, default: '' },
    avatarUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);