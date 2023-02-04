const express = require('express');
const router = express.Router();
const controller = require('../controllers/dish');

router.post('/dish', controller.createDish);
router.delete('/dish', controller.deleteDish);

module.exports = router;