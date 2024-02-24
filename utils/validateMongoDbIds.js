const mongoose = require('mongoose')

const validateMongoDbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        throw new Error("The id is not valid or maybe not found!")
    }
}

module.exports = validateMongoDbId