const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Shape of order documents entering the database:
const orderSchema = new Schema({
    dateOrdered: {
        type: Date,
        default: Date.now()
    },
    userID: {
        type: String,
        required: true
    },
    cart: {
        type: [{
            productID: String,
            quantity: Number
        }]
    },
    total: {
        type: Number
    }
});

module.exports = mongoose.model('Order', orderSchema); 