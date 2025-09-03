import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Invoice from '../models/Invoice.js';

const generateInvoiceId = () => {
  const randomNumber = Math.floor(Math.random() * 10000) + 1000;
  return `INV-${randomNumber}`;
};

export const buyProduct = async (req, res) => {
  try {
    console.log('[buyProduct] called with:', req.body);
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const qtyNumber = Number(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const product = await Product.findOne({
      _id: productId,
      userId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    if (product.quantity < qtyNumber) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    console.log('[buyProduct] updating product quantity from', product.quantity, 'by -', qtyNumber);
    product.quantity -= qtyNumber;
    await product.save();

    const totalAmount = product.price * qtyNumber;

    const purchase = new Purchase({
      productId: product._id,
      quantity: qtyNumber,
      priceAtPurchase: product.price,
      totalAmount: totalAmount, // Add calculated total amount
      userId: req.user._id, // Add userId to purchase record
    });
    await purchase.save();
    console.log('[buyProduct] created purchase record:', purchase);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10); // 10 days from now

    const invoice = new Invoice({
      invoiceId: generateInvoiceId(),
      amount: totalAmount,
      dueDate,
      products: [{
        productId: product._id,
        productName: product.name,
        quantity: qtyNumber,
        price: product.price
      }],
      userId: req.user._id
    });

    await invoice.save();
    console.log('[buyProduct] created invoice:', invoice);

    res.status(200).json({
      message: 'Purchase successful',
      product,
      purchase,
      invoice: {
        id: invoice._id,
        invoiceId: invoice.invoiceId,
        amount: invoice.amount,
        status: invoice.status
      }
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Failed to process purchase' });
  }
};
