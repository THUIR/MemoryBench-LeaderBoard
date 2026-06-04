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
              <svg className="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c9a962"/>
                    <stop offset="50%" stopColor="#d4b896"/>
                    <stop offset="100%" stopColor="#b8860b"/>
                  </linearGradient>
                  <linearGradient id="goldFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c9a962" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#b8860b" stopOpacity="0.25"/>
                  </linearGradient>
                </defs>
                {/* Seahorse body with gradient fill */}
                <path d="M24 6 C30 6 36 10 38 16 L42 14 C44 13 46 15 44 17 L38 20 C42 22 44 26 42 30 L38 34 C36 40 28 44 20 42 C14 40 10 36 12 30 L10 26 C8 20 12 14 18 12 L20 10 C18 8 20 6 24 6"
                      fill="url(#goldFill)" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Neural circuit lines */}
                <path d="M26 14 C28 16 30 18 32 18" stroke="#c9a962" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8"/>
                <path d="M24 18 C26 20 30 22 32 20" stroke="#d4b896" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
                <path d="M20 22 C22 24 26 26 28 24" stroke="#c9a962" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
                <path d="M18 28 C20 30 24 32 26 30" stroke="#b8860b" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
                <path d="M16 34 C18 36 22 38 24 36" stroke="#d4b896" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
                {/* Neural nodes */}
                <circle cx="26" cy="14" r="1.2" fill="#c9a962" opacity="0.9"/>
                <circle cx="32" cy="18" r="1.2" fill="#d4b896" opacity="0.8"/>
                <circle cx="28" cy="20" r="1" fill="#b8860b" opacity="0.8"/>
                <circle cx="24" cy="24" r="1.2" fill="#c9a962" opacity="0.7"/>
                <circle cx="20" cy="28" r="1" fill="#d4b896" opacity="0.8"/>
                <circle cx="18" cy="32" r="1.2" fill="#b8860b" opacity="0.7"/>
                <circle cx="22" cy="36" r="1" fill="#c9a962" opacity="0.6"/>
                <circle cx="34" cy="16" r="2" fill="url(#goldGrad)"/>
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