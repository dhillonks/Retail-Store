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
                    price: product.price,
                    category: product.category,
                    bestSeller: product.bestSeller
                }
            });

            let prodCategories = new Set(filteredProducts.map(prod => {
                return prod.category;
            }));
                
            prodCategories = Array.from(prodCategories);
        
            res.render("General/products", {
                title: "Products",
                category: prodCategories,
                prod: filteredProducts
            })
        })
        .catch(err => console.log(`Error while finding products: ${err}`));

})

module.exports = router;