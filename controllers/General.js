const express = require('express');
const router = express.Router();

//Models:
const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');

//Home route
router.get("/", (req,res) => {
    res.render("General/home", {
        title: "Home Page",
        bestSeller: bestSellersModel,
        prodCategory: categoriesModel
    })
})
router.get("/home", (req,res) => {
    res.render("General/home", {
        title: "Home Page",
        bestSeller: bestSellersModel,
        prodCategory: categoriesModel
    })
})

module.exports = router;