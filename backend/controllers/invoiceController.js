import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

const generateInvoiceId = () => {
  const randomNumber = Math.floor(Math.random() * 10000) + 1000;
  return `INV-${randomNumber}`;
};

const generateReferenceNumber = () => {
  const randomNumber = Math.floor(Math.random() * 1000) + 100;
  return `INV-${randomNumber}`;
};

export const createInvoice = async (req, res) => {
  try {
    const { products, totalAmount } = req.body; // products: [{ productId, quantity, price, productName }]

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

export const getOverallInvoiceStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTransactions = await Invoice.countDocuments({
      userId,
      status: 'Paid',
      updatedAt: { $gte: last7Days }
    });

    const totalInvoicesLast7Days = await Invoice.countDocuments({
      userId,
      createdAt: { $gte: last7Days }
    });

    const totalViewClicks = await Invoice.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalClicks: { $sum: '$viewCount' } } }
    ]);
    const processed = totalViewClicks[0]?.totalClicks || 0;

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

    const customers = await Invoice.countDocuments({
      userId,
      status: 'Paid'
    });

    const unpaidAmountResult = await Invoice.aggregate([
      { $match: { userId, status: 'Unpaid' } },
      { $group: { _id: null, totalUnpaidAmount: { $sum: '$amount' } } }
    ]);
    const unpaidAmount = unpaidAmountResult[0]?.totalUnpaidAmount || 0;

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
