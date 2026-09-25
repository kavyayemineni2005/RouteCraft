const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Coffee', 'Food', 'Nature', 'Viewpoints', 'Attractions', 'Shopping', 'Fuel/rest stops', 'Other'],
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
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
    },
    source: {
      type: String,
      enum: ['OSM', 'Curated', 'User'],
      default: 'OSM',
    },
    address: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Geo-index for potential spatial queries
placeSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Place', placeSchema);
