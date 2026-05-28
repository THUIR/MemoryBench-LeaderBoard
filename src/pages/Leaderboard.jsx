import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eloData, memorySystems, baseModels, cases } from '../data/eloData';
import { summaryAverages } from '../data/summaryAverages';
import './Leaderboard.css';

function ELOBar({ elo, maxElo = 1100, minElo = 900 }) {
  // Ensure minimum width of 8% so even lowest ELO shows a bar
  const rawPercentage = ((elo - minElo) / (maxElo - minElo)) * 100;
  const percentage = Math.max(8, Math.min(100, rawPercentage));
  return (
    <div className="elo-bar-container">
      <div className="elo-bar" style={{ width: `${percentage}%` }} />
      <span className="elo-value">{elo.toFixed(1)}</span>
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

function DropdownFilter({ label, options, value, onChange, onClear, showAllOption = true, showClearOption = true }) {
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
          <span>{value || `All`}</span>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {showAllOption && (
              <button
                className="dropdown-item"
                onClick={() => { onChange(''); setIsOpen(false); }}
              >
                All {label}s
              </button>
            )}
            {options.map(opt => (
              <button
                key={opt.id || opt}
                className={`dropdown-item ${value === (opt.id || opt) ? 'selected' : ''}`}
                onClick={() => { onChange(opt.id || opt); setIsOpen(false); }}
              >
                {opt.name || opt}
              </button>
            ))}
            {value && showClearOption && (
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

function HeatmapCell({ value }) {
  const minVal = 0.3, maxVal = 0.8;
  const normalized = Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));

  let bgColor;
  if (normalized > 0.5) {
    const intensity = (normalized - 0.5) * 2;
    bgColor = `rgba(201, 169, 98, ${0.2 + intensity * 0.6})`;
  } else {
    const intensity = (0.5 - normalized) * 2;
    bgColor = `rgba(212, 184, 150, ${0.1 + intensity * 0.3})`;
  }

  return (
    <div className="heatmap-cell" style={{ backgroundColor: bgColor }}>
      <span className="heatmap-value">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

function HeatmapSection({ model }) {
  const caseList = ['domain/Academic&Knowledge', 'domain/Legal', 'domain/Open-Domain', 'task/Long-Long', 'task/Long-Short', 'task/Short-Long', 'task/Short-Short'];
  const caseNames = ['Academic & Knowledge', 'Legal', 'Open-Domain', 'Long-Long', 'Long-Short', 'Short-Long', 'Short-Short'];

  return (
    <div className="model-heatmap-section">
      <h3 className="model-heatmap-title">{model.name}</h3>
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {/* Header row with memory system names */}
          <div className="heatmap-grid-corner"></div>
          {memorySystems.map(mem => (
            <div key={mem.id} className="heatmap-grid-header">{mem.name}</div>
          ))}
          {/* Data rows */}
          {caseList.map((caseId, idx) => {
            const caseInfo = summaryAverages.cases[caseId];
            return (
              <>
                <div key={`row-${caseId}`} className="heatmap-grid-row-header">{caseNames[idx]}</div>
                {memorySystems.map(mem => {
                  const key = `${mem.id}-${model.id}`;
                  const value = caseInfo?.[key];
                  return (
                    <div key={mem.id} className="heatmap-grid-cell">
                      {value !== undefined ? <HeatmapCell value={value} /> : <div className="heatmap-cell empty">-</div>}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Lower Score</span>
        <div className="legend-gradient" style={{ background: 'linear-gradient(90deg, #f5efe8 0%, #d4b896 50%, #c9a962 100%)' }} />
        <span className="legend-label">Higher Score</span>
      </div>
    </div>
  );
}

function LineChart({ data, title }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgWidth = 900;
  const svgHeight = 320;
  const padding = { top: 25, right: 40, bottom: 55, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const allValues = data.flatMap(series => series.values);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valRange = maxVal - minVal || 1;

  const xStep = chartWidth / (data[0]?.values.length - 1 || 1);

  const xScale = (i) => padding.left + i * xStep;
  const yScale = (v) => padding.top + chartHeight - ((v - minVal) / valRange) * chartHeight;

  const caseNames = ['Academic&Knowledge', 'Legal', 'Open-Domain', 'Long-Long', 'Long-Short', 'Short-Long', 'Short-Short'];
  const lineColors = [
    '#c9a962', '#d4b896', '#b8860b', '#8b7355',
    '#5c4a3a', '#a89b8a', '#6b5d4d', '#9c8b7a'
  ];

  return (
    <div className="line-chart-wrapper">
      <h3 className="line-chart-title">{title}</h3>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = padding.top + chartHeight * (1 - ratio);
          const val = minVal + valRange * ratio;
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="var(--border-subtle)" strokeDasharray="4,4" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="chart-axis-label" fill="var(--text-muted)">{(val * 100).toFixed(0)}%</text>
            </g>
          );
        })}

        {caseNames.map((name, i) => (
          <text key={name} x={xScale(i)} y={svgHeight - padding.bottom + 20} textAnchor="middle" className="chart-axis-label" fill="var(--text-secondary)">
            {name.length > 10 ? name.substring(0, 8) + '..' : name}
          </text>
        ))}

        {data.map((series, seriesIndex) => (
          <g key={series.name}>
            <polyline
              points={series.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ')}
              fill="none"
              stroke={lineColors[seriesIndex % lineColors.length]}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {series.values.map((v, i) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(v)}
                r="5"
                fill={lineColors[seriesIndex % lineColors.length]}
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint({ series: series.name, case: caseNames[i], value: v, x: xScale(i), y: yScale(v) })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </g>
        ))}

        {hoveredPoint && (
          <g>
            <rect x={Math.min(hoveredPoint.x - 70, svgWidth - padding.right - 140)} y={hoveredPoint.y - 55} width="140" height="50" fill="var(--bg-card)" stroke="var(--border-accent)" rx="6" />
            <text x={Math.min(hoveredPoint.x - 70, svgWidth - padding.right - 140) + 70} y={hoveredPoint.y - 35} textAnchor="middle" className="chart-tooltip-title" fill="var(--text-primary)">{hoveredPoint.series}</text>
            <text x={Math.min(hoveredPoint.x - 70, svgWidth - padding.right - 140) + 70} y={hoveredPoint.y - 18} textAnchor="middle" className="chart-tooltip-value" fill="var(--accent-caramel)">{(hoveredPoint.value * 100).toFixed(1)}%</text>
            <text x={Math.min(hoveredPoint.x - 70, svgWidth - padding.right - 140) + 70} y={hoveredPoint.y - 4} textAnchor="middle" className="chart-tooltip-case" fill="var(--text-muted)">{hoveredPoint.case}</text>
          </g>
        )}
      </svg>
      <div className="chart-legend">
        {data.map((series, i) => (
          <div key={series.name} className="legend-item">
            <span className="legend-color" style={{ background: lineColors[i % lineColors.length] }} />
            <span className="legend-name">{series.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBaseModel, setSelectedBaseModel] = useState(searchParams.get('model') || '');
  const [selectedMemorySystem, setSelectedMemorySystem] = useState(searchParams.get('memory') || '');
  const [selectedBenchmarkTable, setSelectedBenchmarkTable] = useState(searchParams.get('benchmark') || 'domain/Academic&Knowledge');
  const [selectedBenchmarkModel, setSelectedBenchmarkModel] = useState('');
  const [selectedBenchmarkMemory, setSelectedBenchmarkMemory] = useState('');
  const [highlightedSection, setHighlightedSection] = useState('');

  // Sync state changes to URL
  useEffect(() => {
    const params = {};
    if (selectedBaseModel) params.model = selectedBaseModel;
    if (selectedMemorySystem) params.memory = selectedMemorySystem;
    if (selectedBenchmarkTable) params.benchmark = selectedBenchmarkTable;
    if (highlightedSection) params.section = highlightedSection;
    setSearchParams(params);
  }, [selectedBaseModel, selectedMemorySystem, selectedBenchmarkTable, highlightedSection, setSearchParams]);

  // Initialize from URL and scroll to section
  useEffect(() => {
    const modelParam = searchParams.get('model');
    const memoryParam = searchParams.get('memory');
    const benchmarkParam = searchParams.get('benchmark');
    const sectionParam = searchParams.get('section');
    if (modelParam) setSelectedBaseModel(modelParam);
    if (memoryParam) setSelectedMemorySystem(memoryParam);
    if (benchmarkParam) {
      setSelectedBenchmarkTable(benchmarkParam);
      setSelectedBenchmarkModel('');
      setSelectedBenchmarkMemory('');
    }
    if (sectionParam) {
      setHighlightedSection(sectionParam);
      setTimeout(() => {
        const element = document.getElementById(sectionParam);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => setHighlightedSection(''), 2000);
      }, 100);
    }
  }, []);

  const filteredData = useMemo(() => {
    let data = Object.entries(eloData.overall_elo).map(([key, value]) => ({
      systemKey: key,
      elo: value.avg,
      participated: value.participated_cases
    }));

    // Only show systems that participated in all 7 cases
    data = data.filter(d => d.participated === 7);

    if (selectedBaseModel) {
      data = data.filter(d => d.systemKey.endsWith(`-${selectedBaseModel}`));
    }
    if (selectedMemorySystem) {
      data = data.filter(d => d.systemKey.startsWith(selectedMemorySystem));
    }

    return data.sort((a, b) => b.elo - a.elo);
  }, [selectedBaseModel, selectedMemorySystem]);

  // Benchmark-specific table data
  const benchmarkTableData = useMemo(() => {
    if (selectedBenchmarkTable) {
      const caseElo = eloData.cases[selectedBenchmarkTable]?.elo || {};
      let data = Object.entries(caseElo)
        .map(([key, elo]) => ({
          systemKey: key,
          memory: key.replace('-8B', '').replace('-32B', ''),
          model: key.includes('-32B') ? 'Qwen3-32B' : 'Qwen3-8B',
          elo
        }));

      if (selectedBenchmarkModel) {
        data = data.filter(d => d.systemKey.endsWith(`-${selectedBenchmarkModel}`));
      }
      if (selectedBenchmarkMemory) {
        data = data.filter(d => d.systemKey.startsWith(selectedBenchmarkMemory));
      }

      return data.sort((a, b) => b.elo - a.elo);
    }
    return [];
  }, [selectedBenchmarkTable, selectedBenchmarkModel, selectedBenchmarkMemory]);

  // Calculate ELO min/max based on filtered data for proper bar scaling
  const eloRange = useMemo(() => {
    const allElos = filteredData.map(d => d.elo);
    return {
      min: Math.min(...allElos),
      max: Math.max(...allElos)
    };
  }, [filteredData]);

  // Calculate range for benchmark table data
  const benchmarkEloRange = useMemo(() => {
    const allElos = benchmarkTableData.map(d => d.elo);
    if (allElos.length === 0) return { min: 800, max: 1200 };
    return {
      min: Math.min(...allElos),
      max: Math.max(...allElos)
    };
  }, [benchmarkTableData]);

  const getMemorySystemName = (id) => memorySystems.find(m => m.id === id)?.name || id;
  const getBaseModelName = (key) => key.includes('-32B') ? 'Qwen3-32B' : 'Qwen3-8B';

  const selectedBenchmarkInfo = cases.find(c => c.id === selectedBenchmarkTable);

  const clearFilters = () => {
    setSelectedBaseModel('');
    setSelectedMemorySystem('');
  };

  const clearBenchmarkFilters = () => {
    setSelectedBenchmarkModel('');
    setSelectedBenchmarkMemory('');
  };

  return (
    <div className="leaderboard">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Compare ELO ratings across 2 base models and 8 memory systems · Filter by model, memory system, or view all</p>
        </div>

        {/* Main Leaderboard Section */}
        <section className={`ranking-section${highlightedSection === 'overall-rankings' ? ' highlighted-section' : ''}`} id="overall-rankings">
          <div className="leaderboard-header">
            <div className="leaderboard-header-row">
              <h2 className="leaderboard-title">Overall Rankings</h2>
              <Link to="/#tags-section" className="section-back-btn">← Back to Tags</Link>
            </div>
            <p className="leaderboard-subtitle">Comprehensive ELO ratings across all benchmark cases, filtered by model and memory system</p>
          </div>
          <div className="filter-row">
            <DropdownFilter
              label="Base Model"
              options={baseModels}
              value={selectedBaseModel}
              onChange={setSelectedBaseModel}
              onClear={() => setSelectedBaseModel('')}
            />
            <DropdownFilter
              label="Memory System"
              options={memorySystems}
              value={selectedMemorySystem}
              onChange={setSelectedMemorySystem}
              onClear={() => setSelectedMemorySystem('')}
            />
            <button className="clear-all-btn" onClick={clearFilters}>✕ Clear Filters</button>
          </div>
          <div className="table-container fixed-height">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="model-col">Model</th>
                  <th className="memory-col">Memory</th>
                  <th className="elo-col">ELO Rating</th>
                  <th className="participated-col">Cases</th>
                  <th className="detail-col">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.systemKey} className={index < 3 ? 'top-ranked' : ''}>
                    <td className="rank-col"><span className={`rank-badge rank-${index + 1}`}>{index + 1}</span></td>
                    <td className="model-col"><span className="model-name">{getBaseModelName(row.systemKey)}</span></td>
                    <td className="memory-col"><span className="memory-name">{getMemorySystemName(row.systemKey.replace('-8B', '').replace('-32B', ''))}</span></td>
                    <td className="elo-col">
                      <div className="elo-display">
                        <StarRating elo={row.elo} />
                        <ELOBar elo={row.elo} minElo={eloRange.min} maxElo={eloRange.max} />
                      </div>
                    </td>
                    <td className="participated-col"><span className="cases-badge">{row.participated}/7</span></td>
                    <td className="detail-col"><Link to={`/detail/${row.systemKey}`} className="view-detail-btn">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Benchmark Tables Section */}
        <section className={`benchmark-tables-section${highlightedSection === 'benchmark-rankings' ? ' highlighted-section' : ''}`} id="benchmark-rankings">
          <div className="leaderboard-header">
            <div className="leaderboard-header-row">
              <h2 className="leaderboard-title">Benchmark Rankings</h2>
              <Link to="/#tags-section" className="section-back-btn">← Back to Tags</Link>
            </div>
            <p className="leaderboard-subtitle">Detailed performance breakdown by benchmark case, model and memory system</p>
          </div>
          {selectedBenchmarkTable && (
            <div className="filter-row">
              <DropdownFilter
                label="Base Model"
                options={baseModels}
                value={selectedBenchmarkModel}
                onChange={setSelectedBenchmarkModel}
                onClear={() => setSelectedBenchmarkModel('')}
              />
              <DropdownFilter
                label="Memory System"
                options={memorySystems}
                value={selectedBenchmarkMemory}
                onChange={setSelectedBenchmarkMemory}
                onClear={() => setSelectedBenchmarkMemory('')}
              />
              <DropdownFilter
                label="Benchmark"
                options={cases}
                value={selectedBenchmarkTable}
                onChange={setSelectedBenchmarkTable}
                onClear={() => setSelectedBenchmarkTable('')}
                showAllOption={false}
                showClearOption={false}
              />
              <button className="clear-all-btn" onClick={clearBenchmarkFilters}>✕ Clear Filters</button>
            </div>
          )}

          {selectedBenchmarkTable && benchmarkTableData.length > 0 && (
            <div className="table-container fixed-height benchmark-table">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="model-col">Model</th>
                    <th className="memory-col">Memory</th>
                    <th className="elo-col">ELO Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkTableData.map((row, index) => (
                    <tr key={row.systemKey} className={index < 3 ? 'top-ranked' : ''}>
                      <td className="rank-col"><span className={`rank-badge rank-${index + 1}`}>{index + 1}</span></td>
                      <td className="model-col"><span className="model-name">{row.model}</span></td>
                      <td className="memory-col"><span className="memory-name">{getMemorySystemName(row.memory)}</span></td>
                      <td className="elo-col">
                        <div className="elo-display">
                          <StarRating elo={row.elo} />
                          <ELOBar elo={row.elo} minElo={benchmarkEloRange.min} maxElo={benchmarkEloRange.max} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Heatmaps Section */}
        <section className={`benchmark-section${highlightedSection === 'benchmark-heatmaps' ? ' highlighted-section' : ''}`} id="benchmark-heatmaps">
          <div className="leaderboard-header">
            <div className="leaderboard-header-row">
              <h2 className="leaderboard-title">Benchmark Performance Heatmaps</h2>
              <Link to="/#tags-section" className="section-back-btn">← Back to Tags</Link>
            </div>
            <p className="leaderboard-subtitle">Visual comparison of memory system performance across different benchmark cases</p>
          </div>
          <div className="heatmaps-container">
            {baseModels
              .filter(model => !selectedBaseModel || model.id === selectedBaseModel)
              .map(model => (
                <HeatmapSection key={model.id} model={model} />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}