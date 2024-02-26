const express = require('express')
const { addProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating } = require('../controller/productCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post("/add-product", authMiddleware, isAdmin, addProduct)
router.get("/:productId", authMiddleware, isAdmin, getProduct)
router.put("/:productId", authMiddleware, isAdmin, updateProduct)
router.get("/", getAllProducts)
router.get("/rating/:productId", authMiddleware, rating)
router.get("/addToWishlist/:productId", authMiddleware, addToWishlist)
router.delete("/:productId", authMiddleware, isAdmin, deleteProduct)
module.exports = router; // Export the router directly, not as an object
