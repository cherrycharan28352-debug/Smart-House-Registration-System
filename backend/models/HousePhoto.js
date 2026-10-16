const mongoose = require('mongoose');

const housePhotoSchema = new mongoose.Schema(
  {
    photoId: {
      type: String,
      unique: true,
      trim: true
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Front view', 'Exterior', 'Interior', 'Other'],
      default: 'Front view'
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('HousePhoto', housePhotoSchema);
