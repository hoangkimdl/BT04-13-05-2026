const Product = require('../models/product');
const mongoose = require('mongoose');

const getPagination = (query, defaultLimit = 12, maxLimit = 100) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || defaultLimit), 1), maxLimit);
    return { page, limit, skip: (page - 1) * limit };
};

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
        const { page, limit, skip } = getPagination(query);
        const filters = {};
        const keyword = query.name || query.q;
        if (keyword) {
            filters.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ];
        }
        if (query.category) filters.category = query.category;
        if (query.brand) filters.brand = query.brand;
        if (query.minPrice) filters.price = { ...filters.price, $gte: Number(query.minPrice) };
        if (query.maxPrice) filters.price = { ...filters.price, $lte: Number(query.maxPrice) };
        if (query.isNew) filters.isNew = query.isNew === 'true';
        if (query.isOnSale) filters.isOnSale = query.isOnSale === 'true';

        let sortObj = { createdAt: -1 };
        if (query.sort === 'price_asc') sortObj = { price: 1 };
        if (query.sort === 'price_desc') sortObj = { price: -1 };
        if (query.sort === 'bestseller') sortObj = { sold: -1 };

        const [items, total] = await Promise.all([
            Product.find(filters).sort(sortObj).skip(skip).limit(limit),
            Product.countDocuments(filters)
        ]);

        return { items, total, page, limit, hasMore: page * limit < total };
    } catch (error) {
        console.error(error);
        return { items: [], total: 0, page: 1, limit: 12 };
    }
}

const getProductById = async (id, options = {}) => {
    try {
        const update = options.incrementViews ? { $inc: { views: 1 } } : null;
        const queryOptions = { new: true };

        if (mongoose.Types.ObjectId.isValid(id)) {
            if (update) return await Product.findByIdAndUpdate(id, update, queryOptions);
            return await Product.findById(id);
        }

        if (update) return await Product.findOneAndUpdate({ slug: id }, update, queryOptions);
        return await Product.findOne({ slug: id });
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getCategoriesService = async () => {
    try {
        const categories = await Product.aggregate([
            { $match: { category: { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    thumbnail: { $first: { $ifNull: ['$thumbnail', { $arrayElemAt: ['$images', 0] }] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return categories.map((item) => ({
            name: item._id,
            count: item.count,
            thumbnail: item.thumbnail || '/logo.jpg'
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getTopProductsService = async (query, sortField) => {
    try {
        const topLimit = 10;
        const { page, limit, skip } = getPagination(query, 4, 10);
        const filters = {};
        if (query.category) filters.category = query.category;
        if (query.brand) filters.brand = query.brand;

        if (skip >= topLimit) {
            const total = await Product.countDocuments(filters);
            return { items: [], total: Math.min(total, topLimit), page, limit, hasMore: false };
        }

        const effectiveLimit = Math.min(limit, topLimit - skip);
        const sortObj = { [sortField]: -1, createdAt: -1 };
        const [items, total] = await Promise.all([
            Product.find(filters).sort(sortObj).skip(skip).limit(effectiveLimit),
            Product.countDocuments(filters)
        ]);

        const cappedTotal = Math.min(total, topLimit);
        return { items, total: cappedTotal, page, limit, hasMore: page * limit < cappedTotal };
    } catch (error) {
        console.error(error);
        return { items: [], total: 0, page: 1, limit: 10, hasMore: false };
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
    getCategoriesService,
    getTopProductsService,
    getNewest,
    getBestsellers,
    getPromotions,
    getSimilarProducts,
    updateStock
};
