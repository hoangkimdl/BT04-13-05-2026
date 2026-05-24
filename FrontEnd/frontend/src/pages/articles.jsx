import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

const ArticlesPage = () => (
    <main className="shop-page articles-page">
        <section className="article-hero">
            <span>Speedstride Sports</span>
            <h1>Tin và bài viết</h1>
            <p>Kinh nghiệm chọn giày, bảo quản sản phẩm và các gợi ý dành cho người chơi cầu lông.</p>
        </section>

        <section className="article-list">
            {articles.map((article) => (
                <Link key={article.slug} className="article-row" to={`/tin-tuc/${article.slug}`}>
                    <img src={article.cover} alt={article.title} />
                    <div>
                        <span>{article.category} - {article.date}</span>
                        <h2>{article.title}</h2>
                        <p>{article.summary}</p>
                    </div>
                    <ArrowRightOutlined />
                </Link>
            ))}
        </section>
    </main>
);

export default ArticlesPage;
