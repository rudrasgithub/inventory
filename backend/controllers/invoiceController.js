import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

// Generate random invoice ID
const generateInvoiceId = () => {
  const randomNumber = Math.floor(Math.random() * 10000) + 1000;
  return `INV-${randomNumber}`;
};

// Generate random reference number
const generateReferenceNumber = () => {
  const randomNumber = Math.floor(Math.random() * 1000) + 100;
  return `INV-${randomNumber}`;
};

// Create invoice when purchasing products
export const createInvoice = async (req, res) => {
  try {
    const { products, totalAmount } = req.body; // products: [{ productId, quantity, price, productName }]
    
    // Generate due date (10 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    
    const invoice = new Invoice({
      invoiceId: generateInvoiceId(),
      amount: totalAmount,
      dueDate,
      products,
      userId: req.user._id
    });
    
    await invoice.save();
    
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all invoices for a user with pagination
export const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const invoices = await Invoice.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalInvoices = await Invoice.countDocuments({ userId: req.user._id });
    const totalPages = Math.max(1, Math.ceil(totalInvoices / limit)); // Ensure at least 1 page
    
    res.json({
      invoices,
      pagination: {
        page,
        totalPages,
        totalInvoices,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get overall invoice statistics
export const getOverallInvoiceStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Recent transactions (paid invoices in last 7 days)
    const recentTransactions = await Invoice.countDocuments({
      userId,
      status: 'Paid',
      updatedAt: { $gte: last7Days }
    });
    
    // Total invoices in last 7 days
    const totalInvoicesLast7Days = await Invoice.countDocuments({
      userId,
      createdAt: { $gte: last7Days }
    });
    
    // Total view clicks (processed) - total number of clicks on view invoice button
    const totalViewClicks = await Invoice.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalClicks: { $sum: '$viewCount' } } }
    ]);
    const processed = totalViewClicks[0]?.totalClicks || 0;
    
    // View clicks in last 7 days
    const last7DaysViewClicks = await Invoice.aggregate([
      { 
        $match: { 
          userId,
          lastViewed: { $gte: last7Days }
        }
      },
      { $group: { _id: null, totalClicks: { $sum: '$viewCount' } } }
    ]);
    const processedLast7Days = last7DaysViewClicks[0]?.totalClicks || 0;
    
    // Paid amount in last 7 days
    const paidAmountResult = await Invoice.aggregate([
      { 
        $match: { 
          userId, 
          status: 'Paid',
          updatedAt: { $gte: last7Days }
        }
      },
      { $group: { _id: null, totalPaidAmount: { $sum: '$amount' } } }
    ]);
    const paidAmount = paidAmountResult[0]?.totalPaidAmount || 0;
    
    // Customers (total paid invoices)
    const customers = await Invoice.countDocuments({
      userId,
      status: 'Paid'
    });
    
    // Unpaid amount (ordered)
    const unpaidAmountResult = await Invoice.aggregate([
      { $match: { userId, status: 'Unpaid' } },
      { $group: { _id: null, totalUnpaidAmount: { $sum: '$amount' } } }
    ]);
    const unpaidAmount = unpaidAmountResult[0]?.totalUnpaidAmount || 0;
    
    // Pending payments (unpaid invoices count)
    const pendingPayments = await Invoice.countDocuments({
      userId,
      status: 'Unpaid'
    });
    
    res.json({
      recentTransactions,
      totalInvoices: {
        last7Days: processedLast7Days,
        processed
      },
      paidAmount: {
        last7Days: paidAmount,
        customers
      },
      unpaidAmount: {
        ordered: unpaidAmount,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pay invoice (mark as paid)
export const payInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findOne({ 
      _id: invoiceId, 
      userId: req.user._id 
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    if (invoice.status === 'Paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }
    
    invoice.status = 'Paid';
    invoice.referenceNumber = generateReferenceNumber();
    
    await invoice.save();
    
    res.json({
      message: 'Invoice paid successfully',
      invoice
    });
  } catch (error) {
    console.error('Error paying invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View invoice (increment view count)
export const viewInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, userId: req.user._id },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('products.productId');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({
      message: 'Invoice viewed successfully',
      invoice
    });
  } catch (error) {
    console.error('Error viewing invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findOneAndDelete({
      _id: invoiceId,
      userId: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track invoice view (increment viewCount)
export const trackInvoiceView = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findOne({ 
      _id: invoiceId, 
      userId: req.user._id 
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Increment view count and update last viewed time
    invoice.viewCount = (invoice.viewCount || 0) + 1;
    invoice.lastViewed = new Date();
    
    await invoice.save();
    
    res.json({ 
      message: 'Invoice view tracked successfully',
      viewCount: invoice.viewCount 
    });
  } catch (error) {
    console.error('Error tracking invoice view:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
