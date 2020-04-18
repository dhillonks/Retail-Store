const express = require('express');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');

const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');
const productModel = require('../model/products');
const userModel = require('../model/user');
const orderModel = require('../model/orders');
const isLoggedIn = require('../middleware/auth');
const dashBoardLoader = require('../middleware/authorization');

//Email API
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/", (req,res) => {
    res.render("User/register", {
        title: "Registration"
    })
})
//Customer Registration:
router.get("/register", (req,res) => {
    res.render("User/register", {
        title: "Registration"
    })
})
//Login
router.get("/login", (req,res) => {
    res.render("User/login", {
        title: "Login"
    })
})
//Login Form:
router.post("/login", (req, res) => {
    let emailErrorMsg = "";
    let isEmailError = false;
    let passErrorMsg = "";
    let isPassError = false;

    let errorMessages = false;

    //Validating Email:
    if(req.body.email === ""){
        emailErrorMsg = "Please enter an email";
        isEmailError = true;
        errorMessages = true;
    }
    //Validating password:
    if(req.body.pass === ""){
        passErrorMsg = "Please enter password";
        isPassError = true;
        errorMessages = true;
    }

    if(errorMessages){
        //Invalid form:
        res.render("User/login", {
            title: "Login",
            userEmail: req.body.email,
            eErrorMsg: emailErrorMsg,
            eError: isEmailError,
            pErrorMsg: passErrorMsg,
            pError: isPassError 
        })
    }
    else{
        //Form data is valid:
        const emailRegex = new RegExp(req.body.email, 'i');
        userModel.findOne({email: emailRegex})
        .then(user=> {
            //Email not found:
            if(user == null){
                res.render("User/login", {
                    title: "Login",
                    userEmail: req.body.email,
                    eErrorMsg: 'Email and/or Password are incorrect',
                    eError: true,
                    pErrorMsg: passErrorMsg,
                    pError: isPassError 
                })
            }
            else{
                //Comparing entered password to the one stored:
                bcrypt.compare(req.body.pass, user.password)
                .then(isMatched => {
                    if(isMatched){
                        //Create the session:
                        req.session.userInfo = user;
                        let x = req.session.userInfo.cart.reduce((a, b) => a + (b.quantity || 0), 0);
                        req.session.noOfItems = x;
                        res.redirect("/User/dashboard");
                    }
                    else{
                        res.render("User/login", {
                            title: "Login",
                            userEmail: req.body.email,
                            eErrorMsg: 'Email and/or Password are incorrect',
                            eError: true,
                            pErrorMsg: passErrorMsg,
                            pError: isPassError 
                        })
                    }
                })
                .catch(err=>console.log(err));
            }
        })
        .catch(err=>console.log(`Error while finding user: ${err}`))
    }
});
//Dashboard route
router.get("/dashboard", isLoggedIn, dashBoardLoader);
//Cart:
router.get("/cart", isLoggedIn, (req, res) => {
    if(req.session.noOfItems > 0){
        //Get the products that are in the users cart:
        const userCart = req.session.userInfo.cart;
        const cartProdIDs = userCart.map(i => i.productID);

        let cartProducts = [];
        let orderTotal = 0;
        //Finding corresponding products to generate summary:
        productModel.find({_id: {$in: cartProdIDs}})
        .then((products)=>{
            //Getting product details:
            cartProducts = userCart.map(cartItem => {
                let index = products.findIndex(p => p._id.toString() === cartItem.productID);
                orderTotal += cartItem.quantity*products[index].price;
                return{
                    image: products[index].image,
                    title: products[index].title,
                    pID: cartItem.productID,
                    desc: products[index].description,
                    quantity: cartItem.quantity,
                    price: products[index].price,
                    itemTotal: cartItem.quantity*products[index].price
                }
            })
            res.render("User/cart", {
                title: "My Cart", 
                noProducts: false,
                product: cartProducts,
                orderTotal: orderTotal
            });

        });
    }
    else{
        //Cart is empty
        res.render("User/cart", {title: "My Cart", noProducts: true});
    }
})
//Place order:
router.post("/cart/:id", isLoggedIn, (req, res) => {
    if(req.session.userInfo.cart.length > 0){
        //Order object:
        const myOrder = {
            userID: req.session.userInfo._id,
            cart: [],
            total: 0
        }
        //Get user cart:
        userModel.findOne({_id: req.session.userInfo._id})
        .then(user => {
            //Find products, get details for order and decrement quantity accordingly
            let promises = [];
            let pTotal = 0;
            user.cart.forEach((cartItem, i) => {
                //Finding product:
                let x = productModel.findOne({_id: cartItem.productID})
                .then(product => {
                    //Adding product details to cart item:
                    myOrder.cart[i] = {
                        productName: product.title,
                        productID: product._id,
                        quantity: cartItem.quantity,
                        price: product.price,
                        itemTotal: cartItem.quantity*product.price
                    }
                    pTotal+=myOrder.cart[i].itemTotal;
                    product.quantity = product.quantity - cartItem.quantity;
                    let y = product.save();
                    promises.push(y);
                })
                .catch(err => console.log(err));
                promises.push(x);
            })

            let promises2 = [];
            Promise.all(promises)
            .then(() => {
                myOrder.total = pTotal;
                //Create order in the orders collection:
                const order = new orderModel(myOrder);

                let x = order.save()
                .then((o)=>{
                    console.log(o);
                    //Generate email:
                    let emailBody = generateEmail(myOrder.cart, o._id, user.name, o.total);
                    const msg = {
                        to: user.email,
                        from: 'donotreply@Fretail.com',
                        subject: "Order details: Fretail!",
                        text: `Order details`,
                        html: emailBody
                    };
                    let x1 = sgMail.send(msg).then(()=>{
                        console.log('Email sent');
                    }).catch(err=>(console.log(err)));
                    promises2.push(x1);
                })
                .catch(err=>console.log(err))
                promises2.push(x);
            })
            .catch(err=>console.log(err));

            //Finally empty user cart:
            Promise.all([...promises2, ...promises])
            .then(() => {
                //Empty cart:
                user.cart.splice(0, user.cart.length);
                req.session.userInfo = user;
                //Update user cart:
                userModel.updateOne({_id: user._id}, user)
                .then(()=>res.redirect("/home"))
                .catch(err=>console.log(err));
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
    }
    else{
        //Nothing in the users cart:
        res.redirect("/cart");
    }

})
//Register Form:
router.post("/register", (req, res) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;

    let nameErrorMsg = "";
    let isNameError = false;
    let emailErrorMsg = "";
    let isEmailError = false;
    let passErrorMsg = "";
    let isPassError = false;
    let passAgainErrorMsg = "";
    let isPassAgainError= false;

    let errorMessages = false;

    let promise1;
    //Validating name:
    if(req.body.name === ""){
        nameErrorMsg = "Enter your name";
        isNameError = true;
        errorMessages = true;
    }
    //Validating Email:
    if(req.body.email === ""){
        emailErrorMsg = "Enter your email";
        isEmailError = true;
        errorMessages = true;
    }
    else if(!emailRegex.test(req.body.email)){
        emailErrorMsg = "Please enter a valid email";
        isEmailError = true;
        errorMessages = true;
    }
    //Validating password:
    if(req.body.pass === ""){
        passErrorMsg = "Please enter password";
        isPassError = true;
        errorMessages = true;
    }
    else if(req.body.pass.length < 6){
        passErrorMsg = "Atleast 6 characters long";
        isPassError = true;
        errorMessages = true;
    }
    else if(!alphaNumericRegex.test(req.body.pass)){
        passErrorMsg = "Only numbers or alphabets allowed";
        isPassError = true;
        errorMessages = true;
    }
    //Validating re-entered password:
    if(!isPassError){
        //If password is entered successfully
        if(req.body.passAgain === ""){
            passAgainErrorMsg = "Re-enter your password";
            isPassAgainError = true;
            errorMessages = true;
        }
        else if(req.body.pass !== req.body.passAgain){
            passAgainErrorMsg = "Passwords do not match";
            isPassAgainError = true;
            errorMessages = true;
        }
    }
    
    if(errorMessages){
        //Invalid form:
        res.render("User/register", {
            title: "Registration",
            userEmail: req.body.email,
            userName: req.body.name,
            nErrorMsg: nameErrorMsg,
            nError: isNameError,
            eErrorMsg: emailErrorMsg,
            eError: isEmailError,
            pErrorMsg: passErrorMsg,
            pError: isPassError,
            pAgainErrorMsg: passAgainErrorMsg,
            pAgainError: isPassAgainError
        });
    }
    else{
        //Form data is valid:
        const newUser = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: req.body.pass
        };
        const user = new userModel(newUser);

        user.save()
        .then((user)=>{
            //Sending welcome email to new user
            const msg = {
                to: req.body.email,
                from: 'donotreply@Fretail.com',
                subject: "Welcome to Fretail!",
                text: `Hi ${req.body.name}, Thank you for registering on Fretail!.`,
                html: `<strong>Hi ${req.body.name}, Thank you for registering on Fretail!.</strong>`,
            };
            sgMail.send(msg).then(()=>{
                res.redirect("/user/login");
                console.log('Email sent');
            }).catch(err=>(console.log(err)));
        })
        .catch(err => {
            res.render("User/register", {
                title: "Registration",
                userEmail: req.body.email,
                userName: req.body.name,
                nErrorMsg: nameErrorMsg,
                nError: isNameError,
                eErrorMsg: 'Email already in use!',
                eError: true,
                pErrorMsg: passErrorMsg,
                pError: isPassError,
                pAgainErrorMsg: passAgainErrorMsg,
                pAgainError: isPassAgainError
            });
        });

        
    }
  });

//Logout:
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/user/login");
})

//Helper function to generate summary email when placing order:
function generateEmail(updatedUserCart, orderID, username, orderTotal){
    let headings = `<p><span style="font-family: Calibri, sans-serif; font-size: 18px;">Thank you for ordering on Fretail.</span></p>
    <p><span style="font-size: 
          18px;"><span style="font-family: Calibri, sans-serif;">Here are your product details:</span></span></p>`;
    let tableBody = `<tr>
    <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
    18px;"><span style="font-family: 
    Calibri, sans-serif;"><strong>Product Name</strong></span></span></td>
        <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
    18px;"><span style="font-family: 
    Calibri, sans-serif;"><strong>Price</strong></span></span></td>
        <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
    18px;"><span style="font-family: 
    Calibri, sans-serif;"><strong>Quantity</strong></span></span></td>
        <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
    18px;"><span style="font-family: 
    Calibri, sans-serif;"><strong>Item Total</strong><br></span></span></td>
    </tr>`;
    let total = 0;
    //Generating table rows for products
    updatedUserCart.forEach(p => {
        total+=p.itemTotal;
        tableBody+= `<tr>
        <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
        18px;"><span style="font-family: 
            Calibri, sans-serif;">${p.productName}</span></span></td>
                <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
        18px;"><span style="font-family: 
            Calibri, sans-serif;">$${p.price}</span></span></td>
                <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
        18px;"><span style="font-family: 
            Calibri, sans-serif;">${p.quantity}</span></span></td>
                <td style="width: 25%; background-color: rgb(239, 239, 239);"><span style="font-size: 
        18px;"><span style="font-family: 
        Calibri, sans-serif;">${p.itemTotal}</span></span></td>
        </tr>`;
    });

    let table = `<table style="width: 100%; border-collapse: collapse;"><tbody>${tableBody}</tbody></table>`;
    let summary = `<p><span style="font-size: 20px;"><span style="font-family: Calibri, sans-serif;">Order total:&nbsp;</span><span style="font-family: Calibri, sans-serif; color: rgb(65, 168, 95);"><strong>$${total}</strong></span></span></p>
    <p>Ordered By: ${username}</p>
    <p><span style="font-family: Calibri, sans-serif; font-size: 18px;">Order date: ${Date().toString()}</span></p>
    <p><span style="font-family: Calibri, sans-serif; font-size: 18px;">Order Number: ${orderID};</span></p>`;
    
    return `${headings}${table}${summary}`
}

module.exports = router;