 const Blog = require("./../models/blogModel")
 const User = require("./../models/userModel")
 const asyncHandler = require('express-async-handler')
 const validateMongoDbId = require("./../utils/validateMongoDbIds")
const { findByIdAndUpdate } = require("../models/productModel")
const cloudinaryUploadImg = require('./../utils/cloudinary')
const fs = require('fs')
const createBlog = asyncHandler(async (req, res) => {
    
    try{
        const newBlog = await  Blog.create(req.body);
        res.status(200).json(newBlog)
    }catch(e){
        throw new Error(e);
    }
 })


const updateBlog = asyncHandler(async (req,res)=>{
    const id = req.params.id;
    try{
        let updated_Blog = await Blog.findByIdAndUpdate(id, req.body, {
            new:true
        });
        res.status(200).json(updated_Blog)
       
    }catch(e){
        throw new Error(e);
    }
 })

 const getBlog = asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
        validateMongoDbId(id)
        let fetched_Blog = await Blog.findById(id);
        // Update the numViews field using findByIdAndUpdate
        fetched_Blog = await Blog.findByIdAndUpdate(id, { numViews: fetched_Blog?.numViews + 1 }, {
            new: true // Return the updated document
        }).populate("likes").populate("dislikes");
        res.status(200).json(fetched_Blog);
    } catch (e) {
        // Instead of throwing a new Error, handle the error appropriately
        console.error(e);
        res.status(500).json({ message: "Server Error" });
    }
});


const getAllBlogs = asyncHandler(async (req, res) => {
    try{
        const blogs = await Blog.find();
        res.status(200).json(blogs)
    }catch(e){
        throw new Error(e);
    }
})


const deleteBlog = asyncHandler(async (req, res) => {
    try{
        const id = req.params.id
        validateMongoDbId(id).then(async () => {
            await Blog.findByIdAndDelete(id).then(() => {
                res.status(200).send("The Blog is successfully deleted!!!")
            }).catch((e) => {
                res.status(500).send("Error deleting the blog")
            })
        }) 
    }catch(e){
        throw new Error(e);
    }
})


const likeBlog = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    try {
        // Validate blogId
        await validateMongoDbId(blogId);
        
        let blog = await Blog.findById(blogId);
        const loginUserId = req.user?._id;
        const isLiked = blog?.likes?.includes(loginUserId); // Check if the user has already liked the blog
        const alreadyDisliked = blog?.dislikes?.includes(loginUserId); // Check if the user has already disliked the blog

        if (alreadyDisliked) {
            // If already disliked, remove the dislike and set isDisliked to false
            blog = await Blog.findByIdAndUpdate(blogId, { $pull: { dislikes: loginUserId }, isDisliked: false }, { new: true });
        }

        if (isLiked) {
            // If already liked, remove the like and set isLiked to false
            blog = await Blog.findByIdAndUpdate(blogId, { $pull: { likes: loginUserId }, isLiked: false }, { new: true });
        } else {
            // If not liked yet, add the like and set isLiked to true
            blog = await Blog.findByIdAndUpdate(blogId, { $push: { likes: loginUserId }, isLiked: true }, { new: true });
        }
        
        res.json(blog); // Send the updated blog as response
    } catch (e) {
        console.error(e); // Log the error
        res.status(500).json({ message: "Server Error" }); // Send a 500 error response
    }
});


const dislikeBlog = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    try {
        // Validate blogId
        await validateMongoDbId(blogId);
        
        let blog = await Blog.findById(blogId);
        const loginUserId = req.user?._id;
        const isDisLiked = blog?.dislikes?.includes(loginUserId); // Check if the user has already liked the blog
        const alreadyLiked = blog?.likes?.includes(loginUserId); // Check if the user has already disliked the blog

        if (alreadyLiked) {
            // If already disliked, remove the dislike and set isDisliked to false
            blog = await Blog.findByIdAndUpdate(blogId, { $pull: { likes: loginUserId }, isLiked: false }, { new: true });
        }

        if (isDisLiked) {
            // If already liked, remove the like and set isLiked to false
            blog = await Blog.findByIdAndUpdate(blogId, { $pull: { dislikes: loginUserId }, isDisliked: false }, { new: true });
        } else {
            // If not liked yet, add the like and set isLiked to true
            blog = await Blog.findByIdAndUpdate(blogId, { $push: { dislikes: loginUserId }, isDisliked: true }, { new: true });
        }
        
        res.json(blog); // Send the updated blog as response
    } catch (e) {
        console.error(e); // Log the error
        res.status(500).json({ message: "Server Error" }); // Send a 500 error response
    }
});


const uploadImages = asyncHandler(async (req, res) => {
    const id = req.params.blogId;
    validateMongoDbId(id);
    console.log(req.files);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images"); // Adjust uploader function
        const urls = [];
        const files = req.files;

        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push({ url: newpath.url });
            fs.unlinkSync(path) // Wrap each URL in an object
        }

        const findBlog = await Blog.findByIdAndUpdate(id, 
            {
                images: urls.map((file) => {
                    return file;
                })
            }
            , {
            new: true
        });

        res.status(200).json(findBlog);
    } catch (e) {
        throw new Error(e);
    }
});

 module.exports = {createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages}