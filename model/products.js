const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    image:{
        type: String
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
    quantity: {
        type: Number
    },
    addedBy:{
        type: String
    }
})

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;