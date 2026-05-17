const Product = require('../models/product');

const createProductService = async (payload) => {
    try {
        const p = await Product.create(payload);
        return p;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getProductsService = async (query) => {
    try {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 12);
        const filters = {};
        if (query.name) filters.name = { $regex: query.name, $options: 'i' };
        if (query.category) filters.category = query.category;
        if (query.minPrice) filters.price = { ...filters.price, $gte: Number(query.minPrice) };
        if (query.maxPrice) filters.price = { ...filters.price, $lte: Number(query.maxPrice) };
        if (query.isNew) filters.isNew = query.isNew === 'true';
        if (query.isOnSale) filters.isOnSale = query.isOnSale === 'true';

        let sortObj = { createdAt: -1 };
        if (query.sort === 'price_asc') sortObj = { price: 1 };
        if (query.sort === 'price_desc') sortObj = { price: -1 };
        if (query.sort === 'bestseller') sortObj = { sold: -1 };

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Product.find(filters).sort(sortObj).skip(skip).limit(limit),
            Product.countDocuments(filters)
        ]);

        return { items, total, page, limit };
    } catch (error) {
        console.error(error);
        return { items: [], total: 0, page: 1, limit: 12 };
    }
}

const getProductById = async (id) => {
    try {
        return await Product.findById(id);
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getNewest = async (limit = 8) => {
    try {
        return await Product.find({}).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getBestsellers = async (limit = 8) => {
    try {
        return await Product.find({}).sort({ sold: -1 }).limit(limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getPromotions = async (limit = 8) => {
    try {
        return await Product.find({ isOnSale: true }).limit(limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getSimilarProducts = async (productId, limit = 6) => {
    try {
        const p = await getProductById(productId);
        if (!p) return [];
        return await Product.find({ category: p.category, _id: { $ne: productId } }).limit(limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

const updateStock = async (productId, qty) => {
    try {
        return await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty, sold: qty } }, { new: true });
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    createProductService,
    getProductsService,
    getProductById,
    getNewest,
    getBestsellers,
    getPromotions,
    getSimilarProducts,
    updateStock
};
