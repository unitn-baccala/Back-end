const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredient');

router.post('/ingredient', controller.createIngredient);
router.delete('/ingredient', controller.deleteIngredient);

module.exports = router;