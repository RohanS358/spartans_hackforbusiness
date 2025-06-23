// routes/creditRoutes.js
const express = require('express');
const { 
  purchaseCredits, 
  spendCredits, 
  getUserCredits, 
  getBusinessCredits 
} = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/purchase', protect, purchaseCredits);
router.post('/spend', protect, spendCredits);
router.get('/', protect, getUserCredits);
router.get('/business/:businessId', protect, getBusinessCredits);

module.exports = router;
