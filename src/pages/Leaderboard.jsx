import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eloData, memorySystems, baseModels, cases } from '../data/eloData';
import './Leaderboard.css';

function ELOBar({ elo, maxElo = 1300, minElo = 700 }) {
  const percentage = ((elo - minElo) / (maxElo - minElo)) * 100;
  return (
    <div className="elo-bar-container">
      <div className="elo-bar" style={{ width: `${percentage}%` }} />
      <span className="elo-value">{elo.toFixed(0)}</span>
    </div>
  );
}

function StarRating({ elo }) {
  const stars = elo >= 1100 ? 3 : elo >= 1000 ? 2 : 1;
  return (
    <div className="star-rating">
      {[1, 2, 3].map(i => (
        <span key={i} className={`star ${i <= stars ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

function HeatmapCell({ elo }) {
  const minElo = 700, maxElo = 1300;
  const normalized = (elo - minElo) / (maxElo - minElo);

  let bgColor;
  if (normalized > 0.5) {
    const intensity = Math.min((normalized - 0.5) * 2, 1);
    bgColor = `rgba(201, 169, 98, ${0.2 + intensity * 0.6})`;
  } else {
    const intensity = (0.5 - normalized) * 2;
    bgColor = `rgba(212, 184, 150, ${0.1 + intensity * 0.3})`;
  }

  return (
    <div className="heatmap-cell" style={{ backgroundColor: bgColor }}>
      <span className="heatmap-value">{elo.toFixed(0)}</span>
    </div>
  );
}

function DropdownFilter({ label, options, value, onChange, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="filter-group">
      <label>{label}</label>
      <div className="dropdown-filter" ref={dropdownRef}>
        <button
          className={`dropdown-trigger ${value ? 'has-value' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{value || `All ${label}s`}</span>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              All {label}s
            </button>
            {options.map(opt => (
              <button
                key={opt.id || opt}
                className={`dropdown-item ${value === (opt.id || opt) ? 'selected' : ''}`}
                onClick={() => { onChange(opt.id || opt); setIsOpen(false); }}
              >
                {opt.name || opt}
              </button>
            ))}
            {value && (
              <button
                className="dropdown-item clear-btn"
                onClick={() => { onClear(); setIsOpen(false); }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [selectedBaseModel, setSelectedBaseModel] = useState('');
  const [selectedMemorySystem, setSelectedMemorySystem] = useState('');
  const [selectedCase, setSelectedCase] = useState('overall');
  const [caseSearchTerm, setCaseSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let data = selectedCase === 'overall'
      ? Object.entries(eloData.overall_elo_full_participation).map(([key, value]) => ({
          systemKey: key,
          elo: value.avg,
          participated: value.participated_cases
        }))
      : Object.entries(eloData.cases[selectedCase]?.elo || {}).map(([key, value]) => ({
          systemKey: key,
          elo: value,
          participated: 7
        }));

    if (selectedBaseModel) {
      data = data.filter(d => d.systemKey.endsWith(`-${selectedBaseModel}`));
    }
    if (selectedMemorySystem) {
      data = data.filter(d => d.systemKey.startsWith(selectedMemorySystem));
    }

    return data.sort((a, b) => b.elo - a.elo);
  }, [selectedBaseModel, selectedMemorySystem, selectedCase]);

  // Case-specific table data
  const caseSpecificData = useMemo(() => {
    if (selectedCase === 'overall') return [];

    const caseElo = eloData.cases[selectedCase]?.elo || {};
    return Object.entries(caseElo)
      .map(([key, elo]) => ({
        systemKey: key,
        memory: key.replace('-8B', '').replace('-32B', ''),
        model: key.includes('-32B') ? 'Qwen3-32B' : 'Qwen3-8B',
        elo
      }))
      .filter(item => {
        if (selectedBaseModel && !item.model.includes(selectedBaseModel)) return false;
        if (selectedMemorySystem && item.memory !== selectedMemorySystem) return false;
        return true;
      })
      .sort((a, b) => b.elo - a.elo);
  }, [selectedCase, selectedBaseModel, selectedMemorySystem]);

  const getMemorySystemName = (id) => memorySystems.find(m => m.id === id)?.name || id;
  const getBaseModelName = (key) => key.includes('-32B') ? 'Qwen3-32B' : 'Qwen3-8B';

  const selectedCaseInfo = cases.find(c => c.id === selectedCase);

  const clearFilters = () => {
    setSelectedBaseModel('');
    setSelectedMemorySystem('');
  };

  return (
    <div className="leaderboard">
      <div className="page-wrapper">
        <section className="heatmap-section">
          <h2 className="section-title">ELO Heatmap — Overall Performance</h2>
          <div className="heatmap-container">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th className="heatmap-corner">Model / Memory</th>
                  {memorySystems.map(mem => (
                    <th key={mem.id} className="heatmap-col-header">{mem.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {baseModels.map(model => (
                  <tr key={model.id}>
                    <td className="heatmap-row-header">{model.name}</td>
                    {memorySystems.map(mem => {
                      const key = `${mem.id}-${model.id}`;
                      const elo = eloData.overall_elo_full_participation[key]?.avg;
                      return (
                        <td key={mem.id} className="heatmap-cell-wrapper">
                          {elo ? <HeatmapCell elo={elo} /> : <div className="heatmap-cell empty">-</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="heatmap-legend">
            <span className="legend-label">Lower ELO</span>
            <div className="legend-gradient" />
            <span className="legend-label">Higher ELO</span>
          </div>
        </section>

        <div className="table-header">
          <div className="filters">
            <div className="filter-row">
              <DropdownFilter
                label="Base Model"
                options={baseModels}
                value={selectedBaseModel}
                onChange={setSelectedBaseModel}
                onClear={() => setSelectedBaseModel('')}
              />
              <DropdownFilter
                label="Memory"
                options={memorySystems}
                value={selectedMemorySystem}
                onChange={setSelectedMemorySystem}
                onClear={() => setSelectedMemorySystem('')}
              />
              <button className="clear-all-btn" onClick={clearFilters}>
                ✕ Clear All Filters
              </button>
            </div>

            <div className="filter-group case-filter">
              <label>Benchmark</label>
              <div className="case-buttons">
                <button
                  className={`filter-btn ${selectedCase === 'overall' ? 'active' : ''}`}
                  onClick={() => setSelectedCase('overall')}
                >
                  Overall
                </button>
                {cases.map(c => (
                  <button
                    key={c.id}
                    className={`filter-btn ${selectedCase === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedCase(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="ranking-section">
          <h2 className="section-title">
            System Rankings
            {selectedCaseInfo && <span className="section-subtitle"> — {selectedCaseInfo.name}</span>}
          </h2>
          <div className="table-container fixed-height">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="system-col">System</th>
                  <th className="elo-col">ELO Rating</th>
                  <th className="participated-col">Cases</th>
                  <th className="detail-col">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.systemKey} className={index < 3 ? 'top-ranked' : ''}>
                    <td className="rank-col">
                      <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                    </td>
                    <td className="system-col">
                      <div className="system-info">
                        <span className="system-name">{getMemorySystemName(row.systemKey.replace('-8B', '').replace('-32B', ''))}</span>
                        <span className="system-model">{getBaseModelName(row.systemKey)}</span>
                      </div>
                    </td>
                    <td className="elo-col">
                      <div className="elo-display">
                        <StarRating elo={row.elo} />
                        <ELOBar elo={row.elo} />
                      </div>
                    </td>
                    <td className="participated-col">
                      <span className="cases-badge">{row.participated}/7</span>
                    </td>
                    <td className="detail-col">
                      <Link to={`/detail/${row.systemKey}`} className="view-detail-btn">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedCase !== 'overall' && caseSpecificData.length > 0 && (
          <section className="case-ranking-section">
            <h2 className="section-title">
              {selectedCaseInfo?.name || selectedCase} — Detailed Rankings
              <span className="section-subtitle"> (Filtered by {selectedBaseModel || 'All Models'}, {selectedMemorySystem || 'All Memory'})</span>
            </h2>
            <div className="case-filter-bar">
              <input
                type="text"
                placeholder="Search memory system..."
                value={caseSearchTerm}
                onChange={e => setCaseSearchTerm(e.target.value)}
                className="case-search-input"
              />
              <span className="case-count">{caseSpecificData.length} systems</span>
            </div>
            <div className="table-container">
              <table className="case-ranking-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="system-col">Memory System</th>
                    <th className="model-col">Model</th>
                    <th className="elo-col">ELO</th>
                  </tr>
                </thead>
                <tbody>
                  {caseSpecificData
                    .filter(item => !caseSearchTerm || item.memory.includes(caseSearchTerm))
                    .map((item, index) => (
                    <tr key={item.systemKey} className={index < 3 ? 'top-ranked' : ''}>
                      <td className="rank-col">
                        <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                      </td>
                      <td className="system-col">
                        <span className="memory-name">{getMemorySystemName(item.memory)}</span>
                      </td>
                      <td className="model-col">
                        <span className="model-badge">{item.model}</span>
                      </td>
                      <td className="elo-col">
                        <span className="elo-badge">{item.elo.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}