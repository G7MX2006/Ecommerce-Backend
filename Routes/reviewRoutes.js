const express = require('express');
const {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
  canUserReviewProduct,
} = require('../Controllers/review');
const { auth } = require('../Middlewares/auth');

const router = express.Router();

// NOTE: Specific paths must come before '/:id'
router.get('/', getAllReviews);
router.get('/can-review/:productId', auth, canUserReviewProduct);
router.get('/product/:productId', getReviewsByProduct);
router.get('/:id', getReviewById);
router.post('/', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
