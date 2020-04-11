const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCategoriesSchema = Schema({
    category:{
        type: String,
        required: true,
        trim: true
    },
    img:{
        type: String,
        required: true,
        trim: true
    },
    dateAdded:{
        type: Date,
        default: Date.now
    },
    addedBy:{
        type: String
    }
});

const categoriesModel = mongoose.model('Category', productCategoriesSchema);

module.exports = categoriesModel;