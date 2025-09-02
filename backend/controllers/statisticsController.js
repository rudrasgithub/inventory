import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

// Get comprehensive statistics
export const getStatistics = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Calculate last month dates
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Current month date ranges
    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Last month date ranges
    const lastMonthStart = new Date(lastMonthYear, lastMonth - 1, 1);
    const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

    // Calculate total revenue (current month) - sum of totalAmount from purchases
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

    // Calculate last month revenue
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

    // Calculate products sold (current month)
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

    // Calculate last month products sold
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

    // Calculate current stock (products in stock)
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

    // Calculate stock from last month for comparison
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

    // Get chart data for last 12 months
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();
      
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      // Get purchases for this month (total cost of products purchased)
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

      // Get sales for this month (simple calculation based on purchases)
      const monthSales = await Purchase.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      chartData.push({
        month: monthName,
        purchase: Math.round(monthPurchases[0]?.purchase || 0),
        sales: Math.round(monthSales[0]?.sales || 0)
      });
    }

    // Get top products based on purchase frequency with product details
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

    // Calculate percentage changes
    const currentRevenue = currentMonthRevenue[0]?.totalRevenue || 0;
    const lastRevenue = lastMonthRevenue[0]?.totalRevenue || 0;
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue * 100) : 0;

    const currentSold = currentMonthSold[0]?.totalSold || 0;
    const lastSold = lastMonthSold[0]?.totalSold || 0;
    const salesChange = lastSold > 0 ? ((currentSold - lastSold) / lastSold * 100) : 0;

    const currentStock = stockData[0]?.totalStock || 0;
    const lastStock = lastMonthStock[0]?.totalStock || currentStock;
    const stockChange = lastStock > 0 ? ((currentStock - lastStock) / lastStock * 100) : 0;

    res.json({
      totalRevenue: {
        value: Math.round(currentRevenue),
        change: Math.round(revenueChange * 10) / 10
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
      topProducts: topProducts.length > 0 ? topProducts : [
        { name: "Redbull", rating: 5, image: null, totalSold: 25 },
        { name: "Kit kat", rating: 4, image: null, totalSold: 20 },
        { name: "Coca cola", rating: 3, image: null, totalSold: 18 },
        { name: "Milo", rating: 4, image: null, totalSold: 15 },
        { name: "Ariel", rating: 4, image: null, totalSold: 12 },
        { name: "Bru", rating: 4, image: null, totalSold: 10 }
      ]
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

// Get user layout configuration
export const getUserLayout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('gridLayout layouts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare response object
    const response = {};

    // Statistics layout (new system)
    if (user.layouts?.statisticsLayout) {
      response.statisticsLayout = user.layouts.statisticsLayout;
    } else {
      // Fallback to legacy gridLayout for statistics
      response.statisticsLayout = {
        firstRow: user.gridLayout?.leftColumn || [0, 1, 2],
        secondRow: user.gridLayout?.rightColumn || [3, 4]
      };
    }

    // Home layout (new system)
    if (user.layouts?.homeLayout) {
      response.homeLayout = user.layouts.homeLayout;
    } else {
      // Fallback to legacy gridLayout for home
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

// Update user layout configuration
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

    // Initialize layouts object if it doesn't exist
    if (!user.layouts) {
      user.layouts = {};
    }

    // Update statistics layout
    if (statisticsLayout) {
      user.layouts.statisticsLayout = {
        firstRow: statisticsLayout.firstRow || [0, 1, 2],
        secondRow: statisticsLayout.secondRow || [3, 4]
      };
      
      // Also update legacy gridLayout for backward compatibility
      user.gridLayout = {
        leftColumn: statisticsLayout.firstRow || [0, 1, 2],
        rightColumn: statisticsLayout.secondRow || [3, 4]
      };
    }

    // Update home layout
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
