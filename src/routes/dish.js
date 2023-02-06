const express = require('express');
const router = express.Router();
const controller = require('../controllers/dish');

router.post('/dish', tokenChecker, controller.createDish);
router.delete('/dish', tokenChecker, controller.deleteDish);

module.exports = router;