const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');
const User = require('../models/User');

const generateHouseId = async () => {
  try {
    const lastHouse = await House.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastHouse || !lastHouse.houseId) {
      return 'MMP-1001';
    }
    const match = lastHouse.houseId.match(/(?:MMP|HR)-(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `MMP-${nextNum}`;
    }
    return `MMP-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `MMP-${Date.now().toString().slice(-4)}`;
  }
};

const generateOwnerId = async () => {
  try {
    const lastOwner = await Owner.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastOwner || !lastOwner.ownerId) {
      return 'OWN-1001';
    }
    const match = lastOwner.ownerId.match(/OWN-(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `OWN-${nextNum}`;
    }
    return `OWN-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `OWN-${Date.now().toString().slice(-4)}`;
  }
};

const generateMemberId = async () => {
  try {
    const lastMember = await FamilyMember.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastMember || !lastMember.memberId) {
      return 'FAM-1001';
    }
    const match = lastMember.memberId.match(/FAM-(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `FAM-${nextNum}`;
    }
    return `FAM-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `FAM-${Date.now().toString().slice(-4)}`;
  }
};

const generatePhotoId = async () => {
  try {
    const lastPhoto = await HousePhoto.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastPhoto || !lastPhoto.photoId) {
      return 'PHT-1001';
    }
    const match = lastPhoto.photoId.match(/PHT-(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `PHT-${nextNum}`;
    }
    return `PHT-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `PHT-${Date.now().toString().slice(-4)}`;
  }
};

const generateUserId = async () => {
  try {
    const lastUser = await User.findOne({}, {}, { sort: { createdAt: -1 } });
    if (!lastUser || !lastUser.userId) {
      return 'USR-1001';
    }
    const match = lastUser.userId.match(/USR-(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `USR-${nextNum}`;
    }
    return `USR-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `USR-${Date.now().toString().slice(-4)}`;
  }
};

module.exports = {
  generateHouseId,
  generateOwnerId,
  generateMemberId,
  generatePhotoId,
  generateUserId
};
