const productService = require('../services/productService');

const getHomepage = async (req, res) => {
    try {
        const promotions = await productService.getPromotions(8);
        const newest = await productService.getNewest(8);
        const bestsellers = await productService.getBestsellers(8);
        // nếu chưa có dữ liệu sản phẩm, chèn một vài item mẫu để phát triển nhanh
        if ((promotions.length + newest.length + bestsellers.length) === 0) {
            const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';
            const samples = [
                { name: 'Sản phẩm A', description: 'Mô tả A', price: 100000, images: [placeholder], category: 'Điện tử', stock: 10, sold: 2, isNew: true },
                { name: 'Sản phẩm B', description: 'Mô tả B', price: 200000, images: [placeholder], category: 'Thời trang', stock: 5, sold: 10, isOnSale: true, discount: 10 },
                { name: 'Sản phẩm C', description: 'Mô tả C', price: 150000, images: [placeholder], category: 'Gia dụng', stock: 20, sold: 1 }
            ];
            for (const s of samples) {
                await productService.createProductService(s);
            }
            // reload lists
            promotions.splice(0, promotions.length, ...(await productService.getPromotions(8)));
            newest.splice(0, newest.length, ...(await productService.getNewest(8)));
            bestsellers.splice(0, bestsellers.length, ...(await productService.getBestsellers(8)));
        }
        return res.render('index.ejs', { promotions, newest, bestsellers });
    } catch (error) {
        console.error(error);
        return res.render('index.ejs', { promotions: [], newest: [], bestsellers: [] });
    }
}

module.exports = {
    getHomepage,
}