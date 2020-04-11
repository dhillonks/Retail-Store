require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Importing router objects:
const generalRoutes = require('./controllers/General');
const userRoutes = require('./controllers/User');
const productRoutes = require('./controllers/Product');

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

//Mapping express to all router objects
app.use("/",generalRoutes);
app.use("/user",userRoutes);
app.use("/products",productRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Web Server is connected");
})