const express = require('express');
const tokenChecker = require('../functions/tokenChecker');
const router = express.Router();
const controller = require('../controllers/user');

router.post('/user', controller.createUser);
router.delete('/user', /*tokenChecker,*/ controller.deleteUser);

module.exports = router;