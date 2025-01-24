const User = require('../models/user');
const Topic = require('../models/topic');
const Comment = require('../models/comment');
const Category = require('../models/Category');

const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Get user status stats
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Get topics per category
    const topicsPerCategory = await Category.aggregate([
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'topics'
        }
      },
      {
        $project: {
          name: 1,
          topicCount: { $size: '$topics' }
        }
      }
    ]);

    // Helper function untuk mendapatkan array bulan terakhir
    const getLast6Months = () => {
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1
        });
      }
      return months;
    };

    // Get monthly activity (last 6 months)
    const last6Months = getLast6Months();
    const sixMonthsAgo = new Date(last6Months[0].year, last6Months[0].month - 1, 1);
    
    const monthlyTopics = await Topic.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyComments = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Fill in missing months with zero counts
    const filledTopics = last6Months.map(month => {
      const found = monthlyTopics.find(item => 
        item._id.year === month.year && 
        item._id.month === month.month
      );
      return {
        _id: { year: month.year, month: month.month },
        count: found ? found.count : 0
      };
    });

    const filledComments = last6Months.map(month => {
      const found = monthlyComments.find(item => 
        item._id.year === month.year && 
        item._id.month === month.month
      );
      return {
        _id: { year: month.year, month: month.month },
        count: found ? found.count : 0
      };
    });

    res.json({
      stats: {
        users: totalUsers,
        topics: totalTopics,
        comments: totalComments,
        categories: totalCategories
      },
      userStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
        banned: bannedUsers
      },
      topicsPerCategory: topicsPerCategory,
      monthlyActivity: {
        topics: filledTopics,
        comments: filledComments
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

module.exports = { getDashboardStats }; 