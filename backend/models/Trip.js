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
  estimatedCost: {
    type: Number,
    default: 0, // Individual stop cost in ₹ (food/entry/parking)
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
      name: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    startLocation: {
      name: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    destination: {
      name: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    endLocation: {
      name: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    availableTime: {
      type: Number, // in minutes
      default: 480,
    },
    availableTimeBudgetMinutes: {
      type: Number, // in minutes
      default: 480,
    },
    maxDetour: {
      type: Number, // in minutes
      default: 30,
    },
    distance: {
      type: Number, // in km
      default: 0,
    },
    totalDistanceKm: {
      type: Number, // in km
      default: 0,
    },
    travelTime: {
      type: Number, // driving time in minutes
      default: 0,
    },
    totalDurationMinutes: {
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
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'bus', 'train', 'flight'],
      default: 'car',
    },
    travelersCount: {
      type: Number,
      default: 1,
    },
    // Trip Expense Financial Budget (in INR ₹)
    totalBudget: {
      type: Number,
      default: 5000,
    },
    fuelCost: {
      type: Number,
      default: 0,
    },
    foodCost: {
      type: Number,
      default: 0,
    },
    parkingTollCost: {
      type: Number,
      default: 0,
    },
    activityCost: {
      type: Number,
      default: 0,
    },
    otherCost: {
      type: Number,
      default: 0,
    },
    estimatedTotal: {
      type: Number,
      default: 0,
    },
    remainingBudget: {
      type: Number,
      default: 5000,
    },
    notes: {
      type: String,
      default: '',
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
