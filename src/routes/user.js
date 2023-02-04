const express = require('express');
const router = express.Router();
const controller = require('../controllers/user');

router.post('/user', controller.createUser);
router.delete('/user', controller.deleteUser);

module.exports = router;