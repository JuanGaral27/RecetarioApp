const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El ingrediente necesita nombre'], trim: true },
    quantity: { type: Number, min: 0 },
    unit: { type: String, trim: true, default: '' }, // g, ml, tazas, unidades...
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 120 },
    // Título normalizado para garantizar unicidad sin importar mayúsculas/espacios
    titleNormalized: { type: String, index: true },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    ingredients: {
      type: [ingredientSchema],
      validate: [(v) => v.length > 0, 'Debe tener al menos un ingrediente'],
    },
    steps: {
      type: [{ type: String, trim: true }],
      validate: [(v) => v.length > 0, 'Debe tener al menos un paso'],
    },
    prepTimeMinutes: { type: Number, min: 0, default: 0 },
    cookTimeMinutes: { type: Number, min: 0, default: 0 },
    servings: { type: Number, min: 1, default: 1 },
    difficulty: { type: String, enum: ['facil', 'media', 'dificil'], default: 'facil' },
    category: { type: String, trim: true, default: '' }, // desayuno, postre, etc.
    imageUrl: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    // false = personal (solo el dueño la ve) | true = pública (aparece en "recetas en general")
    isPublic: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Una receta puede pertenecer a múltiples grupos
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  },
  { timestamps: true }
);

// Un mismo usuario no puede repetir título
recipeSchema.index({ owner: 1, titleNormalized: 1 }, { unique: true });

recipeSchema.pre('validate', function (next) {
  if (this.title) this.titleNormalized = this.title.trim().toLowerCase();
  next();
});

recipeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.titleNormalized;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Recipe', recipeSchema);
