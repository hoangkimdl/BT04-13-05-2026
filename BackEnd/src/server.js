require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRouters = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const { getProductPage, searchPage } = require('./controllers/productController');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
configViewEngine(app);
const webAPI = express.Router();
webAPI.get('/', getHomepage);
webAPI.get('/product/:id', getProductPage);
webAPI.get('/search', searchPage);
app.use('/', webAPI);
app.use('/v1/api', apiRouters);
(async () => {
    try {
        await connection();
        app.listen(PORT, () => {
            console.log(`Backend Nodejs App listening on port ${PORT}`);
        })
    } catch (error) {
        console.error('>>> Error connect to DB:', error);
    }
})()