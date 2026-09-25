const express = require('express');
const router = express.Router();
const {
  geocode,
  calculate,
  getPitstops,
  calculateDetour,
} = require('../controllers/routeController');

router.post('/geocode', geocode);
router.post('/calculate', calculate);
router.post('/pitstops', getPitstops);
router.post('/detour', calculateDetour);

module.exports = router;
