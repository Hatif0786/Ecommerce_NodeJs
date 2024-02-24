const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { createBrand, updateBrand, deleteBrand, getBrand, getAllBrands } = require("../controller/brandCtrl");
const router = express.Router();


router.post("/add", authMiddleware, isAdmin, createBrand)
router.patch("/update/:id", authMiddleware, isAdmin, updateBrand)
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/", authMiddleware, getAllBrands)
router.get("/:id", authMiddleware, getBrand)


module.exports = router