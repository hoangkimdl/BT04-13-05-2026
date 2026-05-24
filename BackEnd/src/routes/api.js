const express = require('express');
const {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    forgotPassword,
    verifyResetCode,
    resetPassword
} = require('../controllers/userController');
const {
    getProducts,
    getProductCategories,
    getBestSellerProducts,
    getMostViewedProducts,
    getProductDetailApi
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { getCart, addCartItem, setCartItem, removeCartItem, checkout } = require('../controllers/cartController');
const { getMyOrders, getOrderDetail, cancelOrder, updateOrderStatus } = require('../controllers/orderController');
const routerAPI = express.Router();
routerAPI.use(delay);
routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
})
routerAPI.get('/products', getProducts);
routerAPI.get('/products/categories', getProductCategories);
routerAPI.get('/products/top/bestsellers', getBestSellerProducts);
routerAPI.get('/products/top/most-viewed', getMostViewedProducts);
routerAPI.get('/products/:id', getProductDetailApi);
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post('/forgot-password', forgotPassword);
routerAPI.post('/verify-reset-code', verifyResetCode);
routerAPI.post('/reset-password', resetPassword);
routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", delay, getAccount);
// Cart APIs (require auth)
routerAPI.get('/cart', auth, getCart);
routerAPI.post('/cart/items', auth, addCartItem); // body: { productId, qty }
routerAPI.put('/cart/items/:productId', auth, setCartItem); // body: { qty }
routerAPI.delete('/cart/items/:productId', auth, removeCartItem);
routerAPI.post('/cart/checkout', auth, checkout);
routerAPI.get('/orders', auth, getMyOrders);
routerAPI.get('/orders/:id', auth, getOrderDetail);
routerAPI.post('/orders/:id/cancel', auth, cancelOrder);
routerAPI.put('/orders/:id/status', auth, updateOrderStatus);
module.exports = routerAPI;
