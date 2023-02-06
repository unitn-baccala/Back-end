const express = require('express');
const router = express.Router();
const controller = require('../controllers/menu');
const tokenChecker = require('../functions/tokenChecker')

router.post('/menu', tokenChecker, controller.createMenu);
router.delete('/menu', tokenChecker, controller.deleteMenu);
router.get('/menu', controller.getMenues);

module.exports = router;