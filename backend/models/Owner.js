const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      unique: true,
      trim: true
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Owner full name is required'],
      trim: true
    },
    contactNumber: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    ownershipType: {
      type: String,
      enum: ['Owned', 'Rented', 'Other'],
      default: 'Owned'
    },
    representativeStatus: {
      type: String,
      enum: ['Owner', 'Representative / Co-resident', 'Tenant', 'Caregiver', 'Other'],
      default: 'Owner'
    },
    correspondenceAddress: {
      type: String,
      trim: true,
      default: ''
    },
    age: {
      type: Number,
      min: 0,
      max: 130
    },
    dateOfBirth: {
      type: Date
    },
    idReference: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

ownerSchema.index({ house: 1 });
ownerSchema.index({ fullName: 1 });
ownerSchema.index({ contactNumber: 1 });

module.exports = mongoose.model('Owner', ownerSchema);
