const mongoose = require('mongoose')

const dbConnect = () => {
    const dbUrl = process.env.MONGODB_URL
    try{
        const conn = mongoose.connect('mongodb+srv://hatifkhuld90:Hatif.khuld1@hatif-cluster.8bjsgi3.mongodb.net/')
        console.log('Database connected successfully!');
    }catch(e){
        console.log('Connected refused!');
    }
}

module.exports = dbConnect;