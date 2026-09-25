const express = require('express');
const router = express.Router();
const { getPlaces, getPlaceById } = require('../controllers/placeController');

router.get('/', getPlaces);
router.get('/:id', getPlaceById);

module.exports = router;
