import express from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct, getPaginatedProducts, addBulkProducts, checkExpiredProducts, checkProductId } from '../controllers/productController.js';
import { getSummary } from '../controllers/summaryController.js';
import { buyProduct } from '../controllers/buyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getProducts);
router.get('/paginated', auth, getPaginatedProducts);
router.get('/check-id/:productId', auth, checkProductId);
router.post('/', auth, addProduct);
router.post('/bulk', auth, addBulkProducts);
router.post('/buy', auth, buyProduct);
router.post('/check-expired', auth, checkExpiredProducts);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.get('/summary', auth, getSummary);

export default router;
