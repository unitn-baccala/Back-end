const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/user', userController.createUser);
router.delete('/user', userController.deleteUser);

module.exports = router;