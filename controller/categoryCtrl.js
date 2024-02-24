const Category = require('../models/categoryModel')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoDbIds')

const createCategory = asyncHandler(async(req, res) => {
    try{
        const newCategory = await Category.create(req.body).then((resp) => {
            res.status(200).json(resp);
        })
    }catch(error){
        throw new Error(e);
    }
})

const updateCategory = asyncHandler(async(req, res) => {
    try{
        const id = req.params?.categoryId;
        validateMongoDbId(id)
        await Category.findByIdAndUpdate(id, req.body, {new: true}).then((resp) => {
            res.status(200).json(resp);
        })
    }catch(e){
        throw new Error(e);
    }
})

const deleteCategory = asyncHandler(async(req, res) => {
    try{
        const id = req.params?.categoryId;
        validateMongoDbId(id)
        await Category.findById(id).then(async(a)=> {
            if(a!==null){
                await Category.findByIdAndDelete(id).then(() => {
                    res.status(200).send("The Category is successfully deleted!!");
                })
            }else{
                throw new Error("Sorry! The category you want to delete isn't there!!")
            }
        })
    }catch(e){
        throw new Error(e);
    }
})


const getCategory = asyncHandler(async(req, res) => {
    try{
        const id = req.params?.categoryId;
        validateMongoDbId(id);
        await Category.findById(id).then((resp) => {
            res.status(200).json(resp);
        })
    }catch(e){
        throw new Error(e);
    }
})


const getAllCategory = asyncHandler(async(req, res) => {
    try{
        await Category.find().then((resp) => {
            res.status(200).json(resp);
        })
    }catch(e){
        throw new Error(e);
    }
})

module.exports = {createCategory, updateCategory, deleteCategory, getCategory, getAllCategory}