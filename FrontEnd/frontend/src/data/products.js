const money = (value) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);

export const brands = ['Kawasaki', 'Yonex', 'Lining', 'Victor'];

export const brandImages = {
    Kawasaki: ['/Kawasaki/anh1.jpg', '/Kawasaki/anh2.jpg', '/Kawasaki/anh3.jpg', '/Kawasaki/anh4.jpg', '/Kawasaki/anh5.jpg'],
    Yonex: ['/Yonex/anh1.jpg', '/Yonex/anh2.jpg', '/Yonex/anh3.jpg', '/Yonex/anh4.jpg', '/Yonex/anh5.jpg', '/Yonex/anh6.jpg', '/Yonex/anh7.jpg'],
    Lining: ['/Lining/anh1.jpg', '/Lining/anh2.jpg', '/Lining/anh3.jpg', '/Lining/anh4.jpg', '/Lining/anh5.jpg'],
    Victor: ['/Victor/anh1.jpg', '/Victor/anh2.jpg', '/Victor/anh3.jpg', '/Victor/anh4.jpg', '/Victor/anh5.jpg'],
};

const brandMeta = {
    Kawasaki: {
        title: 'Giày Cầu Lông Kawasaki',
        price: 1450000,
        accent: 'Bền bỉ - Chắc chân - Nhẹ nhàng',
        description: 'Form giày ôm chân, đệm êm và đế bám sân tốt cho người chơi cầu lông.',
    },
    Yonex: {
        title: 'Giày Cầu Lông Yonex',
        price: 1680000,
        accent: 'Power Cushion - Êm chân - Bám sân',
        description: 'Thiết kế hỗ trợ hấp thụ lực, phù hợp tập luyện và thi đấu cường độ cao.',
    },
    Lining: {
        title: 'Giày Cầu Lông Lining',
        price: 1320000,
        accent: 'Nhẹ thoáng - Linh hoạt - Ổn định',
        description: 'Thân giày thoáng khí, trọng lượng nhẹ và hỗ trợ di chuyển linh hoạt.',
    },
    Victor: {
        title: 'Giày Cầu Lông Victor',
        price: 1890000,
        accent: 'Chắc chân - Đổi hướng tốt - Chính hãng',
        description: 'Đế giày ổn định, độ bám cao, dành cho người chơi cần kiểm soát chắc chắn.',
    },
};

const sizesByBrand = {
    Kawasaki: [36, 37, 38, 39, 40],
    Yonex: [37, 38, 39, 40, 41, 42],
    Lining: [36, 37, 38, 39, 40, 41],
    Victor: [38, 39, 40, 41, 42, 43],
};

const unavailableByBrand = {
    Kawasaki: [36, 40],
    Yonex: [37, 42],
    Lining: [36],
    Victor: [43],
};

const discounts = [28, 24, 20, 18, 15, 22, 12];

const getOriginalPrice = (salePrice, discountPercent) =>
    Math.ceil((salePrice / (1 - discountPercent / 100)) / 10000) * 10000;

const createBrandProducts = (brand) =>
    brandImages[brand].map((image, index) => {
        const number = String(index + 1).padStart(2, '0');
        const meta = brandMeta[brand];
        const images = [image, ...brandImages[brand].filter((item) => item !== image)];
        const discountPercent = discounts[index % discounts.length];
        const salePrice = meta.price + index * 70000;

        return {
            id: `${brand.toLowerCase()}-anh-${number}`,
            _id: `${brand.toLowerCase()}-anh-${number}`,
            name: `${meta.title} mẫu ${number} ${meta.accent}`,
            brand,
            category: 'Giày cầu lông',
            price: salePrice,
            originalPrice: getOriginalPrice(salePrice, discountPercent),
            discountPercent,
            stock: 8 + index,
            sold: 80 - index * 4,
            isNew: index < 2,
            isOnSale: true,
            sizes: sizesByBrand[brand],
            unavailableSizes: unavailableByBrand[brand],
            images,
            thumbnail: image,
            description: meta.description,
        };
    });

export const fallbackProducts = brands.flatMap(createBrandProducts);

export const formatPrice = money;

export const getProductKey = (product) => product?._id || product?.id;

const legacyProductAliases = {
    'kawasaki-c32029': 'kawasaki-anh-01',
    'yonex-power-cushion': 'yonex-anh-01',
    'lining-speed-pro': 'lining-anh-01',
    'victor-a970ace': 'victor-anh-01',
};

export const findLocalProduct = (id) =>
    fallbackProducts.find((product) => getProductKey(product) === (legacyProductAliases[id] || id));

export const getProductsByBrand = (brand) =>
    fallbackProducts.filter((product) => product.brand.toLowerCase() === brand.toLowerCase());

export const getRelatedProducts = (product, limit = 8) => {
    if (!product?.brand) return fallbackProducts.slice(0, limit);

    const productKey = getProductKey(product);
    return getProductsByBrand(product.brand)
        .filter((item) => getProductKey(item) !== productKey)
        .slice(0, limit);
};

export const getSoldText = (sold = 0) => `Đã bán ${sold}`;

export const searchLocalProducts = ({ name = '', brand = '', sort = '' } = {}) => {
    const normalizedName = name.trim().toLowerCase();
    const normalizedBrand = brand.trim().toLowerCase();

    const filtered = fallbackProducts.filter((product) => {
        const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
        const matchesName = !normalizedName || haystack.includes(normalizedName);
        const matchesBrand = !normalizedBrand || product.brand.toLowerCase() === normalizedBrand;
        return matchesName && matchesBrand;
    });

    if (sort === 'price_asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'bestseller') return [...filtered].sort((a, b) => b.sold - a.sold);

    return filtered;
};
