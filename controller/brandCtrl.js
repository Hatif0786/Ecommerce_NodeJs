const Brand = require("../models/brandModel")
const asyncHandler = require("express-async-handler")
const validateMongoDbId = require("../utils/validateMongoDbIds")


const createBrand = asyncHandler(async(req, res) => {
    const {title} = req.body;
    try{
        await Brand.findOne({title: title}).then(async (resp) => {
            if(resp){
                throw new Error("Brand with "+title+" already exists!!")
            }else{
                await Brand.create(req.body).then((response) => {
                    return res.status(200).json(response)
                })
            }
        })
    }catch(e){
        throw new Error(e);
    }
})


const updateBrand = asyncHandler(async(req, res) => {
    const id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await Brand.findByIdAndUpdate(id, req.body, {new: true}).then((resp) => {
            return res.status(200).json(resp)
        })
    }catch(e){
        throw new Error(e);
    }
})


const deleteBrand = asyncHandler(async (req, res) => {
    let id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await Brand.findById(id).then(async (s) => {
            if(s!==null){
                await Brand.findByIdAndDelete(id).then(() => {
                    res.status(200).send("The Brand is successfully deleted!!")
                })
            }else{
                throw new Error(NOT_FOUND + " The Brand does not exist.")
            }
        })
    }catch(e){
        throw new Error(e);
    }
})

const getAllBrands = asyncHandler(async(req, res)=> {
    await  Brand.find().then((resp) => {
        return res.status(200).json(resp);
    })
})

const getBrand = asyncHandler(async(req, res)=> {
    let id = req?.params?.id;
    validateMongoDbId(id)
    try{
        await Brand.findById(id).then((resp) => {
            return res.status(200).json(resp);
        })
    }catch(error){
        throw new Error(e);
    }
})


module.exports={createBrand, updateBrand, deleteBrand, getAllBrands, getBrand}