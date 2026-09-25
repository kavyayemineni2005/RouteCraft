const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  placeId: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Attractions',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  detourMinutes: {
    type: Number,
    default: 0,
  },
  stopDurationMinutes: {
    type: Number,
    default: 30,
  },
  description: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  orderIndex: {
    type: Number,
    default: 0,
  },
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    availableTime: {
      type: Number, // in minutes
      required: true,
    },
    maxDetour: {
      type: Number, // in minutes
      required: true,
    },
    distance: {
      type: Number, // in km
      default: 0,
    },
    travelTime: {
      type: Number, // driving time in minutes
      default: 0,
    },
    totalTripTime: {
      type: Number, // travelTime + sum(stops.stopDurationMinutes) + sum(detours)
      default: 0,
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    stops: [stopSchema],
    routeCoordinates: {
      type: [[Number]], // Array of [lat, lng] coordinates
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
