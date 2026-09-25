const Trip = require('../models/Trip');

// @desc    Create a new saved trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const {
      title,
      start,
      destination,
      availableTime,
      maxDetour,
      distance,
      travelTime,
      totalTripTime,
      preferredCategories,
      stops,
      routeCoordinates,
    } = req.body;

    if (!title || !start || !destination || !availableTime) {
      return res.status(400).json({ message: 'Title, start, destination, and availableTime are required.' });
    }

    const trip = await Trip.create({
      userId: req.user._id,
      title,
      start,
      destination,
      availableTime,
      maxDetour: maxDetour || 15,
      distance: distance || 0,
      travelTime: travelTime || 0,
      totalTripTime: totalTripTime || 0,
      preferredCategories: preferredCategories || [],
      stops: stops || [],
      routeCoordinates: routeCoordinates || [],
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('[TripController.createTrip] Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating trip.' });
  }
};

// @desc    Get all trips for current user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('[TripController.getTrips] Error:', error);
    res.status(500).json({ message: 'Server error retrieving trips.' });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Ensure user owns this trip
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this trip.' });
    }

    res.json(trip);
  } catch (error) {
    console.error('[TripController.getTripById] Error:', error);
    res.status(500).json({ message: 'Server error retrieving trip details.' });
  }
};

// @desc    Update an existing trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip.' });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedTrip);
  } catch (error) {
    console.error('[TripController.updateTrip] Error:', error);
    res.status(500).json({ message: 'Server error updating trip.' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this trip.' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip removed successfully.' });
  } catch (error) {
    console.error('[TripController.deleteTrip] Error:', error);
    res.status(500).json({ message: 'Server error deleting trip.' });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};
