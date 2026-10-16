const Group = require('../models/Group');
const Recipe = require('../models/Recipe');
const asyncHandler = require('../middleware/asyncHandler');

const COLLATION = { locale: 'es', strength: 2 };

const findOwnGroup = async (id, userId) => Group.findOne({ _id: id, owner: userId });

// POST /api/groups
exports.createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const group = await Group.create({ name, description, owner: req.user._id });
  res.status(201).json(group);
});

// GET /api/groups  (ordenados alfabéticamente, con cantidad de recetas)
exports.getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ owner: req.user._id }).collation(COLLATION).sort({ name: 1 });

  const counts = await Recipe.aggregate([
    { $match: { owner: req.user._id, groups: { $in: groups.map((g) => g._id) } } },
    { $unwind: '$groups' },
    { $group: { _id: '$groups', total: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));

  res.json(groups.map((g) => ({ ...g.toJSON(), recipeCount: countMap[String(g._id)] || 0 })));
});

// GET /api/groups/:id  (incluye sus recetas ordenadas alfabéticamente)
exports.getGroup = asyncHandler(async (req, res) => {
  const group = await findOwnGroup(req.params.id, req.user._id);
  if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

  const recipes = await Recipe.find({ owner: req.user._id, groups: group._id })
    .collation(COLLATION)
    .sort({ title: 1 });

  res.json({ ...group.toJSON(), recipes });
});

// PUT /api/groups/:id
exports.updateGroup = asyncHandler(async (req, res) => {
  const group = await findOwnGroup(req.params.id, req.user._id);
  if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

  if (req.body.name !== undefined) group.name = req.body.name;
  if (req.body.description !== undefined) group.description = req.body.description;
  await group.save();
  res.json(group);
});

// DELETE /api/groups/:id
// Sin ?confirm=true -> informa cuántas recetas se borrarán (409) y NO borra nada.
// Con ?confirm=true -> borra el grupo y las recetas asociadas a él.
exports.deleteGroup = asyncHandler(async (req, res) => {
  const group = await findOwnGroup(req.params.id, req.user._id);
  if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

  const recipes = await Recipe.find({ owner: req.user._id, groups: group._id }, 'title');

  if (req.query.confirm !== 'true') {
    return res.status(409).json({
      message: `Al borrar el grupo "${group.name}" también se borrarán ${recipes.length} receta(s). Repite la petición con ?confirm=true para confirmar.`,
      recipesToDelete: recipes.map((r) => ({ _id: r._id, title: r.title })),
    });
  }

  await Recipe.deleteMany({ _id: { $in: recipes.map((r) => r._id) } });
  await group.deleteOne();

  res.json({ message: `Grupo eliminado junto con ${recipes.length} receta(s)` });
});

// POST /api/groups/:id/recipes/:recipeId  -> agrega una receta al grupo
exports.addRecipeToGroup = asyncHandler(async (req, res) => {
  const group = await findOwnGroup(req.params.id, req.user._id);
  if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

  const recipe = await Recipe.findOneAndUpdate(
    { _id: req.params.recipeId, owner: req.user._id },
    { $addToSet: { groups: group._id } },
    { new: true }
  );
  if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
  res.json(recipe);
});

// DELETE /api/groups/:id/recipes/:recipeId  -> saca la receta del grupo (NO la borra)
exports.removeRecipeFromGroup = asyncHandler(async (req, res) => {
  const group = await findOwnGroup(req.params.id, req.user._id);
  if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

  const recipe = await Recipe.findOneAndUpdate(
    { _id: req.params.recipeId, owner: req.user._id },
    { $pull: { groups: group._id } },
    { new: true }
  );
  if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
  res.json({ message: 'La receta quedó fuera del grupo', recipe });
});
