const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bestSellerSchema = new Schema({
    category: {
        type: String
    },
    prods: {
        type: [{
            name: String,
            image: String
        }]
    },
}, {
    toObject:{
        virtuals: true
    }
});

const bestSellerModel = mongoose.model('bestseller', bestSellerSchema);
module.exports = bestSellerModel;