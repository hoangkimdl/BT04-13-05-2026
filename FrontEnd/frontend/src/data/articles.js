export const articles = [
    {
        slug: 'chon-giay-cau-long-theo-loi-choi',
        title: 'Cách chọn giày cầu lông theo lối chơi',
        category: 'Tư vấn',
        date: '18/05/2026',
        cover: '/Yonex/anh1.jpg',
        summary: 'Người chơi thiên về tốc độ, phòng thủ hay tấn công sẽ cần độ bám, độ ổn định và đệm khác nhau.',
        content: [
            'Giày cầu lông tốt cần giữ chân ổn định khi đổi hướng liên tục. Nếu bạn thường xuyên lên lưới và di chuyển ngắn, hãy ưu tiên mẫu nhẹ, cổ giày chắc và đế bám sân tốt.',
            'Với người chơi thiên về bật nhảy, phần đệm gót và độ vững của thân giày quan trọng hơn. Đệm êm giúp giảm áp lực lên gối, còn thân giày chắc giúp hạn chế lật cổ chân.',
            'Khi thử giày, nên mang tất thể thao và chừa khoảng trống nhỏ ở mũi chân. Giày quá rộng làm trượt chân bên trong, còn giày quá chật dễ gây đau khi thi đấu lâu.'
        ]
    },
    {
        slug: 'bao-quan-giay-the-thao-lau-ben',
        title: 'Bảo quản giày thể thao để dùng lâu bền',
        category: 'Hướng dẫn',
        date: '17/05/2026',
        cover: '/Kawasaki/anh2.jpg',
        summary: 'Một vài thói quen nhỏ sau mỗi buổi chơi có thể kéo dài tuổi thọ giày và giữ form tốt hơn.',
        content: [
            'Sau khi chơi, hãy tháo lót giày và để giày ở nơi thoáng khí. Không nên phơi trực tiếp dưới nắng gắt vì nhiệt cao có thể làm keo và vật liệu thân giày nhanh xuống cấp.',
            'Nếu giày bị bẩn, dùng khăn ẩm hoặc bàn chải mềm để vệ sinh. Tránh ngâm cả đôi giày trong nước quá lâu, đặc biệt với các mẫu có nhiều lớp keo ép.',
            'Nên dùng riêng giày cầu lông cho sân trong nhà. Việc mang giày ra đường thường xuyên sẽ làm mòn đế nhanh và giảm độ bám khi quay lại sân.'
        ]
    },
    {
        slug: 'dau-hieu-nen-thay-giay-cau-long',
        title: 'Dấu hiệu nên thay giày cầu lông mới',
        category: 'Kinh nghiệm',
        date: '16/05/2026',
        cover: '/Victor/anh3.jpg',
        summary: 'Đế mòn, đệm xẹp và thân giày lỏng là những dấu hiệu ảnh hưởng trực tiếp đến an toàn khi chơi.',
        content: [
            'Khi đế ngoài bị mòn nhiều ở mép trong hoặc mép ngoài, giày sẽ mất độ bám và làm bước di chuyển thiếu chắc chắn. Đây là dấu hiệu rõ nhất cho thấy bạn nên thay giày.',
            'Đệm giày sau một thời gian sử dụng có thể bị xẹp. Nếu cảm giác tiếp đất cứng hơn bình thường hoặc đau gót sau buổi chơi, hãy kiểm tra lại khả năng hấp thụ lực.',
            'Thân giày bị bai, lỏng hoặc rách làm chân không còn được cố định tốt. Với cầu lông, chỉ một pha đổi hướng sai cũng có thể gây chấn thương cổ chân.'
        ]
    },
    {
        slug: 'so-sanh-giay-kawasaki-yonex-lining-victor',
        title: 'So sánh nhanh Kawasaki, Yonex, Lining và Victor',
        category: 'So sánh',
        date: '15/05/2026',
        cover: '/Lining/anh4.jpg',
        summary: 'Mỗi thương hiệu có thế mạnh riêng về độ êm, độ bám, trọng lượng và cảm giác ôm chân.',
        content: [
            'Kawasaki thường có mức giá dễ tiếp cận, phù hợp người mới chơi hoặc người cần một đôi giày bền cho tập luyện thường xuyên.',
            'Yonex nổi bật ở cảm giác đệm và sự ổn định, phù hợp người chơi muốn đầu tư lâu dài cho cả tập luyện lẫn thi đấu.',
            'Lining thường cân bằng giữa trọng lượng nhẹ và độ linh hoạt, còn Victor được nhiều người chọn khi cần cảm giác chắc chân và đổi hướng ổn định.'
        ]
    }
];

export const findArticleBySlug = (slug) => articles.find((article) => article.slug === slug);
