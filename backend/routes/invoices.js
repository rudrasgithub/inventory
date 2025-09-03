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

router.use(auth);

router.post('/', createInvoice);

router.get('/', getInvoices);

router.get('/stats', getOverallInvoiceStats);

router.put('/:invoiceId/pay', payInvoice);

router.get('/:invoiceId/view', viewInvoice);

router.post('/:invoiceId/track-view', trackInvoiceView);

router.delete('/:invoiceId', deleteInvoice);

export default router;
