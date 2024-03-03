const { default: mongoose } = require('mongoose')
const mongoos =  require('mongoose')

var productSchema = new mongoose.Schema({
    title:{type : String, required : true},
    description:{type: String, required: true},
    price: {type: Number, required: true},
    slug: {type: String, required: true, lowercase:true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    quantity: {type: Number, default: 0},
    images: [],
    color: {type:String, required: true},
    ratings: [{star: Number, comment:String, postedBy:{type: mongoose.Schema.Types.ObjectId, ref:"User"}}],
    brand: {type: String, required: true},
    sold: {type: Number, default:0},
    totalRating: {type: String, default: 0}

}, {
    timestamps: true
})


module.exports=mongoose.model("Product", productSchema)