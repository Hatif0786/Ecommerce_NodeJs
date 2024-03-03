const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require('fs')


const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../public/images"));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Fixed le9 to 1e9
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
    }
});

const multerFilter = (req, file, cb) => { // Fixing parameter name from sb to cb
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false); // Correcting error object format
    }
}

const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 2000000 } // Fixed fieldSize to fileSize
});

const productImgResize = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    await Promise.all(
        req.files.map(async (file) => {
            await sharp(file.path).resize(300, 300).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/images/products/${file.filename}`)
            fs.unlinkSync(`public/images/products/${file.filename}`)
        })
    );
    next();
}

const blogImgResize = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    await Promise.all(
        req.files.map(async (file) => {
            await sharp(file.path).resize(300, 300).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/images/blogs/${file.filename}`)
            fs.unlinkSync(`public/images/blogs/${file.filename}`)
        })
    );
    next();
}


module.exports = { uploadPhoto, productImgResize, blogImgResize};
