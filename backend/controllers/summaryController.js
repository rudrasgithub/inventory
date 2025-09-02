import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import TotalCounter from '../models/TotalCounter.js';

export const getSummary = async (req, res) => {
  try {
    console.log('[getSummary] called for user:', req.user._id);
    const userId = req.user._id;
    
    // determine timeframe (if last7Days flag is present)
    const last7DaysFlag = req.query.last7Days === 'true' || req.query.last7Days === '1' || req.query.last7Days === true;
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // categories (distinct count for user's products)
    const categories = await Product.distinct('category', { userId });

    // totalProducts: sum of all product quantities for this user
    const totalProductsAgg = await Product.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalProducts: { $sum: '$quantity' } } }
    ]);
    const totalProducts = totalProductsAgg[0]?.totalProducts || 0;
    console.log('[getSummary] totalProducts for user:', totalProducts);

    // ordered & revenue: aggregate from Purchase documents for this user
    const purchasesAgg = await Purchase.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalOrderedItems: { $sum: { $ifNull: ["$quantity", 0] } },
          totalRevenue: { $sum: { $multiply: [ { $ifNull: ["$quantity", 0] }, { $ifNull: ["$priceAtPurchase", 0] } ] } }
        }
      }
    ]);

    const ordered = purchasesAgg[0]?.totalOrderedItems || 0;
    const totalRevenueFromPurchases = purchasesAgg[0]?.totalRevenue || 0;

    console.log('[getSummary] ordered:', ordered, 'revenue:', totalRevenueFromPurchases);

    // Not in stock count for user's products
    const notInStock = await Product.countDocuments({ userId, quantity: 0 });
    
    // Low stock count for user's products
    const lowStock = await Product.countDocuments({ 
      userId, 
      quantity: { $gt: 0 }, 
      $expr: { $lte: ['$quantity', '$threshold'] } 
    });

    const result = {
      categories: categories.length,
      totalProducts,
      revenue: totalRevenueFromPurchases,
      notInStock,
      lowStock,
      ordered,
    };

    console.log('[getSummary] returning:', result);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};