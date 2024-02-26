const asyncHandler = require('express-async-handler')
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { default: mongoose } = require('mongoose');
const slugify = require('slugify')


const addProduct = asyncHandler(async (req, res) => {
    const title = req.body?.title;
    const p = await Product.findOne({title: title})
    if(p){
        throw new Error("Product already added!")
    }
    else{
        req.body.slug = slugify(req?.body?.title)
        const product = await Product.create(req.body)
        res.status(201).json({product});
    }
})


const getProduct = asyncHandler(async (req, res) => {
    const prodId = req.params?.productId;
    const product = await Product.findById(prodId);
    if(product){
        res.status(200).json(product)
    }else{
        throw new Error("The product is not found!");
    }
})


const getAllProducts = asyncHandler(async (req, res) => {
    // let query = {}; // Initialize an empty query object

    // // Check if req.params exists and set the query accordingly
    // if (req.query && (req.query.brand || req.query.color)) {
    //     if (req.query.brand) {
    //         query.brand = req.query.brand;
    //     }
    //     if (req.query.color) {
    //         query.color = req.query.color;
    //     }
    // }else{
    //     console.log('not running...');
    // }

    // // Find products based on the constructed query
    // const products = await Product.find(query);
    // // Check if any products are found
    // if (products.length === 0) {
    //     throw new Error("There are no products available in the database.");
    // }

    // // Respond with the found products
    // res.status(200).json(products);

    try{
        const queryObj = {...req.query}
        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach(el=> delete queryObj[el])
        console.log(queryObj);
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr))

        //Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ")
            query = query.sort(sortBy)
        }else{
            query = query.sort("-createdAt")
        }

        //Limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields)
        }else{
            query = query.select("-__v")
        }

        //Pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page-1)*limit;
        query = query.skip(skip).limit;
        if(req.query.page){
            const productCount = await Product.countDocuments()
            if(skip>=productCount){
                throw new Error('This Page does not exists!')
            }
        }

        const product = await query;
        res.json(product) 
    }catch(e){
        throw new Error(e);
    }
});


const updateProduct = asyncHandler(async (req,res)=>{
    let prodId=req.params?.productId
    req.body.slug = slugify(req.body?.title)
    const updatedProduct = await Product.findByIdAndUpdate(prodId, req.body , {new:true} )
    res.status(200).json(updatedProduct);
})


const deleteProduct = asyncHandler(async (req, res) => {
    let prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if(!product){
        throw new Error("No product with the provided details found!")
    }else{
        await Product.deleteOne({_id : prodId});
        res.status(200).send("The product deleted successfully!");
    }

})

const addToWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    if(req.user?.wishlist?.includes(productId)){
        User.findByIdAndUpdate(req.user._id, { $pull: {wishlist: productId}}, {new: true}).populate("wishlist").then((data) => {
            res.status(200).json(data)
        })
    } else{
        User.findByIdAndUpdate(req.user._id, { $push: {wishlist: productId}}, {new: true}).populate("wishlist").then((data)=> {
            res.status(200).json(data)
        })
    }   
})


const rating = asyncHandler(async(req, res) => {
    const id = req.user._id;
    const productId = req.params.productId
    const {star, comment} = req.body;
    try{
        const product = await Product.findById(productId)
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedBy.toString() === id.toString()
        )
        if(alreadyRated){
            await Product.updateOne({
                ratings: {$elemMatch: alreadyRated}}, {
                    $set: {"ratings.$.star": star, "ratings.$.comment": comment}
            }, {new: true}
        )
        }else{
            const rateProduct = await Product.findByIdAndUpdate(productId, {
                $push:{
                    ratings: {
                        star: star,
                        comment:comment,
                        postedBy:id
                    }
                }
            }, {new : true})
            
        }

        const getProduct = await Product.findById(productId);
        const totalRatingsLength = getProduct.ratings.length;
        let ratingSum = getProduct.ratings.map((item) => item.star).reduce((prev, curr) => prev+curr, 0)
        let actualRating = Math.round(ratingSum/totalRatingsLength)
        let respProduct = await Product.findByIdAndUpdate(productId, {totalRating: actualRating.toString()}, {new:true})
        res.status(200).json(respProduct);
    }catch(e){
        throw new Error(e);
    }
})



module.exports = {addProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating}