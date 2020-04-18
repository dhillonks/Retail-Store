require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const session = require('express-session');

//Importing router objects:
const generalRoutes = require('./controllers/General');
const userRoutes = require('./controllers/User');
const productRoutes = require('./controllers/Product');
const invClerkRoutes = require('./controllers/Clerk');
const isAdmin = require('./middleware/adminAuth');
//Connecting to mongoDB through mongoose
mongoose.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        //Callback for promise resolved
        console.log('Connected to MongoDB');
    })
    .catch(err => console.log(`Error occured: ${err}`));

//Creating express object
const app = express();

//Setting handlebars as template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static("public"));

//Allows specific forms/links that are submitted/pressed to send PUT and DELETE requests
app.use((req, res, next) => {
    if(req.query.method == "PUT"){
        req.method = "PUT";
    }
    else if(req.query.method == "DELETE"){
        req.method = "DELETE";
    }
    next();
});

//Express-fileupload middleware
app.use(fileUpload());

const productModel = require('./model/products');
//Custom middleware function:
app.use((req, res, next) => {
    //Creating a global handlebars variable
    //To be used for populating categories in the navbar search
    productModel.find()
    .then(products=>{
        res.locals.sCategories = [...new Set(products.map(prod => prod.category))];
        next();
        //res.locals.searchCategories = products.map
    })
});

app.use(session({
    secret: `${process.env.SECRET_KEY}`,
    resave: false,
    saveUninitialized: true
}));

app.use((req,res,next) => {
    //Creating a local variable for user for handlebars access
    res.locals.user = req.session.userInfo;
    if('userInfo' in req.session){
        let x = req.session.userInfo.cart.reduce((a, b) => a + (b.quantity || 0), 0);
        req.session.noOfItems = x;
    }
    res.locals.noOfItems = req.session.noOfItems;
    next();
});

//Mapping express to all router objects
app.use("/",generalRoutes);
app.use("/user",userRoutes);
app.use("/products",productRoutes);
app.use("/inv", isAdmin, invClerkRoutes);
app.use("/", (req, res) => {
    res.render("General/404", {title: 'Not found'});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Web Server is connected");
})