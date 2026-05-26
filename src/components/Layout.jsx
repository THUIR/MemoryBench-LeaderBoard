import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { eloData } from '../data/eloData';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  const avgElo = useMemo(() => {
    const vals = Object.values(eloData.overall_elo_full_participation).map(v => v.avg);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, []);

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
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-value">16</span>
              <span className="header-stat-label">Systems</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-value">7</span>
              <span className="header-stat-label">Benchmarks</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-value">{avgElo}</span>
              <span className="header-stat-label">Avg ELO</span>
            </div>
          </div>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}