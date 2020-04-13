require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Importing router objects:
const generalRoutes = require('./controllers/General');
const userRoutes = require('./controllers/User');
const productRoutes = require('./controllers/Product');
const invClerkRoutes = require('./controllers/Clerk');

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
    if(req.query.method === "PUT"){
        req.method = "PUT";
    }
    else if(req.query.method === "DELETE"){
        req.method = "DELETE";
    }
    next();
});

//Mapping express to all router objects
app.use("/",generalRoutes);
app.use("/user",userRoutes);
app.use("/products",productRoutes);
app.use("/inv", invClerkRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Web Server is connected");
})