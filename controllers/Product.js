const express = require('express');
const router = express.Router();

//Models:
const productModel = require('../model/products');

//Products route
router.get("/", (req,res) => {
    res.render("General/products", {
        title: "Products",
        category: productModel.categories,
        prod: productModel.products
    })
})

module.exports = router;