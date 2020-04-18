const express = require('express');
const router = express.Router();

//Models:
const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');
const productsModel = require('../model/products')
//Home route
router.get("/", (req,res) => {
    res.redirect("/home");
});

router.get("/home", (req,res) => {
    let filteredCategories, filteredBestSellers, filteredProducts;

    //Assignment (3-5):
    //Populating best sellers from products:
    //Since only 1 bestSelling category was required for assignment one, we only have footwear bestsellers on homepage:
    //That is why not dynamically generating category boxes. Thus, only populating products into the Footwear bestsellers:

    const promise1 = productsModel.find({bestSeller: true, category: 'Footwear'})
        .then(products => {
            filteredProducts = products.map(prod => {
                return {
                    id: prod._id,
                    image: prod.image,
                    title: prod.title,
                    price: prod.price,
                    category: prod.category,
                    description: prod.description,
                    bestSeller: prod.bestSeller
                }
            });
            filteredBestSellers = {
                category: 'Footwear',
                prods: filteredProducts
            };
        })
        .catch(err => console.log(`Error while populating bestSellers from products: ${err}`));

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
            res.render("General/home", {
                title: "Home Page",
                bestSeller: filteredBestSellers,
                prodCategory: filteredCategories
            })
    });
        
})

module.exports = router;