import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <span className="logo-text">Memory Bench</span>
              <span className="logo-suffix">Leaderboard</span>
            </Link>
          </div>
          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
            <Link
              to="/cases"
              className={`nav-link ${location.pathname === '/cases' ? 'active' : ''}`}
            >
              Case Details
            </Link>
          </nav>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <div className="footer-content">
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-value">2</span>
              <span className="footer-stat-label">MODELS</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-value">8</span>
              <span className="footer-stat-label">MEMORYS</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-value">3</span>
              <span className="footer-stat-label">DOMAINS</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-value">4</span>
              <span className="footer-stat-label">TASKS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}