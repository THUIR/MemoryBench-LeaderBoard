import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { cases, memorySystems, baseModels, getMemorySystemId, getBaseModelId, eloData } from '../data/eloData';
import './CaseSamples.css';

const ITEMS_PER_PAGE = 10;

// Metrics that are auxiliary data (not to be displayed as individual items)
const AUXILIARY_METRICS = new Set([
  'exp_reasoning', 'gen_reasoning', 'exp_judge', 'gen_judge',
  'golden_answer', 'evidence', 'exp_crime', 'gen_crime',
  'exp_time', 'gen_time', 'exp_amount', 'gen_amount',
  'exp_penalcode_index', 'gen_penalcode_index',
  'checklist', 'checklist_content'
]);

// Format metric name for display (e.g., "reasoning_bert_score" -> "Reasoning BERT")
function formatMetricName(metricName) {
  const nameMap = {
    'avg_score': 'Avg Score',
    'f1': 'F1',
    'rougel': 'Rouge-L',
    'reasoning_bert_score': 'Reasoning BERT',
    'judge_bert_score': 'Judge BERT',
    'crime_recall': 'Crime Recall',
    'crime_precision': 'Crime Precision',
    'time_score': 'Time Score',
    'amount_score': 'Amount Score',
    'penalcode_index_recall': 'Penalcode Index Recall',
    'penalcode_index_precision': 'Penalcode Index Precision',
    'reasoning_meteor': 'Reasoning METEOR',
    'judge_meteor': 'Judge METEOR',
    'meteor': 'METEOR',
  };
  if (nameMap[metricName]) return nameMap[metricName];
  // Convert snake_case to Title Case
  return metricName.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Helper function to get baseModel ID from model name (e.g., "DeepSeek-V4-Flash" -> "DeepSeek-V4-Flash")
function getBaseModelIdFromModel(modelName) {
  // Find matching baseModel
  const found = baseModels.find(b => modelName.includes(b.name));
  if (found) return found.id;

  // Fallback logic
  if (modelName.includes("32B")) return "32B";
  if (modelName.includes("8B")) return "8B";
  if (modelName.includes("DeepSeek")) return "DeepSeek-V4-Flash";
  if (modelName.includes("Mistral")) return "Mistral-Small-3.2-24B-Instruct-2506";
  return modelName;
}

function getScoreDisplay(sample) {
  const metricType = sample.metric_type;
  const m = sample.metrics;
  if (!m) return null;

  // Use the appropriate metric directly based on metric_type
  if (metricType === 'avg_score' && m.avg_score !== undefined) {
    return m.avg_score;
  }
  if (metricType === 'reasoning_bert_score' && m.reasoning_bert_score !== undefined) {
    return m.reasoning_bert_score;
  }
  if (metricType === 'bert_score' && m.bert_score !== undefined) {
    return m.bert_score;
  }
  if (metricType === 'BERTScore-F1' && m['BERTScore-F1'] !== undefined) {
    return m['BERTScore-F1'];
  }

  // Fallback to display_score
  if (sample.display_score != null) return sample.display_score;
  return null;
}

function getMetricTypeLabel(sample) {
  const metricType = sample.metric_type;
  if (metricType === 'avg_score') return 'Avg Score';
  if (metricType === 'reasoning_bert_score') return 'Reasoning BERT';
  if (metricType === 'bert_score') return 'BERT Score';
  if (metricType === 'BERTScore-F1') return 'BERTScore-F1';
  return 'Score';
}

function getMetricTypeLabelForCase(caseId) {
  // Map caseId to metric label
  const avgScoreCases = ['domain/Academic&Knowledge', 'domain/Open-Domain', 'task/Long-Long', 'task/Short-Long'];
  const reasoningBertCases = ['domain/Legal'];
  const bertScoreCases = ['task/Long-Short'];
  const bertscoreF1Cases = ['task/Short-Short'];

  if (avgScoreCases.includes(caseId)) return 'Avg Score';
  if (reasoningBertCases.includes(caseId)) return 'Reasoning BERT';
  if (bertScoreCases.includes(caseId)) return 'BERT Score';
  if (bertscoreF1Cases.includes(caseId)) return 'BERTScore-F1';
  return 'Score';
}

function getMetricsDisplay(sample) {
  const m = sample.metrics;
  const metricType = sample.metric_type;
  if (!m) return null;

  // For avg_score cases: show checklist evaluation if available
  if (metricType === 'avg_score' && m.checklist_evaluation && m.checklist_evaluation.length > 0) {
    return (
      <div className="checklist-grid">
        {m.checklist_evaluation.map((item, cidx) => (
          <div key={cidx} className="checklist-item">
            <span className="checklist-label">evaluation_score_{item.checklist_id}</span>
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

  // Dynamically render all available score metrics from the data
  const scoreMetrics = [];
  for (const [key, value] of Object.entries(m)) {
    if (AUXILIARY_METRICS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value !== 'number') continue;
    scoreMetrics.push({ name: key, value, displayName: formatMetricName(key) });
  }

  // Sort metrics by priority: avg_score, bert_score, BERTScore-F1, then others alphabetically
  const priorityOrder = ['avg_score', 'bert_score', 'BERTScore-F1', 'f1', 'rougel',
                         'judge_bert_score', 'crime_recall', 'crime_precision', 'time_score', 'amount_score',
                         'penalcode_index_recall', 'penalcode_index_precision',
                         'reasoning_meteor', 'judge_meteor', 'meteor'];
  scoreMetrics.sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.name);
    const bIdx = priorityOrder.indexOf(b.name);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  if (scoreMetrics.length > 0) {
    // Metrics that should NOT be displayed as percentage (reasoning_bert_score, bert_score, BERTScore-F1 should show raw value like 0.6758)
    const NON_PERCENTAGE_METRICS = ['reasoning_bert_score', 'bert_score', 'BERTScore-F1', 'judge_bert_score'];

    return (
      <div className="checklist-grid">
        {scoreMetrics.map((metric, idx) => {
          const isNonPercentage = NON_PERCENTAGE_METRICS.includes(metric.name);
          // For bar width, still use percentage (0-1 -> 0-100%), cap at 100%
          const barWidth = metric.value <= 1 ? metric.value * 100 : 100;
          // For display, don't multiply by 100 for non-percentage metrics
          const displayValue = isNonPercentage ? metric.value : (metric.value <= 1 ? metric.value * 100 : metric.value);
          // Show 2 decimals for all metrics, except non-percentage metrics show 4 decimals
          const decimals = isNonPercentage ? 4 : 2;
          return (
            <div key={idx} className="checklist-item">
              <span className="checklist-label">{metric.displayName}</span>
              <div className="checklist-bar-container">
                <div
                  className="checklist-bar"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="checklist-score">{displayValue.toFixed(decimals)}{isNonPercentage ? '' : (metric.value <= 1 ? '%' : '')}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Default fallback
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
              <h3>{getMetricTypeLabel(sample)}</h3>
              <div className="modal-score">
                <span className="score-value">{getScoreDisplay(sample)?.toFixed(4) || 'N/A'}</span>
              </div>
            </div>

            <div className="modal-section modal-metrics-section">
              <h3>Metrics</h3>
              {getMetricsDisplay(sample) || (sample.metrics?.reason ? (
                <div className="metrics-reason">
                  <p>{sample.metrics.reason}</p>
                </div>
              ) : null)}
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
      // Build systemKey using the actual model name (full model id)
      const modelId = getBaseModelIdFromModel(s.model);
      const sysKey = `${s.memory_system}-${modelId}`;
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
              <span className="stat-value">{caseInfo?.samples}</span>
              <span className="stat-label">Cases</span>
            </div>
            <div className="stat">
              <span className="stat-value">{filteredSamples.length}</span>
              <span className="stat-label">Samples</span>
            </div>
            <div className="stat">
              <span className="stat-value">{systemsCount}</span>
              <span className="stat-label">Systems</span>
            </div>
          </div>
        </div>
        {(caseId === 'domain/Open-Domain' || caseId === 'task/Long-Short') && (
          <div className="case-header-note">
            <p><strong>Note:</strong> Mem0 is not available for this case as it timed out and could not complete evaluation on <strong>Open-Domain</strong> and <strong>Long-Short</strong> benchmarks.</p>
          </div>
        )}

        <section className="systems-ranking">
          <div className="section-header">
            <h2 className="section-title">Systems Ranking for This Case</h2>
            <p className="section-subtitle">Performance comparison of all memory systems on this benchmark case, ranked by ELO rating</p>
          </div>
          <div className="ranking-chart ranking-scroll">
            {rankedSystems.map((sys, idx) => {
              const maxElo = rankedSystems[0]?.elo || 1;
              const minElo = rankedSystems[rankedSystems.length - 1]?.elo || 0;
              const score = Math.max(0.05, (sys.elo - minElo) / (maxElo - minElo || 1));
              return (
                <div key={sys.systemKey} className="ranking-bar-item">
                  <div className="ranking-bar-label">
                    <span className="rank-badge">{idx + 1}</span>
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
                  {baseModels.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
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
                <label>{getMetricTypeLabelForCase(caseId)}</label>
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
                    <span className="score-label">{getMetricTypeLabel(sample)}</span>
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