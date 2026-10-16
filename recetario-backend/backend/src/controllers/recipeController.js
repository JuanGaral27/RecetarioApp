const Recipe = require('../models/Recipe');
const Group = require('../models/Group');
const asyncHandler = require('../middleware/asyncHandler');

const COLLATION = { locale: 'es', strength: 2 }; // orden alfabético sin distinguir mayúsculas/tildes

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Verifica que todos los grupos enviados pertenezcan al usuario
const validateGroups = async (groupIds, userId) => {
  if (!groupIds || groupIds.length === 0) return;
  const count = await Group.countDocuments({ _id: { $in: groupIds }, owner: userId });
  if (count !== new Set(groupIds.map(String)).size) {
    const err = new Error('Uno o más grupos no existen o no te pertenecen');
    err.status = 400;
    throw err;
  }
};

const pickFields = (body) => {
  const allowed = [
    'title', 'description', 'ingredients', 'steps', 'prepTimeMinutes', 'cookTimeMinutes',
    'servings', 'difficulty', 'category', 'imageUrl', 'notes', 'isPublic', 'groups',
  ];
  const data = {};
  allowed.forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  return data;
};

// POST /api/recipes
exports.createRecipe = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);
  await validateGroups(data.groups, req.user._id);
  const recipe = await Recipe.create({ ...data, owner: req.user._id });
  res.status(201).json(recipe);
});

// GET /api/recipes/mine  -> Vista de recetas PERSONALES (?search=&group=&category=)
exports.getMyRecipes = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.search) filter.title = new RegExp(escapeRegex(req.query.search), 'i');
  if (req.query.group) filter.groups = req.query.group;
  if (req.query.category) filter.category = req.query.category;

  const recipes = await Recipe.find(filter)
    .collation(COLLATION)
    .sort({ title: 1 })
    .populate('groups', 'name');
  res.json(recipes);
});

// GET /api/recipes  -> Vista de recetas EN GENERAL (públicas de todos los usuarios)
exports.getPublicRecipes = asyncHandler(async (req, res) => {
  const filter = { isPublic: true };
  if (req.query.search) filter.title = new RegExp(escapeRegex(req.query.search), 'i');
  if (req.query.category) filter.category = req.query.category;

  const recipes = await Recipe.find(filter)
    .collation(COLLATION)
    .sort({ title: 1 })
    .populate('owner', 'name avatarUrl');
  res.json(recipes);
});

// GET /api/recipes/:id
exports.getRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('owner', 'name avatarUrl')
    .populate('groups', 'name');
  if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });

  const isOwner = String(recipe.owner._id) === String(req.user._id);
  if (!isOwner && !recipe.isPublic) {
    return res.status(403).json({ message: 'No tienes acceso a esta receta' });
  }
  res.json(recipe);
});

// PUT /api/recipes/:id
exports.updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.user._id });
  if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });

  const data = pickFields(req.body);
  await validateGroups(data.groups, req.user._id);

  Object.assign(recipe, data);
  await recipe.save(); // dispara validaciones y unicidad de título
  res.json(recipe);
});

// DELETE /api/recipes/:id  -> elimina la receta definitivamente
exports.deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
  res.json({ message: 'Receta eliminada' });
});
