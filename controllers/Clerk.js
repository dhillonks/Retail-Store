const express = require('express');
const router = express.Router();
const path = require('path');

const productModel = require('../model/products');

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
    let picErrorMsg = "";
    let isPicError = false;
    let imgMIMERegex = /image\/\w*/;

    if(!req.files){
        picErrorMsg = "No picture uploaded!";
        isPicError = true;
    }
    else if(!imgMIMERegex.test(req.files.pic.mimetype)){
        picErrorMsg = "Only upload images!"
        isPicError = true;
    }
    
    //Creating product object
    const newProduct = {
        title: req.body.title,
        price: req.body.price,
        category: req.body.category,
        bestSeller: req.body.bestSeller === 'Yes',
        description: req.body.desc,
        quantity: req.body.quantity
    }

    if(isPicError){
        res.render("InventoryClerk/add", {
            title: "Add Product",
            pTitle: req.body.title,
            pPrice: req.body.price,
            pQuantity: req.body.quantity,
            pDesc: req.body.desc,
            pBestSeller: req.body.bestSeller === 'Yes',
            pCategory: req.body.category,
            picErrorMsg: picErrorMsg,
            picError: isPicError
        });
    }
    else{
        const product = new productModel(newProduct);
        product.save()
        .then((product) => {
            //Changing picture name and updating the product in database to reflect that
            req.files.pic.name = `pic_${product._id}${path.parse(req.files.pic.name).ext}`;
            //Storing picture in public/uploads
            req.files.pic.mv(`public/uploads/${req.files.pic.name}`)
            .then(()=>{
                productModel.updateOne({_id: product._id}, {
                    image: `/uploads/${req.files.pic.name}`
                })
                .then(()=>{
                    res.redirect("/inv");
                })
                .catch(err=>console.log(`Error while updating product image`));
            })
            .catch(err=>console.log(`Error while moving product image: ${err}`))
        })
        .catch(err=>console.log(`Error while inserting product: ${err}`))
    }    
})
//Edit a product
router.get("/edit/:id", (req,res) => {
    productModel.findOne({_id: req.params.id})
    .then((product)=>{
        res.render("InventoryClerk/update", {
            title: "Update Product",
            id: req.params.id,
            pTitle: product.title,
            pPrice: product.price,
            pQuantity: product.quantity,
            pDesc: product.description,
            pBestSeller: product.bestSeller,
            pCategory: product.category,
            pImage: product.image
        });
    })
    .catch(err=>console.log(`Error while finding product ${req.params.id}: ${err}`))
});
//Delete a product
router.delete("/delete/:id", (req,res) => {
    productModel.deleteOne({_id: req.params.id})
        .then(()=>{
            res.redirect("/inv");
        })
        .catch(err => console.log(`Error while deleting product ${req.params.id}: ${err}`))
});
//Update product form submission:
router.put("/update/:id", (req, res) => {
    let picErrorMsg = "";
    let isPicError = false;
    let imgMIMERegex = /image\/\w*/;
    let imageUploaded = false;

    if(req.files){//If user uploaded a new file
        if(!imgMIMERegex.test(req.files.pic.mimetype)){
            picErrorMsg = "Only upload images!"
            isPicError = true;
        }
        imageUploaded = true;
    }    
    //Creating product object
    const newProduct = {
        title: req.body.title,
        price: req.body.price,
        category: req.body.category,
        bestSeller: req.body.bestSeller === 'Yes',
        description: req.body.desc,
        quantity: req.body.quantity
    }

    if(isPicError){
        res.render("InventoryClerk/add", {
            title: "Add Product",
            pTitle: req.body.title,
            pPrice: req.body.price,
            pQuantity: req.body.quantity,
            pDesc: req.body.desc,
            pBestSeller: req.body.bestSeller === 'Yes',
            pCategory: req.body.category,
            picErrorMsg: picErrorMsg,
            picError: isPicError
        });
    }
    else{
        if(imageUploaded){
            //Changing picture name and updating the product in database to reflect that
            req.files.pic.name = `pic_${req.params.id}${path.parse(req.files.pic.name).ext}`;
            //Storing picture in public/uploads
            req.files.pic.mv(`public/uploads/${req.files.pic.name}`)
                .then(()=>{
                    //Updating product in database:
                    productModel.updateOne({_id: req.params.id}, newProduct)
                    .then(()=>{
                        res.redirect("/inv");
                    })
                    .catch( err=> `Error while updating product ${req.params.id}: ${err}`)
                })
                .catch(err => console.log(`Error while replacing product ${req.params.id} image: ${err}`));
        }
        else{
            productModel.updateOne({_id: req.params.id}, newProduct)
                    .then(()=>{
                        res.redirect("/inv");
                    })
                    .catch( err=> `Error while updating product ${req.params.id}: ${err}`)
        }
    }    
})
//Search products form submission:
router.post("/search", (req, res) => {
    const regex = new RegExp(req.body.searchKeywords, 'i');
   
    //Match products by search:
    productModel.find({title: regex})
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
        })
        .catch(err=>console.log(err));
})
module.exports = router;