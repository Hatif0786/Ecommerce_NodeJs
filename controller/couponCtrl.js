const Coupon = require('./../models/couponModel')
const validateMongoDbId = require('./../utils/validateMongoDbIds')
const asyncHandler = require('express-async-handler')


const createCoupon = asyncHandler(async (req, res) => {
    try{
        await Coupon.create(req.body).then((resp) => {
            res.status(201).json(resp);
        })
    }catch(e){
        throw new Error(e);
    }
})

const getAllCoupons = asyncHandler(async (req, res) => {
    try{
        await Coupon.find().then((resp) => {
            res.status(200).json(resp);
        })
    }catch(e){
        res.status(400)
        throw new Error(e);
    }
})

const updateCoupon = asyncHandler(async (req, res) => {
    try{
        const couponId = req.params.couponId;
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, req.body, {new:true})
        res.status(200).json(updatedCoupon)
    }catch(e){
        throw new Error(e);
    }
})

const deleteCoupon = asyncHandler(async(req, res) => {
    try{
        const couponId = req.params.couponId;
        await validateMongoDbId(couponId);
        const coupon = await Coupon.findById(couponId);
        if(coupon!==null){
            await Coupon.findByIdAndDelete(couponId);
            res.status(204).send("Deleted Successfully");
        }else{
            res.status(404).send("No Coupon Found");
        }
    }catch(e){
        throw new Error(e);
    }
})

module.exports = {createCoupon, getAllCoupons, updateCoupon,deleteCoupon}