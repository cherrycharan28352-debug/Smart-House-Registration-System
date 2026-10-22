const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');
const User = require('../models/User');

const generateHouseId = async () => {
  try {
    const houses = await House.find({}, { houseId: 1 }).lean();
    let maxNum = 1000;
    for (const h of houses) {
      if (h.houseId) {
        const match = h.houseId.match(/(?:MMP|HR)-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    return `MMP-${maxNum + 1}`;
  } catch (err) {
    return `MMP-${Date.now().toString().slice(-6)}`;
  }
};

const generateOwnerId = async () => {
  try {
    const owners = await Owner.find({}, { ownerId: 1 }).lean();
    let maxNum = 1000;
    for (const o of owners) {
      if (o.ownerId) {
        const match = o.ownerId.match(/OWN-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    return `OWN-${maxNum + 1}`;
  } catch (err) {
    return `OWN-${Date.now().toString().slice(-6)}`;
  }
};

const generateMemberId = async () => {
  try {
    const members = await FamilyMember.find({}, { memberId: 1 }).lean();
    let maxNum = 1000;
    for (const m of members) {
      if (m.memberId) {
        const match = m.memberId.match(/FAM-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    return `FAM-${maxNum + 1}`;
  } catch (err) {
    return `FAM-${Date.now().toString().slice(-6)}`;
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
