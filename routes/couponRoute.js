const express = require('express');
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require('../controller/couponCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/add',authMiddleware, isAdmin, createCoupon)
router.get('/', authMiddleware, isAdmin, getAllCoupons)
router.patch('/:couponId/update', authMiddleware, isAdmin, updateCoupon)
router.delete('/:couponId/delete', authMiddleware, isAdmin, deleteCoupon)

module.exports = router;