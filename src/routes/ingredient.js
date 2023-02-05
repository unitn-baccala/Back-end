const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredient');

router.post('/ingredient', controller.createIngredient);
router.delete('/ingredient', controller.deleteIngredient);
router.get('/ingredient', controller.getIngredients);

module.exports = router;