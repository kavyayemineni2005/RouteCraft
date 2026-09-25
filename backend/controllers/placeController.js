const Place = require('../models/Place');

// @desc    Get all places with optional category and search query filters
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const places = await Place.find(filter).limit(50);
    res.json(places);
  } catch (error) {
    console.error('[PlaceController.getPlaces] Error:', error);
    res.status(500).json({ message: 'Server error fetching places.' });
  }
};

// @desc    Get single place details by ID
// @route   GET /api/places/:id
// @access  Public
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }
    res.json(place);
  } catch (error) {
    console.error('[PlaceController.getPlaceById] Error:', error);
    res.status(500).json({ message: 'Server error retrieving place.' });
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
};
