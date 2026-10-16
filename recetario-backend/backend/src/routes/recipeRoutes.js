const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/recipeController');

router.use(auth);

router.get('/mine', c.getMyRecipes);   // personales (debe ir antes de /:id)
router.get('/', c.getPublicRecipes);   // generales (públicas)
router.post('/', c.createRecipe);
router.get('/:id', c.getRecipe);
router.put('/:id', c.updateRecipe);
router.delete('/:id', c.deleteRecipe);

module.exports = router;
