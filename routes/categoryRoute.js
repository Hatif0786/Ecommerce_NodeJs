const express = require('express')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory } = require('../controller/categoryCtrl')
const router = express.Router()

router.post("/add", authMiddleware, isAdmin, createCategory)
router.patch("/update/:categoryId", authMiddleware, isAdmin, updateCategory)
router.delete("/delete/:categoryId", authMiddleware, isAdmin, deleteCategory)
router.get("/:categoryId", authMiddleware, getCategory)
router.get("/", authMiddleware, getAllCategory)

module.exports = router