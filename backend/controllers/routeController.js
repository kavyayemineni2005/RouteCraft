const { geocodeLocation } = require('../services/geocodingService');
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

// @desc    Calculate driving route across ordered waypoints
// @route   POST /api/route/calculate
// @access  Public
const calculate = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || !Array.isArray(points) || points.length < 2) {
      return res.status(400).json({
        message: 'Points array with at least start and destination is required.',
      });
    }

    const routeData = await calculateRoute(points);
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
    const { startPoint, pitstop, destPoint, mainRouteDurationMinutes } = req.body;

    if (!startPoint || !pitstop || !destPoint) {
      return res.status(400).json({ message: 'startPoint, pitstop, and destPoint are required.' });
    }

    const pointsVia = [startPoint, pitstop, destPoint];
    const routeVia = await calculateRoute(pointsVia);

    const baseDuration = Number(mainRouteDurationMinutes) || 0;
    const detourMinutes = Math.max(0, routeVia.duration - baseDuration);

    res.json({
      detourMinutes,
      routeWithPitstopDuration: routeVia.duration,
      additionalDistanceKm: routeVia.distance,
    });
  } catch (error) {
    console.error('[RouteController.detour] Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to calculate detour.' });
  }
};

module.exports = {
  geocode,
  calculate,
  getPitstops,
  calculateDetour,
};
