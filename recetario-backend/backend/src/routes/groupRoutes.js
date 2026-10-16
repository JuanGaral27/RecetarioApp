const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/groupController');

router.use(auth);

router.route('/').get(c.getGroups).post(c.createGroup);
router.route('/:id').get(c.getGroup).put(c.updateGroup).delete(c.deleteGroup);
router.post('/:id/recipes/:recipeId', c.addRecipeToGroup);
router.delete('/:id/recipes/:recipeId', c.removeRecipeFromGroup);

module.exports = router;
