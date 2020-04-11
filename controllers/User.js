const express = require('express');
const path = require('path');
const router = express.Router();

const categoriesModel = require('../model/productCategories');
const bestSellersModel = require('../model/bestSellingProducts');

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
        res.render("General/home", {
            title: "Home Page",
            bestSeller: bestSellersModel,
            prodCategory: categoriesModel
        })
    }
});
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
        })
    }
    else{
        //Form data is valid:
        const msg = {
            to: req.body.email,
            from: 'donotreply@ksdhillon11Fretail.com',
            subject: "Welcome to our Fretail!",
            text: `Hi ${req.body.name}, Thank you for registering on Fretail!.`,
            html: `<strong>Hi ${req.body.name}, Thank you for registering on Fretail!.</strong>`,
        };
        sgMail.send(msg).then(()=>{
            res.render("User/dashboard", {
                title: "Your Account",
                uName: req.body.name
            })
            console.log('Email sent');
        }).catch(err=>(console.log(err)));
    }
  });

  module.exports = router;