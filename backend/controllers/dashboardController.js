const House = require('../models/House');
const Owner = require('../models/Owner');
const FamilyMember = require('../models/FamilyMember');
const HousePhoto = require('../models/HousePhoto');

// @desc    Get live dashboard statistics and chart metrics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Overall counts
    const totalHouses = await House.countDocuments();
    const totalOwners = await Owner.countDocuments();
    const totalFamilyMembers = await FamilyMember.countDocuments();
    const totalPhotos = await HousePhoto.countDocuments();

    // 2. Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrationsCount = await House.countDocuments({
      registrationDate: { $gte: thirtyDaysAgo }
    });

    // 3. House Type Distribution
    const houseTypeAggregation = await House.aggregate([
      {
        $group: {
          _id: '$houseType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const houseTypeDistribution = houseTypeAggregation.map((item) => ({
      type: item._id || 'Other',
      count: item.count,
      percentage: totalHouses > 0 ? Math.round((item.count / totalHouses) * 100) : 0
    }));

    // 4. Ownership Type Distribution
    const ownershipTypeAggregation = await House.aggregate([
      {
        $group: {
          _id: '$ownershipType',
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Locality Top Distribution
    const localityAggregation = await House.aggregate([
      {
        $group: {
          _id: '$locality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // 6. Registration Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await House.aggregate([
      {
        $match: {
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
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = monthlyAggregation.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count
    }));

    // 7. Recent registrations list (last 6 records)
    const recentHouses = await House.find()
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
