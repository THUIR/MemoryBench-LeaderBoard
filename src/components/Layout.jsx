import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <span className="logo-text">MemoryBench</span>
            </Link>
          </div>
          <nav className="header-nav">
            <Link
              to="/leaderboard"
              className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
            <Link
              to="/cases"
              className={`nav-link ${location.pathname === '/cases' ? 'active' : ''}`}
            >
              Case Details
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <div className="footer-content">
          <div className="footer-tagline">
            <span className="footer-divider">|</span>
            MemoryBench: A Benchmark for Memory and Continual Learning in LLM Systems
            <span className="footer-divider">|</span>
          </div>
        </div>
      </footer>
    </div>
  );
}