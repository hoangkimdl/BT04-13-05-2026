const productService = require('../services/productService');

const getProducts = async (req, res) => {
    const data = await productService.getProductsService(req.query);
    return res.status(200).json(data);
};

const getProductCategories = async (req, res) => {
    const data = await productService.getCategoriesService();
    return res.status(200).json({ items: data });
};

const getBestSellerProducts = async (req, res) => {
    const data = await productService.getTopProductsService(req.query, 'sold');
    return res.status(200).json(data);
};

const getMostViewedProducts = async (req, res) => {
    const data = await productService.getTopProductsService(req.query, 'views');
    return res.status(200).json(data);
};

const getProductDetailApi = async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id, { incrementViews: true });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    return res.status(200).json(product);
};

const getProductPage = async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id, { incrementViews: true });
    if (!product) return res.status(404).render('product.ejs', { product: null, similar: [] });
    const similar = await productService.getSimilarProducts(id, 6);
    return res.render('product.ejs', { product, similar });
};

const searchPage = async (req, res) => {
    try {
        const query = { ...req.query };
        if (query.q && !query.name) {
            query.name = query.q;
        }
        const data = await productService.getProductsService(query);
        return res.render('search.ejs', {
            items: data.items || [],
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 12,
            query
        });
    } catch (error) {
        console.error(error);
        return res.render('search.ejs', { items: [], total: 0, page: 1, limit: 12, query: {} });
    }
};

module.exports = {
    getProducts,
    getProductCategories,
    getBestSellerProducts,
    getMostViewedProducts,
    getProductDetailApi,
    getProductPage,
    searchPage
};
