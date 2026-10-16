const router = require('express').Router();
const auth = require('../middleware/auth');
const { getMe, updateMe, deleteMe } = require('../controllers/userController');

router.use(auth);
router.route('/me').get(getMe).put(updateMe).delete(deleteMe);

module.exports = router;
