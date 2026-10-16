const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Group = require('../models/Group');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/users/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/me   (name, email, bio, avatarUrl, y opcionalmente newPassword + currentPassword)
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, email, bio, avatarUrl, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (newPassword) {
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }
    user.password = newPassword;
  }

  await user.save();
  res.json(user);
});

// DELETE /api/users/me   (body: { password })
// Elimina al usuario junto con sus recetas y grupos
exports.deleteMe = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!password || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Debes confirmar con tu contraseña' });
  }

  await Recipe.deleteMany({ owner: user._id });
  await Group.deleteMany({ owner: user._id });
  await user.deleteOne();

  res.json({ message: 'Cuenta eliminada junto con todas tus recetas y grupos' });
});
