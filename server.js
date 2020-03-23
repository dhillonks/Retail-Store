require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
//Models:
const productModel = require('./model/products');
const categoriesModel = require('./model/productCategories');
const bestSellersModel = require('./model/bestSellingProducts');

const app = express();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static("public"));

//Home route
app.get("/", (req,res) => {
    res.render("home", {
        title: "Home Page",
        bestSeller: bestSellersModel,
        prodCategory: categoriesModel
    })
})
app.get("/home", (req,res) => {
    res.render("home", {
        title: "Home Page",
        bestSeller: bestSellersModel,
        prodCategory: categoriesModel
    })
})
//Products route
app.get("/products", (req,res) => {
    res.render("products", {
        title: "Products",
        category: productModel.categories,
        prod: productModel.products
    })
})
//Customer Registration:
app.get("/register", (req,res) => {
    res.render("register", {
        title: "Registration"
    })
})
//Login
app.get("/login", (req,res) => {
    res.render("login", {
        title: "Login"
    })
})
//Login Form:
app.post("/login", (req, res) => {
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
        res.render("login", {
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
        res.render("home", {
            title: "Home Page",
            bestSeller: bestSellersModel,
            prodCategory: categoriesModel
        })
    }
});
//Register Form:
app.post("/register", (req, res) => {
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
        res.render("register", {
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
            from: 'donotreply@ksdhillon11Amazon.com',
            subject: "Welcome to our Kunwarvir's Amazon",
            text: `Hi ${req.body.name}, Thank you for registering!.`,
            html: `<strong>Hi ${req.body.name}, Thank you for registering!.</strong>`,
        };
        sgMail.send(msg).then(()=>{
            res.render("dashboard", {
                title: "Your Account",
                uName: req.body.name
            })
            console.log('Email sent');
        }).catch(err=>(console.log(err)));
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Web Server is connected");
})