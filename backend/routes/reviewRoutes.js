const express = require('express');
const router = express.Router();
const { createReview, getReviewsByPlace } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/:placeId', getReviewsByPlace);

module.exports = router;
