const express = require('express');
const router = express.Router();
const controller = require('../controllers/category');
const tokenChecker = require('../functions/tokenChecker')

router.post('/category', tokenChecker, controller.createCategory);
router.delete('/category', tokenChecker, controller.deleteCategory);
router.get('/category', tokenChecker, controller.getCategories);

module.exports = router;