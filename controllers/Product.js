const express = require('express');
const router = express.Router();

//Models:
const productModel = require('../model/products');

//Products route
router.get("/", (req,res) => {

    productModel.find()
        .then(products => {
            const filteredProducts = products.map(product => {
                return {
                    id: product._id,
                    image: product.image,
                    title: product.title,
                    price: product.price,
                    category: product.category,
                    bestSeller: product.bestSeller
                }
            });

            let prodCategories = new Set(filteredProducts.map(prod => {
                return prod.category;
            }));
                
            prodCategories = Array.from(prodCategories);
        
            res.render("Product/products", {
                title: "Products",
                category: prodCategories,
                prod: filteredProducts
            })
        })
        .catch(err => console.log(`Error while finding products: ${err}`));
})

//Search products functionality:
router.post("/search", (req, res) => {
    const regex = new RegExp(req.body.searchKeywords, 'i');
    productModel.find({title: regex})
        .then(products => {
            const filteredProducts = products.map(product => {
                return {
                    id: product._id,
                    title: product.title,
                    image: product.image,
                    price: product.price,
                    category: product.category,
                    bestSeller: product.bestSeller
                }
            });
            res.render("Product/search", {
                title: "Products",
                prod: filteredProducts,
                notFound: products.length === 0,
                searchWord: req.body.searchKeywords
            })
        })
})

module.exports = router;