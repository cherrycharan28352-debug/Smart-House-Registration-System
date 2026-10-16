const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema(
  {
    memberId: {
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
      required: [true, 'Member name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship to owner is required'],
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 130
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    occupation: {
      type: String,
      trim: true,
      default: ''
    },
    contactNumber: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

familyMemberSchema.index({ house: 1 });
familyMemberSchema.index({ fullName: 1 });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
