const express = require('express');
const router = express.Router();
const {
  geocode,
  autocomplete,
  reverse,
  calculate,
  getPitstops,
  calculateDetour,
} = require('../controllers/routeController');

router.post('/geocode', geocode);
router.get('/autocomplete', autocomplete);
router.post('/autocomplete', autocomplete);
router.post('/reverse', reverse);
router.post('/calculate', calculate);
router.post('/pitstops', getPitstops);
router.post('/detour', calculateDetour);

module.exports = router;

