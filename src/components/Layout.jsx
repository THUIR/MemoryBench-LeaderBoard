import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <svg className="logo-icon" viewBox="160 160 680 680" xmlns="http://www.w3.org/2000/svg">
                <path d="M193.08 320.65c0-70.45 53.54-127.57 119.59-127.57h398.65c66.05 0 119.59 57.11 119.59 127.57v382.7c0 70.45-53.54 127.57-119.59 127.57H312.68c-66.05 0-119.59-57.11-119.59-127.57v-382.7z" fill="#c9a962"/>
                <path d="M610.95 439.15c7.53 5.76 13.83 10.56 20.64 15.78-7.47 9.82-13.96 17.4-19.4 25.73-25.62 39.07-31.52 81.53-22.74 127.64 5.05 26.34 8.98 53.63 8.39 80.31-1.11 53.23-44.3 91.01-89.58 80.85-21.89-4.88-37.48-18.62-43.12-41.51-4.98-20.18 0.26-38.26 15.66-52 3.74-3.32 10.16-3.45 15.33-5.01-1.05 5.21-0.85 11.38-3.47 15.58-11.99 19.3-8.19 41.98 9.7 53.02 17.76 10.97 39.78 3.79 49.8-16.25 12.32-24.65 7.86-59.52-12.78-81.8-16.19-17.47-34.14-33.18-51.9-48.96-56.68-50.18-61.8-132.79-9.83-183.1 10.42-10.09 24.44-16.59 37.42-23.5 19.53-10.5 30.28-21.67 37.35-43.13-5.7 4.2-9.63 7.31-13.76 10.09-16.91 11.38-41.55 12.66-54.85-2.1-19.79-21.87-41.74-16.73-64.81-11.99-4.78 1.02-9.7 4.27-14.15 3.52-4.39-0.68-8.32-5.08-12.45-7.79 3.08-4.47 5.57-9.82 9.57-13.07 2.42-1.96 7.4-0.68 11.21-0.88 44.69-2.23 81.19-21.19 107.6-58.57 7.6-10.77 14.22-10.7 24.57-6.5 67.63 26.95 99.35 105.97 69.66 174.37-1.37 3.04-2.68 6.09-4.06 9.27z" fill="#FFFFFF"/>
              </svg>
              <span className="logo-text">MemoryBench</span>
            </Link>
          </div>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link
              to="/leaderboard"
              className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              to="/cases"
              className={`nav-link ${location.pathname === '/cases' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Case Details
            </Link>
            <Link
              to="/resources"
              className={`nav-link ${location.pathname === '/resources' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </Link>
            <Link
              to="/contributors"
              className={`nav-link ${location.pathname === '/contributors' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contributors
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