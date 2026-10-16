const mongoose = require('mongoose');

const beatSchema = new mongoose.Schema(
  {
    beatNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true // 'Beat 01', 'Beat 02', ... 'Beat 11'
    },
    beatName: {
      type: String,
      trim: true,
      default: ''
    },
    beatNameKannada: {
      type: String,
      trim: true,
      default: ''
    },
    officerName: {
      type: String,
      trim: true,
      default: ''
    },
    officerContact: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Beat', beatSchema);
