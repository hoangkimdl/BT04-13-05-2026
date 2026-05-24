const Product = require("../models/product");

const brands = ["Kawasaki", "Yonex", "Lining", "Victor"];

const brandImages = {
    Kawasaki: ["/Kawasaki/anh1.jpg", "/Kawasaki/anh2.jpg", "/Kawasaki/anh3.jpg", "/Kawasaki/anh4.jpg", "/Kawasaki/anh5.jpg"],
    Yonex: ["/Yonex/anh1.jpg", "/Yonex/anh2.jpg", "/Yonex/anh3.jpg", "/Yonex/anh4.jpg", "/Yonex/anh5.jpg", "/Yonex/anh6.jpg", "/Yonex/anh7.jpg"],
    Lining: ["/Lining/anh1.jpg", "/Lining/anh2.jpg", "/Lining/anh3.jpg", "/Lining/anh4.jpg", "/Lining/anh5.jpg"],
    Victor: ["/Victor/anh1.jpg", "/Victor/anh2.jpg", "/Victor/anh3.jpg", "/Victor/anh4.jpg", "/Victor/anh5.jpg"]
};

const brandMeta = {
    Kawasaki: {
        title: "Giày cầu lông Kawasaki",
        price: 1450000,
        accent: "Bền bỉ - chắc chân - nhẹ nhàng",
        description: "Form giày ôm chân, đệm êm và đế bám sân tốt cho người chơi cầu lông."
    },
    Yonex: {
        title: "Giày cầu lông Yonex",
        price: 1680000,
        accent: "Power Cushion - êm chân - bám sân",
        description: "Thiết kế hỗ trợ hấp thụ lực, phù hợp tập luyện và thi đấu cường độ cao."
    },
    Lining: {
        title: "Giày cầu lông Lining",
        price: 1320000,
        accent: "Nhẹ thoáng - linh hoạt - ổn định",
        description: "Thân giày thoáng khí, trọng lượng nhẹ và hỗ trợ di chuyển linh hoạt."
    },
    Victor: {
        title: "Giày cầu lông Victor",
        price: 1890000,
        accent: "Chắc chân - đổi hướng tốt - chính hãng",
        description: "Đế giày ổn định, độ bám cao, dành cho người chơi cần kiểm soát chắc chắn."
    }
};

const sizesByBrand = {
    Kawasaki: [36, 37, 38, 39, 40],
    Yonex: [37, 38, 39, 40, 41, 42],
    Lining: [36, 37, 38, 39, 40, 41],
    Victor: [38, 39, 40, 41, 42, 43]
};

const unavailableByBrand = {
    Kawasaki: [36, 40],
    Yonex: [37, 42],
    Lining: [36],
    Victor: [43]
};

const discounts = [28, 24, 20, 18, 15, 22, 12];

const getOriginalPrice = (salePrice, discountPercent) =>
    Math.ceil((salePrice / (1 - discountPercent / 100)) / 10000) * 10000;

const createSlug = (brand, index) => `${brand.toLowerCase()}-anh-${String(index + 1).padStart(2, "0")}`;

const seedProducts = brands.flatMap((brand) => {
    const meta = brandMeta[brand];

    return brandImages[brand].map((image, index) => {
        const number = String(index + 1).padStart(2, "0");
        const images = [image, ...brandImages[brand].filter((item) => item !== image)];
        const discountPercent = discounts[index % discounts.length];
        const price = meta.price + index * 70000;

        return {
            slug: createSlug(brand, index),
            name: `${meta.title} mẫu ${number} ${meta.accent}`,
            brand,
            category: "Giày cầu lông",
            price,
            originalPrice: getOriginalPrice(price, discountPercent),
            discountPercent,
            discount: discountPercent,
            stock: 8 + index,
            sold: 80 - index * 4,
            views: 420 - index * 17 + brand.length * 9,
            isNew: index < 2,
            isOnSale: true,
            sizes: sizesByBrand[brand],
            unavailableSizes: unavailableByBrand[brand],
            images,
            thumbnail: image,
            description: meta.description,
            createdAt: new Date(Date.now() - index * 86400000)
        };
    });
});

const seedProductsIfEmpty = async () => {
    const count = await Product.countDocuments();
    if (count > 0) {
        const updates = seedProducts.map((product) => ({
            updateOne: {
                filter: { slug: product.slug },
                update: {
                    $set: product
                },
                upsert: true
            }
        }));

        await Product.bulkWrite(updates);
        console.log(`Products collection already has ${count} documents`);
        return;
    }

    await Product.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} products`);
};

module.exports = {
    seedProducts,
    seedProductsIfEmpty
};
