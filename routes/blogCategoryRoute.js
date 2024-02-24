const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { createBlogCategory, updateBlogCategory, deleteBlogCategory, getBlogCategory, getAllBlogsCategory } = require("../controller/blogCategoryCtrl");
const router = express.Router();


router.post("/add", authMiddleware, isAdmin, createBlogCategory)
router.patch("/update/:id", authMiddleware, isAdmin, updateBlogCategory)
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBlogCategory);
router.get("/", authMiddleware, getAllBlogsCategory)
router.get("/:id", authMiddleware, getBlogCategory)


module.exports = router