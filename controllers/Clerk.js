const express = require('express');
const router = express.Router();

const productModel = require('../model/products')
//Clerk inventory dashboard home
router.get("/", (req, res) => {
    productModel.find()
        .then(products => {
            const filteredProducts = products.map((product, i) => {
                return {
                    index: i + 1,
                    id: product._id,
                    title: product.title,
                    category: product.category,
                }
            });

            res.render("InventoryClerk/dashboard", {
                title: "Inventory Clerk",
                prod: filteredProducts
            });
        });
});
//Add product route
router.get("/add", (req, res) => {
    res.render("InventoryClerk/add", {title: "Add Product"});
})
//Add product form submission:
router.post("/add", (req, res) => {

})
//Edit a product
router.put("/:id", (req,res) => {
    console.log(req.params.id);
});
module.exports = router;