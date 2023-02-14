const express = require('express');
const router = express.Router();
const tokenChecker = require('../functions/tokenChecker');
const controller = require('../controllers/ingredient');

router.post('/ingredient', tokenChecker, controller.createIngredient);
router.delete('/ingredient', tokenChecker, controller.deleteIngredient);
router.get('/ingredient', tokenChecker, controller.getIngredients);

module.exports = router;