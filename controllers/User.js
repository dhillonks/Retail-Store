const express = require('express');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');

const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');
const productModel = require('../model/products');
const userModel = require('../model/user');
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
        userModel.findOne({email: req.body.email})
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
        isCartEmpty = false;
        //Get the products that are in the users cart:
        const userCart = req.session.userInfo.cart;
        const cartProdIDs = userCart.map(i => i.productID);

        //Finding corresponding products
        productModel.find({_id: {$in: cartProdIDs}})
        .then((products)=>{
            console.log(products);
        })
        .catch(err=>console.log(err));
    }
    else{
        //Cart is empty
        res.render("User/cart", {title: "My Cart", noProducts: true});
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
            email: req.body.email,
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

module.exports = router;