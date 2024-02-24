const BlogCategory = require("../models/blogCategory.Model")
const asyncHandler = require("express-async-handler")
const validateMongoDbId = require("../utils/validateMongoDbIds")


const createBlogCategory = asyncHandler(async(req, res) => {
    const {title} = req.body;
    try{
        await BlogCategory.findOne({title: title}).then(async (resp) => {
            if(resp){
                throw new Error("Blog Category with "+title+" already exists!!")
            }else{
                await BlogCategory.create(req.body).then((response) => {
                    return res.status(200).json(response)
                })
            }
        })
    }catch(e){
        throw new Error(e);
    }
})


const updateBlogCategory = asyncHandler(async(req, res) => {
    const id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await BlogCategory.findByIdAndUpdate(id, req.body, {new: true}).then((resp) => {
            return res.status(200).json(resp)
        })
    }catch(e){
        throw new Error(e);
    }
})


const deleteBlogCategory = asyncHandler(async (req, res) => {
    let id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await BlogCategory.findById(id).then(async (s) => {
            if(s!==null){
                await BlogCategory.findByIdAndDelete(id).then(() => {
                    res.status(200).send("The Blog Category is successfully deleted!!")
                })
            }else{
                throw new Error(NOT_FOUND + " The Blog Category does not exist.")
            }
        })
    }catch(e){
        throw new Error(e);
    }
})

const getAllBlogsCategory = asyncHandler(async(req, res)=> {
    await  BlogCategory.find().then((resp) => {
        return res.status(200).json(resp);
    })
})

const getBlogCategory = asyncHandler(async(req, res)=> {
    let id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await BlogCategory.findById(id).then((resp) => {
            return res.status(200).json(resp);
        })
    }catch(error){
        throw new Error(e);
    }
})


module.exports={createBlogCategory, updateBlogCategory, deleteBlogCategory, getAllBlogsCategory, getBlogCategory}