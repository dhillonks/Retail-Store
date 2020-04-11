const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    image:{
        type: String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    bestSeller:{
        type: Boolean,
        required: true
    },
    description:{
        type: String
    },
    dateAdded:{
        type: Date,
        default: Date.now
    },
    addedBy:{
        type: String
    }
})

const productModel = mongoose.model('Product', productSchema);
module.exports = productModel;