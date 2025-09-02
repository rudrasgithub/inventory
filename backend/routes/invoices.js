import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createInvoice,
  getInvoices,
  getOverallInvoiceStats,
  payInvoice,
  viewInvoice,
  deleteInvoice,
  trackInvoiceView
} from '../controllers/invoiceController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create invoice (called when purchasing products)
router.post('/', createInvoice);

// Get invoices with pagination
router.get('/', getInvoices);

// Get overall invoice statistics
router.get('/stats', getOverallInvoiceStats);

// Pay invoice
router.put('/:invoiceId/pay', payInvoice);

// View invoice (increments view count)
router.get('/:invoiceId/view', viewInvoice);

// Track invoice view (increment viewCount for statistics)
router.post('/:invoiceId/track-view', trackInvoiceView);

// Delete invoice
router.delete('/:invoiceId', deleteInvoice);

export default router;
