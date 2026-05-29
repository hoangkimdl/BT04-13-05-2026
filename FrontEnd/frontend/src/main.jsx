// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )




import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ProductDetail from './pages/productDetail.jsx';
import SearchPage from './pages/search.jsx';
import CartPage from './pages/cart.jsx';
import ForgotPasswordPage from './pages/forgotPassword.jsx';
import ArticlesPage from './pages/articles.jsx';
import ArticleDetailPage from './pages/articleDetail.jsx';
import CategoryProductsPage from './pages/categoryProducts.jsx';
import OrdersPage from './pages/orders.jsx';
import OrderDetailPage from './pages/orderDetail.jsx';
import ProfilePage from './pages/profile.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "user",
                element: <UserPage />
            },
                {
                    path: "product/:id",
                    element: <ProductDetail />
                },
                {
                    path: "search",
                    element: <SearchPage />
                },
                {
                    path: "danh-muc/:category",
                    element: <CategoryProductsPage />
                },
                {
                    path: "cart",
                    element: <CartPage />
                },
                {
                    path: "orders",
                    element: <OrdersPage />
                },
                {
                    path: "orders/:id",
                    element: <OrderDetailPage />
                },
                {
                    path: "profile",
                    element: <ProfilePage />
                },
                {
                    path: "tin-tuc",
                    element: <ArticlesPage />
                },
                {
                    path: "tin-tuc/:slug",
                    element: <ArticleDetailPage />
                },
        ]
    },
    {
        path: "register",
        element: <RegisterPage />
    },
    {
        path: "login",
        element: <LoginPage />
    },
    {
        path: "forgot-password",
        element: <ForgotPasswordPage />
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>,
)
