import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { articles, findArticleBySlug } from '../data/articles';

const ArticleDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const article = findArticleBySlug(slug);
    const related = articles.filter((item) => item.slug !== slug).slice(0, 3);

    if (!article) {
        return (
            <main className="shop-page empty-state">
                <h2>Không tìm thấy bài viết</h2>
                <Button type="primary" onClick={() => navigate('/tin-tuc')}>Về trang tin tức</Button>
            </main>
        );
    }

    return (
        <main className="shop-page article-detail-page">
            <Link className="article-back" to="/tin-tuc"><ArrowLeftOutlined /> Tất cả bài viết</Link>

            <article className="article-detail">
                <header>
                    <span>{article.category} - {article.date}</span>
                    <h1>{article.title}</h1>
                    <p>{article.summary}</p>
                </header>

                <img className="article-cover" src={article.cover} alt={article.title} />

                <div className="article-content">
                    {article.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <section className="related-articles">
                <h2>Bài viết liên quan</h2>
                <div className="news-grid">
                    {related.map((item) => (
                        <Link key={item.slug} className="news-card" to={`/tin-tuc/${item.slug}`}>
                            <img src={item.cover} alt={item.title} />
                            <div>
                                <span>{item.category}</span>
                                <h3>{item.title}</h3>
                                <p>{item.summary}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default ArticleDetailPage;
