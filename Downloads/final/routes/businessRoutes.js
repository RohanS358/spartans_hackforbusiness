// routes/businessRoutes.js
const express = require('express');
const { register, login, getMe, getAllBusinesses } = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/all', getAllBusinesses);  // Public endpoint for listing all businesses
router.get('/', protect, authorize('business'), getMe);

module.exports = router;