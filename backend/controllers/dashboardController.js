const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');

// @desc    Get live dashboard statistics and chart metrics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const isStaff = req.user && req.user.role === 'staff';
    const baseFilter = {};

    if (isStaff) {
      const assignedBeats = req.user.assignedBeats || [];
      baseFilter.beatNumber = { $in: assignedBeats };
      if (req.user.assignedVillages && req.user.assignedVillages.length > 0) {
        baseFilter.village = { $in: req.user.assignedVillages };
      }
    }

    // 1. Overall counts
    const totalHouses = await House.countDocuments(baseFilter);
    let totalOwners = 0;
    let totalFamilyMembers = 0;
    let totalPhotos = 0;

    if (isStaff) {
      const staffHouses = await House.find(baseFilter).select('_id');
      const staffHouseIds = staffHouses.map((h) => h._id);
      totalOwners = await Owner.countDocuments({ house: { $in: staffHouseIds } });
      totalFamilyMembers = await FamilyMember.countDocuments({ house: { $in: staffHouseIds } });
      totalPhotos = await HousePhoto.countDocuments({ house: { $in: staffHouseIds } });
    } else {
      totalOwners = await Owner.countDocuments();
      totalFamilyMembers = await FamilyMember.countDocuments();
      totalPhotos = await HousePhoto.countDocuments();
    }

    // 2. Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrationsCount = await House.countDocuments({
      ...baseFilter,
      registrationDate: { $gte: thirtyDaysAgo }
    });

    // 3. House Type Distribution
    const houseTypePipeline = [];
    if (Object.keys(baseFilter).length > 0) houseTypePipeline.push({ $match: baseFilter });
    houseTypePipeline.push(
      {
        $group: {
          _id: '$houseType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    );
    const houseTypeAggregation = await House.aggregate(houseTypePipeline);

    const houseTypeDistribution = houseTypeAggregation.map((item) => ({
      type: item._id || 'Other',
      count: item.count,
      percentage: totalHouses > 0 ? Math.round((item.count / totalHouses) * 100) : 0
    }));

    // 4. Ownership Type Distribution
    const ownershipPipeline = [];
    if (Object.keys(baseFilter).length > 0) ownershipPipeline.push({ $match: baseFilter });
    ownershipPipeline.push({
      $group: {
        _id: '$ownershipType',
        count: { $sum: 1 }
      }
    });
    const ownershipTypeAggregation = await House.aggregate(ownershipPipeline);

    // 5. Locality Top Distribution
    const localityPipeline = [];
    if (Object.keys(baseFilter).length > 0) localityPipeline.push({ $match: baseFilter });
    localityPipeline.push(
      {
        $group: {
          _id: '$locality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    );
    const localityAggregation = await House.aggregate(localityPipeline);

    // 6. Registration Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPipeline = [
      {
        $match: {
          ...baseFilter,
          registrationDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$registrationDate' },
            month: { $month: '$registrationDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ];

    const monthlyAggregation = await House.aggregate(monthlyPipeline);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = monthlyAggregation.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count
    }));

    // 7. Recent registrations list (last 6 records)
    const recentHouses = await House.find(baseFilter)
      .populate('owner', 'fullName contactNumber')
      .populate('familyMembers', 'fullName relationship')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalHouses,
          totalOwners,
          totalFamilyMembers,
          totalPhotos,
          recentRegistrationsCount
        },
        houseTypeDistribution,
        ownershipTypeDistribution: ownershipTypeAggregation.map((o) => ({
          type: o._id || 'Owned',
          count: o.count
        })),
        localityDistribution: localityAggregation.map((l) => ({
          locality: l._id || 'Unknown',
          count: l.count
        })),
        trends,
        recentHouses
      }
    });
  } catch (err) {
    next(err);
  }
};
