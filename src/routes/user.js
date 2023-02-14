const express = require('express');
const tokenChecker = require('../functions/tokenChecker');
const router = express.Router();
const controller = require('../controllers/user');

router.post('/user', controller.createUser);
router.post('/user/login', controller.authenticateUser);
router.delete('/user', tokenChecker, controller.deleteUser);
router.get('/user', tokenChecker, controller.getUser);

module.exports = router;