const { generateToken } = require('../config/jwtToken');
const User = require('./../models/userModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const {sendEmail}  = require('./emailCtrl')
const validateMongoDbId = require('../utils/validateMongoDbIds');
const generateRefreshToken = require('./../config/refreshToken')
const Cart = require('./../models/cartModel')
const Product = require('../models/productModel')


//Add new user in the database      
const createUser = asyncHandler(async (req, resp) => {
    const email = req.body.email;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
       throw new Error("User Already Exists!!")
    } else {
        const newUser = await User.create(req.body);
        resp.status(201).json(newUser);
    }
});


const updatePassword = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {password} = req.body;
    validateMongoDbId(_id)
    let user = await User.findById({_id : _id})
    if(password){
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    }else{
        res.json(user);
    }
})


//Handle the refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.refreshToken){
        throw new Error("No refresh token in cookies!")
    }
    const refreshToken = cookies?.refreshToken;
    const user = await User.findOne({refreshToken: refreshToken})
    if(!user){
        throw new Error("No such refresh token is present in database or not matched")
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id!==decoded.id){
            throw new Error("There is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id)
        res.json({accessToken})
    })
})


//Logout user 
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        throw new Error("No refresh token in cookies!")
    }
    const refreshToken = cookie?.refreshToken;
    const user = await User.findOne({refreshToken: refreshToken})
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true, 
            secure: true
        })
        return res.status(403).send("The user with this token does not exist!");
    }

    await User.findOneAndUpdate({refreshToken:refreshToken}, {refreshToken: ""})
    res.clearCookie("refreshToken", {
        httpOnly: true, 
        secure: true
    })
    res.status(200).json("The User logged out successfully!")
})

//Login User by login credentials
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email})
    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, {new: true})
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000
        })
        res.status(200).json({
            userId: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            password: findUser?.password,
            token: generateToken(findUser?._id)
        })
    }else{
        throw new Error("Sorry! Your credentials doesn't matched!!")
    }

    res.statusCode=200
    
})


//Login Admin by login credentials
const loginAdmin = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findAdmin = await User.findOne({email})
    if(findAdmin?.role !=="admin"){
        throw new Error("Not Authorised")
    }
    if(findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id)
        const updateUser = await User.findByIdAndUpdate(findAdmin._id, {
            refreshToken: refreshToken
        }, {new: true})
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000
        })
        res.status(200).json({
            userId: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            password: findAdmin?.password,
            token: generateToken(findAdmin?._id)
        })
    }else{
        throw new Error("Sorry! Your credentials doesn't matched!!")
    }

    res.statusCode=200
    
})

//Update the User Details
const updateUser = asyncHandler(async (req, res) => {
    try{
        const {_id} = req.user;
        validateMongoDbId({_id})
        const salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hash(req?.body?.password, salt);
        const user = await User.findByIdAndUpdate({_id}, {
            firstName: req.body?.firstName,
            lastName: req.body?.lastName,
            email: req.body?.email,
            mobile: req.body?.mobile,
            password: password
        } , {new: true});
        res.json(user);
    }catch(e){
        throw new Error(e);
    }
 })

 const updateUserAddress = asyncHandler(async (req, res) => {
    try{
        const {_id} = req.user;
        validateMongoDbId(_id)
        const user = await User.findByIdAndUpdate({_id}, {
            address: req.body?.address
        } , {new: true}).populate("wishlist");
        res.json(user);
    }catch(e){
        throw new Error(e);
    }
 })


 const forgotPasswordToken = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error("User doesn't exists!!")
    }
    try{
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `Hi, Please follow the link to reset your password. The link is valid till 10 minutes! <a href='http://localhost:5000/api/user/reset-password/${token}' >Click Here</a>`
        const data = {
            to: email,
            subject: "Forgot Password Link",
            text: "Hey User",
            html: resetUrl
        }
        sendEmail(data);
        res.json(token);
    }catch(e){
        throw new Error(e);
    }
 })

 const resetPassword = asyncHandler(async (req, res)=> {
    const {password} = req.body;
    const {token} = req.params
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    })

    if(!user){
        throw new Error("Token expired! Please try again later!")
    }

    user.password = password;
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save();
    res.json(user);
 })

//Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
   try{
    const getUsers = await User.find();
    res.json(getUsers);
   }catch(e){
    throw new Error(e);
   }
})

//Get user by userId
const getUser = asyncHandler(async (req, res) => {
    try{
        const userId = req.query.userId;
        validateMongoDbId(userId)
        const user = await User.findById(userId);
        res.json(user);
    }catch(e){
        throw new Error(e);
    }
 })

const blockUser = asyncHandler(async (req,res)=>{
    try{
        const userId = req.params.userId;
        validateMongoDbId(userId)
        const user = await User.findByIdAndUpdate(userId, {blocked :true} , {new:true});
        res.send("The "+ user?.firstName+" "+user?.lastName +" user is blocked!!!");
    }catch(e){
        throw new Error(e);
    }
})

const unblockUser = asyncHandler(async (req,res)=>{
    try{
        const userId = req.params.userId;
        validateMongoDbId(userId);
        const user = await User.findByIdAndUpdate(userId, {blocked :false} , {new:true});
        res.send("The "+ user?.firstName+" "+user?.lastName +" user is unblocked!!!");
    }catch(e){
        throw new Error(e);
    }
})


 //Delete the user by userId
const deleteUser = asyncHandler(async (req, res) => {
    try{
        const userId = req.params.userId;
        validateMongoDbId(userId)
        const user = await User.findByIdAndDelete(userId);
        res.json(user);
    }catch(e){
        throw new Error(e);
    }
 })


 const getWishList = asyncHandler(async (req, res) => {
    try {
        let _id = req.user._id;
        _id = _id.toString();
        validateMongoDbId(_id);
        // Await the result of the query to get the user object
        const user = await User.findById(_id).populate("wishlist");

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user object as the response
        res.status(200).json(user);
    } catch (e) {
        throw new Error(e);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {cart} = req.body;
    validateMongoDbId(_id);
    try{
        let products = []
        const user = await User.findById(_id);

        const alreadyExistsCart = await Cart.findOne({orderBy: user._id})
        if(alreadyExistsCart){
            alreadyExistsCart.remove();
        }
        for(let i=0; i<cart.length; i++){
            let object = {};
            object.product = cart[i]._id
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object)
        }
        let cartTotal = 0;
        for(let i=0; i<products.length; i++){
            cartTotal = cartTotal +  (products[i].price * products[i].count);
        }
        let newCart = await Cart.create({products, cartTotal, orderBy: user?._id});
        res.status(200).json(newCart)
    }catch(e){
        throw new Error(e);
    }
})




module.exports = { createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, updatePassword, updateUserAddress, logout, forgotPasswordToken, resetPassword, loginAdmin, getWishList, userCart };
