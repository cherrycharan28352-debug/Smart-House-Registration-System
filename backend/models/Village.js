const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    villageId: {
      type: String,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true
    },
    nameKannada: {
      type: String,
      trim: true,
      default: ''
    },
    beatNumber: {
      type: String,
      required: [true, 'Assigned beat number is required'],
      trim: true,
      index: true
    },
    beatRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beat',
      index: true
    },
    taluk: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: 'Karnataka'
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

villageSchema.index({ beatNumber: 1, name: 1 });

module.exports = mongoose.model('Village', villageSchema);
