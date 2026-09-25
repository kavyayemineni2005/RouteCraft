const Review = require('../models/Review');

// @desc    Add review for a pitstop/place
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;

    if (!placeId || !rating || !comment) {
      return res.status(400).json({ message: 'placeId, rating, and comment are required.' });
    }

    const review = await Review.create({
      userId: req.user._id,
      placeId,
      rating: Number(rating),
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate('userId', 'name email');
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('[ReviewController.createReview] Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating review.' });
  }
};

// @desc    Get reviews for a place
// @route   GET /api/reviews/:placeId
// @access  Public
const getReviewsByPlace = async (req, res) => {
  try {
    const reviews = await Review.find({ placeId: req.params.placeId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('[ReviewController.getReviewsByPlace] Error:', error);
    res.status(500).json({ message: 'Server error retrieving reviews.' });
  }
};

module.exports = {
  createReview,
  getReviewsByPlace,
};
