const { geocodeLocation, searchSuggestions, reverseGeocode } = require('../services/geocodingService');
const { calculateRoute, calculateHaversineDistance } = require('../services/routingService');
const { discoverPitstops } = require('../services/pitstopService');

// @desc    Geocode a location query string to coordinates
// @route   POST /api/route/geocode
// @access  Public
const geocode = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required for geocoding.' });
    }

    const location = await geocodeLocation(query);
    res.json(location);
  } catch (error) {
    console.error('[RouteController.geocode] Error:', error.message);
    res.status(400).json({ message: error.message || 'Failed to geocode location.' });
  }
};

// @desc    Search location suggestions for autocomplete
// @route   GET /api/route/autocomplete or POST /api/route/autocomplete
// @access  Public
const autocomplete = async (req, res) => {
  try {
    const query = req.query.query || req.body.query;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const suggestions = await searchSuggestions(query);
    res.json(suggestions);
  } catch (error) {
    console.error('[RouteController.autocomplete] Error:', error.message);
    res.json([]);
  }
};

// @desc    Reverse geocode coordinates to location address/name
// @route   POST /api/route/reverse
// @access  Public
const reverse = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const location = await reverseGeocode(latitude, longitude);
    res.json(location);
  } catch (error) {
    console.error('[RouteController.reverse] Error:', error.message);
    res.status(400).json({ message: error.message || 'Failed to reverse geocode coordinate.' });
  }
};

// @desc    Calculate route across ordered waypoints for various travel modes
// @route   POST /api/route/calculate
// @access  Public
const calculate = async (req, res) => {
  try {
    const { points, vehicleType, travelersCount } = req.body;

    if (!points || !Array.isArray(points) || points.length < 2) {
      return res.status(400).json({
        message: 'Points array with at least start and destination is required.',
      });
    }

    const routeData = await calculateRoute(
      points,
      vehicleType || 'car',
      Number(travelersCount) || 1
    );
    res.json(routeData);
  } catch (error) {
    console.error('[RouteController.calculate] Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to calculate route.' });
  }
};

// @desc    Discover nearby pitstops and filter by max detour time
// @route   POST /api/route/pitstops
// @access  Public
const getPitstops = async (req, res) => {
  try {
    const {
      routeCoordinates,
      preferredCategories,
      maxDetourMinutes,
      mainRouteDurationMinutes,
      startPoint,
      destPoint,
    } = req.body;

    if (!routeCoordinates || !Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
      return res.status(400).json({
        message: 'routeCoordinates array is required to discover pitstops.',
      });
    }

    const pitstops = await discoverPitstops({
      routeCoordinates,
      preferredCategories: preferredCategories || [],
      maxDetourMinutes: Number(maxDetourMinutes) || 30,
      mainRouteDurationMinutes: Number(mainRouteDurationMinutes) || 120,
      startPoint,
      destPoint,
    });

    res.json(pitstops);
  } catch (error) {
    console.error('[RouteController.pitstops] Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to discover pitstops.' });
  }
};

// @desc    Calculate detour time for a specific pitstop
// @route   POST /api/route/detour
// @access  Public
const calculateDetour = async (req, res) => {
  try {
    const { startPoint, pitstop, destPoint, mainRouteDurationMinutes, vehicleType, travelersCount } = req.body;

    if (!startPoint || !pitstop || !destPoint) {
      return res.status(400).json({ message: 'startPoint, pitstop, and destPoint are required.' });
    }

    const pointsVia = [startPoint, pitstop, destPoint];
    const routeVia = await calculateRoute(pointsVia, vehicleType || 'car', travelersCount || 1);

    const baseDuration = Number(mainRouteDurationMinutes) || 0;
    const detourMinutes = Math.max(0, routeVia.duration - baseDuration);

    res.json({
      detourMinutes,
      routeWithPitstopDuration: routeVia.duration,
      additionalDistanceKm: routeVia.distance,
      vehicleType: vehicleType || 'car',
    });
  } catch (error) {
    console.error('[RouteController.detour] Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to calculate detour.' });
  }
};

module.exports = {
  geocode,
  autocomplete,
  reverse,
  calculate,
  getPitstops,
  calculateDetour,
};

