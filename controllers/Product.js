const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/auth')
//Models:
const productModel = require('../model/products');
const userModel = require('../model/user');

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
                    description: product.description,
                    bestSeller: product.bestSeller,
                    category: product.category,
                    quantity: product.quantity
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
    
    //Filtering by category:
    if(req.body.category === "All"){
        //Match products by search:
        productModel.find({title: regex})
        .then(products => {
            const filteredProducts = products.map(product => {
                return {
                    id: product._id,
                    title: product.title,
                    image: product.image,
                    price: product.price,
                    category: product.category,
                    bestSeller: product.bestSeller,
                    quantity: product.quantity
                }
            });
            res.render("Product/search", {
                title: "Products",
                prod: filteredProducts,
                notFound: products.length === 0,
                searchWord: req.body.searchKeywords
            })
        })
    }
    else{
        productModel.find({
            title: regex,
            category: req.body.category})
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
        .catch(err=>console.log(`Error while searching products ${err}`))
    }
    
})
//Whenever the user clicks on a product to view it:
router.get("/view/:id", (req, res) => {
    
    let quantityUser = 0;
    //Check to see if user doesn't already have the same product in cart:
    if(req.session.userInfo){
        let index = req.session.userInfo.cart.findIndex(i => i.productID === req.params.id);
        if(index != -1){
            quantityUser = req.session.userInfo.cart[index].quantity;
        }
    }
    console.log(quantityUser);
    productModel.findOne({_id: req.params.id})
    .then(product => {
        if(product){
            console.log(product.quantity);
            res.render("Product/viewProduct", {
                title: product.title,
                pTitle: product.title,
                pID: product._id,
                pImage: product.image,
                pPrice: product.price,
                pDescription: product.description,
                pQuantity: product.quantity - quantityUser,
                maxQuantity: product.quantity,
                inStock: (product.quantity - quantityUser) > 0,
                helpers: {
                    times: function(n, block) {
                        var accum = '';
                        for(var i = 1; i <= n; ++i)
                            accum += block.fn(i);
                        return accum;
                    }
                }
            });
        }
    })
    .catch(err=>console.log(`Error finding product to view ${err}`));
})
//Add to cart route:
router.post("/cart/:id", isLoggedIn, (req, res) => {
    req.body.quantity = parseInt(req.body.quantity);
    req.body.maxQuantity = parseInt(req.body.maxQuantity);
    //Store the cart item on the users cart:
    userModel.findOne({_id: req.session.userInfo._id})
    .then((user)=>{
        let notAddedToCart = true;
        if(req.body.quantity <= req.body.maxQuantity){
            //Check if the product already exists in the cart:
            let index = user.cart.findIndex(i => i.productID === req.params.id);
            if(index != -1){
                console.log('UserQuantity', user.cart[index].quantity);
                console.log('q',req.body.quantity);
                console.log('total',req.body.maxQuantity);
                //Ensuring that only quantity in stock is allocated on the cart
                if(user.cart[index].quantity + req.body.quantity <= req.body.maxQuantity){
                    //Increment the quantity:
                    user.cart[index].quantity+=req.body.quantity;
                    notAddedToCart = false;
                }                
            }
            else{
                notAddedToCart = false;
                //Add item to the cart
                const item = {
                    productID: req.params.id,
                    quantity: req.body.quantity
                }
                user.cart.push(item);
            }
        }
        if(notAddedToCart){
            //Not enough quantity in stock
            res.redirect("/home");
        }
        else{
            req.session.userInfo = user;
            userModel.updateOne({_id: user._id}, user)
            .then(()=>{
                res.redirect("/user/cart");
            })
            .catch(err=>console.log(err));
        }
    })
    .catch(err=>console.log(err));
});
//Add to cart route:
router.get("/removecart/:id", isLoggedIn, (req, res) => {
    //Store the cart item on the users cart:
    userModel.findOne({_id: req.session.userInfo._id})
    .then((user)=>{
        let index = user.cart.findIndex(i => req.params.id === i.productID);

        if(index != -1){
            user.cart.splice(index, 1);
            req.session.userInfo = user;
            userModel.updateOne({_id: req.session.userInfo._id}, user)
            .then(() => {
                res.redirect("/user/cart");
            })
            .catch(err => console.log(err))
        }
        else{
            res.redirect("user/cart");
        }
    })
    .catch(err=>console.log(err));
});

module.exports = router;