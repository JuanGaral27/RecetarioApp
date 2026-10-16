const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, bio, avatarUrl } = req.body;
  const user = await User.create({ name, email, password, bio, avatarUrl });
  res.status(201).json({ user, token: signToken(user._id) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }
  res.json({ user, token: signToken(user._id) });
});
