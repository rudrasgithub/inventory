import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

export const getWeeklyStatistics = async (req, res) => {
  try {
    const currentDate = new Date();
    const weeklyData = [];

    const currentDay = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const isPastOrToday = dayStart <= currentDate;
      let purchase = 0;
      let sales = 0;

      if (isPastOrToday) {

        const dayPurchases = await Purchase.aggregate([
          {
            $match: {
              userId: req.user._id,
              createdAt: { $gte: dayStart, $lte: dayEnd }
            }
          },
          {
            $group: {
              _id: null,
              purchase: { $sum: '$totalAmount' },
              sales: { $sum: { $multiply: ['$quantity', '$priceAtPurchase'] } }
            }
          }
        ]);

        if (dayPurchases.length > 0) {
          purchase = Math.round(dayPurchases[0].purchase || 0);
          sales = Math.round(dayPurchases[0].sales || 0);
        }
      }

      weeklyData.push({
        day: days[i],
        purchase: purchase,
        sales: sales
      });
    }

    res.json({ weeklyData });
  } catch (error) {
    console.error('Error fetching weekly statistics:', error);
    res.status(500).json({ message: 'Server error while fetching weekly statistics' });
  }
};

export const getYearlyStatistics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearlyData = [];

    for (let year = currentYear - 4; year <= currentYear; year++) {
      const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      const yearPurchases = await Purchase.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: yearStart, $lte: yearEnd }
          }
        },
        {
          $group: {
            _id: null,
            purchase: { $sum: '$totalAmount' },
            sales: { $sum: { $multiply: ['$quantity', '$priceAtPurchase'] } }
          }
        }
      ]);

      const purchase = yearPurchases.length > 0 ? Math.round(yearPurchases[0].purchase || 0) : 0;
      const sales = yearPurchases.length > 0 ? Math.round(yearPurchases[0].sales || 0) : 0;

      yearlyData.push({
        year: year.toString(),
        purchase: purchase,
        sales: sales
      });
    }

    res.json({ yearlyData });
  } catch (error) {
    console.error('Error fetching yearly statistics:', error);
    res.status(500).json({ message: 'Server error while fetching yearly statistics' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const lastMonthStart = new Date(lastMonthYear, lastMonth - 1, 1);
    const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

    const currentMonthRevenue = await Purchase.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthRevenue = await Purchase.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const currentMonthSold = await Purchase.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$quantity' }
        }
      }
    ]);

    const lastMonthSold = await Purchase.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$quantity' }
        }
      }
    ]);

    const stockData = await Product.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' }
        }
      }
    ]);

    const lastMonthStock = await Product.aggregate([
      {
        $match: {
          userId: req.user._id,
          updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' }
        }
      }
    ]);

    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();

      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      const monthName = monthDate.toLocaleString('default', { month: 'short' });

      const monthPurchases = await Purchase.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            purchase: { $sum: '$totalAmount' }
          }
        }
      ]);

      const monthSalesRevenue = await Purchase.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            salesRevenue: { $sum: { $multiply: ['$quantity', '$priceAtPurchase'] } }
          }
        }
      ]);

      const salesRevenue = monthSalesRevenue[0]?.salesRevenue || 0;
      const salesCost = Math.round(salesRevenue * 0.05);

      chartData.push({
        month: monthName,
        purchase: Math.round(monthPurchases[0]?.purchase || 0),
        sales: Math.round(salesRevenue) // Using sales revenue instead of same as purchase
      });
    }

    const topProducts = await Purchase.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.0': { $exists: true }  // Only include purchases with valid products
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $group: {
          _id: '$productDetails.name',
          productId: { $first: '$productId' },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', { $multiply: ['$quantity', '$priceAtPurchase'] }] } },
          productImage: { $first: '$productDetails.image' }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' }  // Filter out null/empty product names
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 6
      },
      {
        $project: {
          name: '$_id',
          image: '$productImage',
          rating: {
            $min: [5, {
              $max: [1, {
                $ceil: {
                  $divide: [
                    { $add: [{ $mod: [{ $multiply: ['$totalQuantity', 7] }, 20] }, 5] },
                    5
                  ]
                }
              }]
            }]
          },
          totalSold: '$totalQuantity'
        }
      }
    ]);

    const currentRevenue = currentMonthRevenue[0]?.totalRevenue || 0;
    const lastRevenue = lastMonthRevenue[0]?.totalRevenue || 0;
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue * 100) : 0;

    const currentSold = currentMonthSold[0]?.totalSold || 0;
    const lastSold = lastMonthSold[0]?.totalSold || 0;
    const salesChange = lastSold > 0 ? ((currentSold - lastSold) / lastSold * 100) : 0;

    const currentStock = stockData[0]?.totalStock || 0;
    const lastStock = lastMonthStock[0]?.totalStock || currentStock;
    const stockChange = lastStock > 0 ? ((currentStock - lastStock) / lastStock * 100) : 0;

    const totalCost = Math.round(currentRevenue * 0.05);
    const totalProfit = Math.round(currentRevenue - totalCost);

    res.json({
      totalRevenue: {
        value: Math.round(currentRevenue),
        change: Math.round(revenueChange * 10) / 10
      },
      totalCost: {
        value: totalCost
      },
      totalProfit: {
        value: totalProfit
      },
      productsSold: {
        value: currentSold,
        change: Math.round(salesChange * 10) / 10
      },
      productsInStock: {
        value: currentStock,
        change: Math.round(stockChange * 10) / 10
      },
      chartData,
      topProducts: topProducts
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

export const getUserLayout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('gridLayout layouts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = {};

    if (user.layouts?.statisticsLayout) {
      response.statisticsLayout = user.layouts.statisticsLayout;
    } else {

      response.statisticsLayout = {
        firstRow: user.gridLayout?.leftColumn || [0, 1, 2],
        secondRow: user.gridLayout?.rightColumn || [3, 4]
      };
    }

    if (user.layouts?.homeLayout) {
      response.homeLayout = user.layouts.homeLayout;
    } else {

      response.homeLayout = {
        leftColumn: user.gridLayout?.leftColumn || [0, 1, 2],
        rightColumn: user.gridLayout?.rightColumn || [0, 1, 2]
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching user layout:', error);
    res.status(500).json({ message: 'Server error while fetching layout' });
  }
};

export const updateUserLayout = async (req, res) => {
  try {
    const { statisticsLayout, homeLayout } = req.body;

    if (!statisticsLayout && !homeLayout) {
      return res.status(400).json({ message: 'At least one layout type is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.layouts) {
      user.layouts = {};
    }

    if (statisticsLayout) {
      user.layouts.statisticsLayout = {
        firstRow: statisticsLayout.firstRow || [0, 1, 2],
        secondRow: statisticsLayout.secondRow || [3, 4]
      };

      user.gridLayout = {
        leftColumn: statisticsLayout.firstRow || [0, 1, 2],
        rightColumn: statisticsLayout.secondRow || [3, 4]
      };
    }

    if (homeLayout) {
      user.layouts.homeLayout = {
        leftColumn: homeLayout.leftColumn || [0, 1, 2],
        rightColumn: homeLayout.rightColumn || [0, 1, 2]
      };
    }

    await user.save();

    res.json({
      message: 'Layout updated successfully',
      statisticsLayout: user.layouts.statisticsLayout,
      homeLayout: user.layouts.homeLayout
    });
  } catch (error) {
    console.error('Error updating user layout:', error);
    res.status(500).json({ message: 'Server error while updating layout' });
  }
};
