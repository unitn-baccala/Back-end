const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient');

router.post('/ingredient', ingredientController.createIngredient);
router.delete('/ingredient', ingredientController.deleteIngredient);

module.exports = router;