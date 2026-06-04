import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eloData, cases, getMemorySystemId } from '../data/eloData';
import './Cases.css';

function CaseCard({ caseInfo, systems, type }) {
  const navigate = useNavigate();
  const isDomain = type === 'domain';

  const handleClick = () => {
    navigate(`/case/${encodeURIComponent(caseInfo.id)}`);
  };

  return (
    <div className={`case-card ${isDomain ? 'domain-type' : 'task-type'}`} onClick={handleClick}>
      <div className="case-card-header">
        <h3>{caseInfo.name}</h3>
        <span className={`case-type-badge ${isDomain ? 'domain' : 'task'}`}>
          {isDomain ? 'Domain' : 'Task'}
        </span>
      </div>
      <div className="case-card-stats">
        <div className="case-stat">
          <span className="case-stat-value">{caseInfo.samples}</span>
          <span className="case-stat-label">Cases</span>
        </div>
        <div className="case-stat">
          <span className="case-stat-value">{systems.length}</span>
          <span className="case-stat-label">Systems</span>
        </div>
      </div>
      <div className="case-card-systems">
        {systems.slice(0, 4).map(([key, elo]) => (
          <div key={key} className="mini-system">
            <span className="mini-system-name">{getMemorySystemId(key)}</span>
            <span className="mini-system-elo">{elo.toFixed(0)}</span>
          </div>
        ))}
        {systems.length > 4 && (
          <div className="mini-system more">+{systems.length - 4} more</div>
        )}
      </div>
      <div className="case-card-footer">
        <span className="case-id">{caseInfo.id}</span>
        <span className="view-more">Click to view samples →</span>
      </div>
    </div>
  );
}

export default function Cases() {
  const [selectedType, setSelectedType] = useState('all');

  const domainCases = cases.filter(c => c.type === 'domain');
  const taskCases = cases.filter(c => c.type === 'task');

  const filteredDomainCases = selectedType === 'all' || selectedType === 'domain' ? domainCases : [];
  const filteredTaskCases = selectedType === 'all' || selectedType === 'task' ? taskCases : [];

  const getSystemsForCase = (caseId) => {
    const caseData = eloData.cases[caseId];
    if (!caseData) return [];
    return Object.entries(caseData.elo).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="cases-page">
      <div className="page-wrapper">
        <div className="cases-header">
          <h1 className="cases-title">Case Details</h1>
          <p className="cases-subtitle">Click on a card to view detailed sample evaluations for that benchmark</p>
        </div>

        <div className="type-selector">
          <button
            className={`type-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All Cases
          </button>
          <button
            className={`type-btn ${selectedType === 'domain' ? 'active' : ''}`}
            onClick={() => setSelectedType('domain')}
          >
            Domains (3)
          </button>
          <button
            className={`type-btn ${selectedType === 'task' ? 'active' : ''}`}
            onClick={() => setSelectedType('task')}
          >
            Tasks (4)
          </button>
        </div>

        {filteredDomainCases.length > 0 && (
          <section className="cases-section">
            <h2 className="section-title">
              <span className="section-icon">🏛</span>
              Domain Benchmarks
            </h2>
            <div className="cases-grid">
              {filteredDomainCases.map(caseInfo => (
                <CaseCard
                  key={caseInfo.id}
                  caseInfo={caseInfo}
                  systems={getSystemsForCase(caseInfo.id)}
                  type="domain"
                />
              ))}
            </div>
          </section>
        )}

        {filteredTaskCases.length > 0 && (
          <section className="cases-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Task Benchmarks
            </h2>
            <div className="cases-grid">
              {filteredTaskCases.map(caseInfo => (
                <CaseCard
                  key={caseInfo.id}
                  caseInfo={caseInfo}
                  systems={getSystemsForCase(caseInfo.id)}
                  type="task"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}