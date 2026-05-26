import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { cases, memorySystems, getMemorySystemId, getBaseModelId, eloData } from '../data/eloData';
import './CaseSamples.css';

const checklistLabels = [
  "Relevance", "Accuracy", "Clarity", "Novelty",
  "Richness", "Human-like", "Overall"
];

const ITEMS_PER_PAGE = 10;

function getScoreDisplay(sample) {
  if (sample.metrics?.avg_score !== undefined) {
    return sample.metrics.avg_score;
  }
  if (sample.metrics?.f1 !== undefined) {
    return sample.metrics.f1;
  }
  if (sample.metrics?.reasoning_bert_score !== undefined) {
    return sample.metrics.reasoning_bert_score;
  }
  return null;
}

function getMetricsDisplay(sample) {
  const m = sample.metrics;
  if (!m) return null;

  if (m.checklist_evaluation && m.checklist_evaluation.length > 0) {
    return (
      <div className="checklist-grid">
        {m.checklist_evaluation.map((item, cidx) => (
          <div key={cidx} className="checklist-item">
            <span className="checklist-label">{checklistLabels[item.checklist_id] || `Check ${item.checklist_id}`}</span>
            <div className="checklist-bar-container">
              <div
                className="checklist-bar"
                style={{ width: `${(item.evaluation_score || 0) * 100}%` }}
              />
            </div>
            <span className="checklist-score">{(item.evaluation_score || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (m.reasoning_bert_score !== undefined) {
    return (
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Reasoning BERT</span>
          <span className="metric-value">{(m.reasoning_bert_score * 100).toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Judge BERT</span>
          <span className="metric-value">{(m.judge_bert_score * 100).toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Crime Recall</span>
          <span className="metric-value">{(m.crime_recall * 100).toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Crime Precision</span>
          <span className="metric-value">{(m.crime_precision * 100).toFixed(1)}%</span>
        </div>
        {m.golden_answer && (
          <div className="metric-item full-width">
            <span className="metric-label">Golden Answer</span>
            <span className="metric-value">{m.golden_answer}</span>
          </div>
        )}
      </div>
    );
  }

  if (m.f1 !== undefined) {
    return (
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">F1 Score</span>
          <span className="metric-value">{(m.f1 * 100).toFixed(1)}%</span>
        </div>
        {m.golden_answer && (
          <div className="metric-item full-width">
            <span className="metric-label">Golden Answer</span>
            <span className="metric-value">{m.golden_answer}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function SampleModal({ sample, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>Sample Details</h2>
          <div className="modal-meta">
            <span className="meta-badge">#{sample.test_idx}</span>
            <span className="meta-badge">{sample.dataset}</span>
            <span className="meta-badge">{sample.memory_system}</span>
            <span className="meta-badge">{sample.model}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Score</h3>
            <div className="modal-score">
              <span className="score-value">{getScoreDisplay(sample)?.toFixed(4) || 'N/A'}</span>
            </div>
          </div>

          <div className="modal-section">
            <h3>Metrics</h3>
            {getMetricsDisplay(sample)}
          </div>

          {sample.messages && sample.messages.length > 0 && (
            <div className="modal-section">
              <h3>Input Messages</h3>
              <div className="messages-list">
                {sample.messages.map((msg, idx) => (
                  <div key={idx} className={`message-item ${msg.role}`}>
                    <span className="message-role">{msg.role}</span>
                    <p className="message-content">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sample.response && (
            <div className="modal-section">
              <h3>Model Response</h3>
              <div className="response-content">
                {sample.response}
              </div>
            </div>
          )}

          {sample.eval_details && (sample.eval_details.exp_reasoning || sample.eval_details.golden_answer) && (
            <div className="modal-section">
              <h3>Evaluation Details</h3>
              {sample.eval_details.exp_reasoning && (
                <div className="eval-detail">
                  <span className="eval-label">Expected Reasoning:</span>
                  <p>{sample.eval_details.exp_reasoning}</p>
                </div>
              )}
              {sample.eval_details.golden_answer && (
                <div className="eval-detail">
                  <span className="eval-label">Golden Answer:</span>
                  <p>{sample.eval_details.golden_answer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function loadCaseSamples(caseId) {
  const decodedId = decodeURIComponent(caseId);
  const safeName = decodedId.replace("/", "_").replace("&", "_");
  try {
    const response = await import(`../data/samples/${safeName}.json`);
    return response.default;
  } catch {
    return [];
  }
}

export default function CaseSamples() {
  const { caseId } = useParams();
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [filterMemory, setFilterMemory] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    loadCaseSamples(caseId).then(data => {
      setSamples(data);
      setLoading(false);
    });
  }, [caseId]);

  const filteredSamples = useMemo(() => {
    return samples.filter(s => {
      if (filterMemory !== 'all' && s.memory_system !== filterMemory) return false;
      if (filterModel !== 'all' && s.model !== filterModel) return false;
      return true;
    });
  }, [samples, filterMemory, filterModel]);

  const totalPages = Math.ceil(filteredSamples.length / ITEMS_PER_PAGE);
  const paginatedSamples = filteredSamples.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const caseInfo = cases.find(c => c.id === caseId);

  const rankedSystems = useMemo(() => {
    const caseData = eloData.cases[caseId];
    if (!caseData) return [];
    return Object.entries(caseData.elo)
      .sort((a, b) => b[1] - a[1])
      .map(([key, elo]) => ({
        systemKey: key,
        memorySystem: getMemorySystemId(key),
        baseModel: getBaseModelId(key),
        elo
      }));
  }, [caseId]);

  const uniqueMemories = useMemo(() => {
    return [...new Set(samples.map(s => s.memory_system))];
  }, [samples]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="case-samples-page">
        <div className="page-wrapper">
          <Link to="/cases" className="back-link">← Back to Cases</Link>
          <div className="loading">Loading samples...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="case-samples-page">
      <div className="page-wrapper">
        <Link to="/cases" className="back-link">← Back to Cases</Link>

        <div className="case-header">
          <div className="case-header-info">
            <h1>{caseInfo?.name || caseId}</h1>
            <span className={`case-type-badge ${caseId.startsWith('domain') ? 'domain' : 'task'}`}>
              {caseId.startsWith('domain') ? 'Domain' : 'Task'}
            </span>
          </div>
          <div className="case-header-stats">
            <div className="stat">
              <span className="stat-value">{filteredSamples.length}</span>
              <span className="stat-label">Samples</span>
            </div>
            <div className="stat">
              <span className="stat-value">{uniqueMemories.length}</span>
              <span className="stat-label">Memory Systems</span>
            </div>
          </div>
        </div>

        <div className="sample-filters">
          <div className="filter-group">
            <label>Memory System</label>
            <select value={filterMemory} onChange={e => { setFilterMemory(e.target.value); setCurrentPage(1); }}>
              <option value="all">All</option>
              {uniqueMemories.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Model</label>
            <select value={filterModel} onChange={e => { setFilterModel(e.target.value); setCurrentPage(1); }}>
              <option value="all">All</option>
              <option value="Qwen3-8B">Qwen3-8B</option>
              <option value="Qwen3-32B">Qwen3-32B</option>
            </select>
          </div>
        </div>

        <section className="samples-section">
          <h2 className="section-title">Sample Evaluations ({filteredSamples.length})</h2>
          <div className="samples-list">
            {paginatedSamples.map((sample, idx) => (
              <div
                key={`${sample.model}-${sample.memory_system}-${sample.test_idx}-${idx}`}
                className={`sample-card`}
                onClick={() => setSelectedSample(sample)}
              >
                <div className="sample-header">
                  <div className="sample-info">
                    <span className="sample-idx">#{sample.test_idx}</span>
                    <span className="sample-dataset">{sample.dataset || sample.case_name}</span>
                    <span className="sample-memory">{sample.memory_system}</span>
                    <span className="sample-model">{sample.model}</span>
                  </div>
                  <div className="sample-score">
                    <span className="score-value">{getScoreDisplay(sample)?.toFixed(2) || 'N/A'}</span>
                    <span className="score-label">Score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
              >
                ««
              </button>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                «
              </button>
              <div className="page-numbers">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                »
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                »»
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </section>

        <section className="systems-ranking">
          <h2 className="section-title">Systems Ranking for This Case</h2>
          <div className="ranking-list">
            {rankedSystems.map((sys, idx) => (
              <div key={sys.systemKey} className="ranking-item">
                <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                <div className="system-info">
                  <span className="system-name">{memorySystems.find(m => m.id === sys.memorySystem)?.name || sys.memorySystem}</span>
                  <span className="system-model">{sys.baseModel}</span>
                </div>
                <span className="elo-value">{sys.elo.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedSample && (
        <SampleModal sample={selectedSample} onClose={() => setSelectedSample(null)} />
      )}
    </div>
  );
}