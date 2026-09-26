const Trip = require('../models/Trip');

// @desc    Create a new saved trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const {
      title,
      start,
      startLocation,
      destination,
      endLocation,
      availableTime,
      availableTimeBudgetMinutes,
      maxDetour,
      distance,
      totalDistanceKm,
      travelTime,
      totalDurationMinutes,
      totalTripTime,
      preferredCategories,
      vehicleType,
      totalBudget,
      fuelCost,
      foodCost,
      parkingTollCost,
      activityCost,
      otherCost,
      estimatedTotal,
      remainingBudget,
      notes,
      stops,
      routeCoordinates,
    } = req.body;

    const resolvedTitle = title || req.body.tripName || req.body.name || 'My Road Trip';
    let resolvedStart = start || startLocation;
    let resolvedDest = destination || endLocation;

    // Fallback to stops if start/dest are not explicitly provided
    if ((!resolvedStart || !resolvedStart.name) && stops && stops.length > 0) {
      resolvedStart = {
        name: stops[0].name || 'Start Point',
        latitude: stops[0].latitude || 0,
        longitude: stops[0].longitude || 0,
      };
    }

    if ((!resolvedDest || !resolvedDest.name) && stops && stops.length > 0) {
      const lastStop = stops[stops.length - 1];
      resolvedDest = {
        name: lastStop.name || 'Destination',
        latitude: lastStop.latitude || 0,
        longitude: lastStop.longitude || 0,
      };
    }

    if (!resolvedStart || !resolvedDest || !resolvedStart.name || !resolvedDest.name) {
      return res.status(400).json({ message: 'Start location and destination or itinerary stops are required to save a trip.' });
    }

    const resolvedBudget = !isNaN(Number(availableTime || availableTimeBudgetMinutes)) ? Number(availableTime || availableTimeBudgetMinutes) : 480;
    const resolvedDistance = !isNaN(Number(distance || totalDistanceKm)) ? Number(distance || totalDistanceKm) : 0;
    const resolvedTravelTime = !isNaN(Number(travelTime || totalDurationMinutes)) ? Number(travelTime || totalDurationMinutes) : 0;
    const resolvedVehicle = ['car', 'bike', 'bus', 'train', 'flight'].includes(vehicleType) ? vehicleType : 'car';
    const resolvedTravelers = !isNaN(Number(req.body.travelersCount)) && Number(req.body.travelersCount) >= 1 ? Number(req.body.travelersCount) : 1;
    const resolvedTotalBudget = !isNaN(Number(totalBudget)) ? Number(totalBudget) : 5000;
    const resolvedEstimatedTotal = !isNaN(Number(estimatedTotal)) ? Number(estimatedTotal) : 0;
    const resolvedRemaining =
      remainingBudget !== undefined && remainingBudget !== null && !isNaN(Number(remainingBudget))
        ? Number(remainingBudget)
        : resolvedTotalBudget - resolvedEstimatedTotal;

    const trip = await Trip.create({
      userId: req.user._id,
      title: resolvedTitle.trim(),
      start: resolvedStart,
      startLocation: resolvedStart,
      destination: resolvedDest,
      endLocation: resolvedDest,
      availableTime: resolvedBudget,
      availableTimeBudgetMinutes: resolvedBudget,
      maxDetour: maxDetour || 30,
      distance: resolvedDistance,
      totalDistanceKm: resolvedDistance,
      travelTime: resolvedTravelTime,
      totalDurationMinutes: resolvedTravelTime,
      totalTripTime: totalTripTime || resolvedTravelTime,
      preferredCategories: preferredCategories || [],
      vehicleType: resolvedVehicle,
      travelersCount: resolvedTravelers,
      totalBudget: resolvedTotalBudget,
      fuelCost: Number(fuelCost) || 0,
      foodCost: Number(foodCost) || 0,
      parkingTollCost: Number(parkingTollCost) || 0,
      activityCost: Number(activityCost) || 0,
      otherCost: Number(otherCost) || 0,
      estimatedTotal: resolvedEstimatedTotal,
      remainingBudget: resolvedRemaining,
      notes: notes || '',
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
