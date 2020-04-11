require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

//Importing router objects:
const generalRoutes = require('./controllers/General');
const userRoutes = require('./controllers/User');
const productRoutes = require('./controllers/Product');

const app = express();

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