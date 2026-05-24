import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const AuthShell = ({ logoSrc, logoAlt, title, subtitle, backTo = '/', backLabel, footer, children }) => {
    return (
        <main className="auth-page">
            <section className="auth-shell" aria-label={title}>
                <div className="auth-visual">
                    <img src={logoSrc} alt={logoAlt} />
                </div>

                <div className="auth-panel">
                    <div className="auth-brand">
                        <img src={logoSrc} alt="" aria-hidden="true" />
                        <strong>Speedstride</strong>
                        <span>Sports</span>
                    </div>

                    <div className="auth-card">
                        <div className="auth-heading">
                            <h1>{title}</h1>
                            {subtitle ? <p>{subtitle}</p> : null}
                        </div>

                        {children}

                        {backLabel ? (
                            <Link className="auth-back-link" to={backTo}>
                                <ArrowLeftOutlined /> {backLabel}
                            </Link>
                        ) : null}
                    </div>

                    {footer ? <div className="auth-footer">{footer}</div> : null}
                </div>
            </section>
        </main>
    );
};

export default AuthShell;
