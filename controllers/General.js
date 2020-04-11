const express = require('express');
const router = express.Router();

//Models:
const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');

//Home route
router.get("/", (req,res) => {
    let filteredBestSellers, filteredCategories;
    bestSellersModel.find()
        .then(bestSellers => {
            filteredBestSellers = bestSellers.map(bestSeller => {
                return {
                    id: bestSeller._id,
                    category: bestSeller.category,
                    prods: bestSellers.prods
                }
            });
        })
        .catch(err => console.log(`Error while finding bestSellers (Home page): ${err}`));

    categoriesModel.find()
        .then(categories => {
            filteredCategories = categories.map(category => {
                return {
                    id: bestSeller._id,
                    category: bestSeller.category,
                    img: bestSeller.img
                }
            });
        })
        .catch(err => console.log(`Error while finding categories (Home page): ${err}`));
     
    res.render("General/home", {
        title: "Home Page",
        bestSeller: filteredBestSellers,
        prodCategory: filteredCategories
    })
})

router.get("/home", (req,res) => {
    let filteredBestSellers, filteredCategories;
    const promise1 = bestSellersModel.find()
        .then(bestSellers => {
            filteredBestSellers = bestSellers.map(bestSeller => {
                return {
                    id: bestSeller._id,
                    category: bestSeller.category,
                    prods: bestSeller.prods.toObject().map(product => {
                        return{
                            id: product._id,
                            name: product.name,
                            image: product.image
                        }
                    })
                }
            });
            filteredBestSellers = filteredBestSellers[0];
        })
        .catch(err => console.log(`Error while finding bestSellers (Home page): ${err}`));

    const promise2 = categoriesModel.find()
        .then(categories => {
            filteredCategories = categories.map(category => {
                return {
                    id: category._id,
                    category: category.category,
                    img: category.img
                }
            });
        })
        .catch(err => console.log(`Error while finding categories (Home page): ${err}`));
     
    Promise.all([promise1, promise2])
        .then(function(){
            console.log(filteredBestSellers);
        res.render("General/home", {
            title: "Home Page",
            bestSeller: filteredBestSellers,
            prodCategory: filteredCategories
        })
        });
        
})

module.exports = router;