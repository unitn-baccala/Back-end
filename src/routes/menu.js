const express = require('express');
const router = express.Router();
const tokenChecker = require('../functions/tokenChecker');
const controller = require('../controllers/menu');

router.post('/menu', tokenChecker, controller.createMenu);
router.delete('/menu', tokenChecker, controller.deleteMenu);

module.exports = router;