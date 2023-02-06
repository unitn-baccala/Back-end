const express = require('express');
const router = express.Router();
const controller = require('../controllers/dish');
const tokenChecker = require('../functions/tokenChecker')

router.post('/dish', tokenChecker, controller.createDish);
router.delete('/dish', tokenChecker, controller.deleteDish);
router.get('/dish', controller.getDishes);

module.exports = router;