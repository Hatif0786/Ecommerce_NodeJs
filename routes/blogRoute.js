const express = require("express");
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages } = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createBlog);
router.patch("/update/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", authMiddleware, getBlog);
router.get("/", authMiddleware, getAllBlogs);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBlog)
router.put("/like/:id", authMiddleware, isAdmin, likeBlog)
router.put("/dislike/:id", authMiddleware, isAdmin, dislikeBlog)
router.put('/upload/:blogId', authMiddleware, isAdmin, uploadPhoto.array("images", 2), blogImgResize, uploadImages);

module.exports = router;
