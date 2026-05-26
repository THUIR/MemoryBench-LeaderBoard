import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { eloData, memorySystems, baseModels, cases, getMemorySystemId, getBaseModelId } from '../data/eloData';
import './Detail.css';

function MetricCard({ label, value, unit, trend }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </span>
      {trend !== undefined && (
        <span className={`metric-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {Math.abs(trend).toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function Detail() {
  const { systemKey } = useParams();
  const [selectedCase, setSelectedCase] = useState('all');

  const memorySystemId = getMemorySystemId(systemKey);
  const baseModelId = getBaseModelId(systemKey);

  const memorySystem = memorySystems.find(m => m.id === memorySystemId);
  const baseModel = baseModels.find(b => b.id === baseModelId);

  const overallElo = eloData.overall_elo[systemKey];

  const caseData = useMemo(() => {
    const results = [];
    Object.entries(eloData.cases).forEach(([caseId, caseInfo]) => {
      const elo = caseInfo.elo[systemKey];
      if (elo !== undefined) {
        results.push({
          caseId,
          caseName: cases.find(c => c.id === caseId)?.name || caseId,
          elo,
          samples: caseInfo.n_samples,
          rank: Object.entries(caseInfo.elo)
            .sort((a, b) => b[1] - a[1])
            .findIndex(([key]) => key === systemKey) + 1
        });
      }
    });
    return results.sort((a, b) => b.elo - a.elo);
  }, [systemKey]);

  const filteredCaseData = useMemo(() => {
    if (selectedCase === 'all') return caseData;
    return caseData.filter(c => c.caseId === selectedCase);
  }, [caseData, selectedCase]);

  return (
    <div className="detail-page">
      <div className="page-wrapper">
        <Link to="/" className="back-link">← Back to Leaderboard</Link>

        <div className="detail-header-section">
          <div className="system-header">
            <div className="system-icon">{memorySystem?.name?.charAt(0) || 'S'}</div>
            <div className="system-title">
              <h1>{memorySystem?.name || memorySystemId}</h1>
              <p className="system-subtitle">{memorySystem?.description}</p>
            </div>
          </div>
          <div className="base-model-badge">{baseModel?.name || baseModelId}</div>
        </div>

        <div className="metrics-overview">
          <MetricCard
            label="Overall ELO"
            value={overallElo?.avg?.toFixed(1) || 'N/A'}
            trend={overallElo ? overallElo.avg - 1000 : undefined}
          />
          <MetricCard
            label="Cases Participated"
            value={overallElo?.participated_cases || 0}
            unit="/ 7"
          />
          <MetricCard
            label="Best Case"
            value={caseData[0]?.caseName || 'N/A'}
          />
          <MetricCard
            label="Avg Rank"
            value={caseData.length > 0 ? (caseData.reduce((sum, c) => sum + c.rank, 0) / caseData.length).toFixed(1) : 'N/A'}
          />
        </div>

        <div className="case-selector">
          <button
            className={`case-btn ${selectedCase === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCase('all')}
          >
            All Cases
          </button>
          {cases.map(c => (
            <button
              key={c.id}
              className={`case-btn ${selectedCase === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCase(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="case-grid">
          {filteredCaseData.map(({ caseId, caseName, elo, samples, rank }) => (
            <div key={caseId} className="case-card">
              <div className="case-card-header">
                <h3>{caseName}</h3>
                <span className={`case-type ${caseId.startsWith('domain') ? 'domain' : 'task'}`}>
                  {caseId.startsWith('domain') ? 'Domain' : 'Task'}
                </span>
              </div>
              <div className="case-card-body">
                <div className="case-elo">
                  <span className="elo-number">{elo.toFixed(1)}</span>
                  <span className="elo-label">ELO</span>
                </div>
                <div className="case-stats">
                  <div className="case-stat">
                    <span className="case-stat-value">#{rank}</span>
                    <span className="case-stat-label">Rank</span>
                  </div>
                  <div className="case-stat">
                    <span className="case-stat-value">{samples}</span>
                    <span className="case-stat-label">Samples</span>
                  </div>
                </div>
              </div>
              <div className="case-card-footer">
                <span className="case-id">{caseId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}