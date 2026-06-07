const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/zod.middleware');
const { authSchemas } = require('../validators');
const { registerUser, verifyOtp, resendOtp, loginUser, forgotPassword, resetPassword, changePassword, getMe, logoutUser, refreshToken } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', validate(authSchemas.register), registerUser);
router.post('/verify-otp', validate(authSchemas.verifyOtp), verifyOtp);
router.post('/resend-otp', validate(authSchemas.resendOtp), resendOtp);
router.post('/login', validate(authSchemas.login), loginUser);
router.post('/logout', verifyToken, logoutUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPassword), resetPassword);
router.put('/change-password', verifyToken, validate(authSchemas.changePassword), changePassword);
router.get('/me', verifyToken, getMe);

module.exports = router;
