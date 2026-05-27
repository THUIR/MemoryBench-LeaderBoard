import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { cases, memorySystems, baseModels, getMemorySystemId, getBaseModelId, eloData } from '../data/eloData';
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
      <div className="checklist-grid">
        <div className="checklist-item">
          <span className="checklist-label">Reasoning BERT</span>
          <div className="checklist-bar-container">
            <div
              className="checklist-bar"
              style={{ width: `${(m.reasoning_bert_score || 0) * 100}%` }}
            />
          </div>
          <span className="checklist-score">{(m.reasoning_bert_score * 100).toFixed(1)}%</span>
        </div>
        <div className="checklist-item">
          <span className="checklist-label">Judge BERT</span>
          <div className="checklist-bar-container">
            <div
              className="checklist-bar"
              style={{ width: `${(m.judge_bert_score || 0) * 100}%` }}
            />
          </div>
          <span className="checklist-score">{(m.judge_bert_score * 100).toFixed(1)}%</span>
        </div>
        <div className="checklist-item">
          <span className="checklist-label">Crime Recall</span>
          <div className="checklist-bar-container">
            <div
              className="checklist-bar"
              style={{ width: `${(m.crime_recall || 0) * 100}%` }}
            />
          </div>
          <span className="checklist-score">{(m.crime_recall * 100).toFixed(1)}%</span>
        </div>
        <div className="checklist-item">
          <span className="checklist-label">Crime Precision</span>
          <div className="checklist-bar-container">
            <div
              className="checklist-bar"
              style={{ width: `${(m.crime_precision || 0) * 100}%` }}
            />
          </div>
          <span className="checklist-score">{(m.crime_precision * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  }

  if (m.f1 !== undefined) {
    return (
      <div className="checklist-grid">
        <div className="checklist-item">
          <span className="checklist-label">F1 Score</span>
          <div className="checklist-bar-container">
            <div
              className="checklist-bar"
              style={{ width: `${(m.f1 || 0) * 100}%` }}
            />
          </div>
          <span className="checklist-score">{(m.f1 * 100).toFixed(1)}%</span>
        </div>
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
          {/* Top Section: Score + Metrics */}
          <div className="modal-top-section">
            <div className="modal-section modal-score-section">
              <h3>Score</h3>
              <div className="modal-score">
                <span className="score-value">{getScoreDisplay(sample)?.toFixed(4) || 'N/A'}</span>
              </div>
            </div>

            <div className="modal-section modal-metrics-section">
              <h3>Metrics</h3>
              {getMetricsDisplay(sample)}
            </div>
          </div>

          {/* Evaluation Details Section (if exists) */}
          {sample.eval_details && sample.eval_details.exp_reasoning && (
            <div className="modal-section modal-eval-section">
              <h3>Evaluation Details</h3>
              <div className="eval-detail">
                <span className="eval-label">Expected Reasoning:</span>
                <p>{sample.eval_details.exp_reasoning}</p>
              </div>
            </div>
          )}

          {/* Bottom Section: Two Columns - Input Messages & Model Response */}
          <div className="modal-bottom-section">
            <div className="modal-column">
              {sample.messages && sample.messages.length > 0 && (
                <div className="modal-section modal-messages-section">
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
            </div>

            <div className="modal-column">
              {sample.response && (
                <div className="modal-section modal-response-section">
                  <h3>Model Response</h3>
                  <div className="response-content">
                    {sample.response}
                  </div>
                </div>
              )}
            </div>
          </div>
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
  const [filterScore, setFilterScore] = useState('all');
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

  const evaluatedSystemKeys = useMemo(() => {
    return new Set(rankedSystems.map(s => s.systemKey));
  }, [rankedSystems]);

  const evaluatedSamples = useMemo(() => {
    return samples.filter(s => {
      const modelSuffix = s.model.includes("32B") ? "-32B" : "-8B";
      const sysKey = `${s.memory_system}${modelSuffix}`;
      return evaluatedSystemKeys.has(sysKey);
    });
  }, [samples, evaluatedSystemKeys]);

  const filteredSamples = useMemo(() => {
    return evaluatedSamples.filter(s => {
      if (filterMemory !== 'all' && s.memory_system !== filterMemory) return false;
      if (filterModel !== 'all' && s.model !== filterModel) return false;
      if (filterScore !== 'all') {
        const score = getScoreDisplay(s);
        if (filterScore === 'high' && score < 0.8) return false;
        if (filterScore === 'mid' && (score < 0.5 || score >= 0.8)) return false;
        if (filterScore === 'low' && score >= 0.5) return false;
      }
      return true;
    });
  }, [evaluatedSamples, filterMemory, filterModel, filterScore]);

  const totalPages = Math.ceil(filteredSamples.length / ITEMS_PER_PAGE);
  const paginatedSamples = filteredSamples.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const caseInfo = cases.find(c => c.id === caseId);

  const uniqueMemories = useMemo(() => {
    return [...new Set(evaluatedSamples.map(s => s.memory_system))];
  }, [evaluatedSamples]);

  const systemsCount = rankedSystems.length;

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
              <span className="stat-value">{evaluatedSamples.length}</span>
              <span className="stat-label">Samples</span>
            </div>
            <div className="stat">
              <span className="stat-value">{systemsCount}</span>
              <span className="stat-label">Systems</span>
            </div>
          </div>
        </div>

        <section className="systems-ranking">
          <div className="section-header">
            <h2 className="section-title">Systems Ranking for This Case</h2>
            <p className="section-subtitle">Performance comparison of all memory systems on this benchmark case, ranked by ELO rating</p>
          </div>
          <div className="ranking-chart">
            {rankedSystems.slice(0, 12).map((sys, idx) => {
              const maxElo = rankedSystems[0]?.elo || 1;
              const minElo = rankedSystems[rankedSystems.length - 1]?.elo || 0;
              const score = Math.max(0.05, (sys.elo - minElo) / (maxElo - minElo || 1));
              return (
                <div key={sys.systemKey} className="ranking-bar-item">
                  <div className="ranking-bar-label">
                    <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                    <span className="ranking-system-name">{memorySystems.find(m => m.id === sys.memorySystem)?.name || sys.memorySystem}</span>
                    <span className="ranking-model-name">{baseModels.find(b => b.id === sys.baseModel)?.name || sys.baseModel}</span>
                  </div>
                  <div className="ranking-bar-track">
                    <div className="ranking-bar-fill" style={{ width: `${score * 100}%` }} />
                  </div>
                  <span className="ranking-elo-value">{sys.elo.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="sample-section">
          <div className="section-header">
            <h2 className="section-title">Sample Evaluations ({filteredSamples.length})</h2>
            <p className="section-subtitle">Individual evaluation results for each sample in this benchmark case</p>
          </div>
          <div className="sample-section-container">
            <div className="sample-filters">
              <div className="filter-row">
              <div className="filter-group">
                <label>Model</label>
                <select value={filterModel} onChange={e => { setFilterModel(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All</option>
                  <option value="Qwen3-8B">Qwen3-8B</option>
                  <option value="Qwen3-32B">Qwen3-32B</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Memory System</label>
                <select value={filterMemory} onChange={e => { setFilterMemory(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All</option>
                  {uniqueMemories.map(m => (
                    <option key={m} value={m}>{memorySystems.find(mem => mem.id === m)?.name || m}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Score</label>
                <select value={filterScore} onChange={e => { setFilterScore(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All</option>
                  <option value="high">High (&gt;=0.8)</option>
                  <option value="mid">Mid (0.5-0.8)</option>
                  <option value="low">Low (&lt;0.5)</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={() => { setFilterMemory('all'); setFilterModel('all'); setFilterScore('all'); setCurrentPage(1); }}>
                ✕ Clear
              </button>
              </div>
            </div>

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
              <input
                type="number"
                className="page-jump-input"
                min={1}
                max={totalPages}
                placeholder="#"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= totalPages) handlePageChange(val);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          )}
          </div>
        </section>
      </div>

      {selectedSample && (
        <SampleModal sample={selectedSample} onClose={() => setSelectedSample(null)} />
      )}
    </div>
  );
}