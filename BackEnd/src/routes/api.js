const express = require('express');
const { createUser, handleLogin, getUser, getAccount} = require('../controllers/userController');
const { getProducts, getProductDetailApi } = require('../controllers/productController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { getCart, addCartItem, setCartItem, removeCartItem, checkout } = require('../controllers/cartController');
const routerAPI = express.Router();
routerAPI.use(delay);
routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
})
routerAPI.get('/products', getProducts);
routerAPI.get('/products/:id', getProductDetailApi);
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", delay, getAccount);
// Cart APIs (require auth)
routerAPI.get('/cart', auth, getCart);
routerAPI.post('/cart/items', auth, addCartItem); // body: { productId, qty }
routerAPI.put('/cart/items/:productId', auth, setCartItem); // body: { qty }
routerAPI.delete('/cart/items/:productId', auth, removeCartItem);
routerAPI.post('/cart/checkout', auth, checkout);
module.exports = routerAPI;