const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { paymentSchemas } = require('../validators');
const { createOrder, verifyPayment, getPaymentHistory, getAllPayments } = require('../controllers/payment.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.post('/create-order', validate(paymentSchemas.createOrder), createOrder);
router.post('/verify', validate(paymentSchemas.verifyPayment), verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/admin/all', authorizeRoles('admin'), getAllPayments);

module.exports = router;
