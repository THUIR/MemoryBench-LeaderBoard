import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { eloData, memorySystems, baseModels, cases } from '../data/eloData';
import './Home.css';

function ELOBar({ elo, maxElo = 1100, minElo = 900, color = 'var(--accent-golden)' }) {
  const rawPercentage = ((elo - minElo) / (maxElo - minElo)) * 100;
  const percentage = Math.max(8, Math.min(100, rawPercentage));
  return (
    <div className="elo-bar-container">
      <div className="elo-bar" style={{ width: `${percentage}%`, background: color }} />
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

const introData = [
  {
    id: 'paper',
    icon: '📄',
    title: 'Paper',
    description: 'MemoryBench is a standardized and extensible benchmark for evaluating memory and continual learning in LLM systems.',
    details: [
      '🌟 Accepted at ICML 2026 as a Spotlight Paper.',
      '',
      'Multi-dimensional evaluation – Declarative + Procedural memory, explicit + implicit feedback',
      'Comprehensive coverage – 28 benchmarks, 3 domains, 4 task formats, 2 languages',
      'Realistic user feedback simulation – LLM-as-user with verbal/action feedback (like, copy, dislike)',
      '8 baselines evaluated – Vanilla, RAG (BM25/Embed), A-Mem, Mem0, MemoryOS',
      'Off-policy & on-policy settings – Stepwise learning curves, ELO-based ranking'
    ]
  },
  {
    id: 'github',
    icon: '🚀',
    title: 'GitHub',
    description: 'Official open-source implementation of MemoryBench with Streamlit frontend, multiple memory system baselines, and complete evaluation pipelines.',
    details: [
      'Easy-to-use Streamlit frontend – configure and run experiments with minimal setup',
      'Off-policy & on-policy experiments – fully reproduce paper settings',
      '28 benchmark datasets – covering Open, Legal, and Academic domains',
      '8 baseline systems – Vanilla, BM25-M/S, Embed-M/S, A-Mem, Mem0, MemoryOS',
      'Complete evaluation workflow – dataset loading, evaluation, normalization, and summary'
    ]
  },
  {
    id: 'huggingface',
    icon: '🤗',
    title: 'HuggingFace',
    description: 'Train/test splits across 28 benchmarks. Includes multi-turn dialogues and simulated user feedback.',
    details: [
      '28 datasets across 3 domains & 4 task formats',
      'Two user simulators: Qwen3-32B & Mistral-3.2-24B',
      '8 baseline dialogue variants (BM25, Embedder, A-Mem, Mem0, MemoryOS)',
      'One-line loading via Hugging Face datasets'
    ]
  }
];

const codeSnippets = {
  paper: [
    '📄 [paper_info.md]',
    'MemoryBench',
    '==================',
    'A Benchmark for Memory and',
    'Continual Learning in LLM Systems',
    '',
    '✓ Accepted at ICML 2026',
    '✓ Selected for Spotlight Paper',
    '',
    'Datasets: 28 benchmarks',
    'Memory Systems: 8 baselines',
    'Evaluation: Multi-dimensional',
    '',
    'Key Features:',
    '• Off-policy & on-policy evaluation',
    '• Stepwise learning curves',
    '• ELO-based ranking',
    '• Simulated user feedback (verbal + action)',
    '',
    'Domains: Open | Legal | Academic',
    'Task formats: LiSo | SiLo | LiLo | SiSo',
    'Languages: English | Chinese'
  ],
  github: [
    '# MemoryBench Installation & Quick Start',
    '',
    '# 1. Clone repository',
    'git clone https://github.com/LittleDinoC/MemoryBench',
    'cd MemoryBench',
    '',
    '# 2. Create conda environment',
    'conda create -n memorybench python=3.10',
    'conda activate memorybench',
    'pip install -r requirements.txt',
    '',
    '# 3. Configure .env file (models & API keys)',
    '',
    '# 4. Run off-policy experiments',
    'python run_scripts/off_policy.py',
    '',
    '# 5. Launch Streamlit frontend',
    'cd frontend && streamlit run app.py'
  ],
  huggingface: [
    'Load Dataset via HuggingFace',
    '===========================',
    '',
    'from datasets import load_dataset',
    '',
    'dataset = load_dataset("THUIR/MemoryBench", "NFCats")',
    '',
    '# Load corpus for long-context datasets',
    'corpus = load_dataset("THUIR/MemoryBench",',
    '    data_files="corpus/DialSim-bigbang.jsonl")',
    '',
    'Dataset fields:',
    '• test_idx: unique identifier',
    '• input_prompt: user query',
    '• dialog: conversation history',
    '• implicit_feedback: satisfaction score + actions',
    '• info: evaluation metadata',
    '',
    'Available subsets:',
    '• 3 domains: Open / Legal / Academic',
    '• 4 task formats: LiSo / SiLo / LiLo / SiSo'
  ]
};

function IntroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [codeVisibleLines, setCodeVisibleLines] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % introData.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setCodeVisibleLines(0);
    const lines = codeSnippets[currentData.id].length;
    let line = 0;
    const lineInterval = setInterval(() => {
      line++;
      setCodeVisibleLines(line);
      if (line >= lines) clearInterval(lineInterval);
    }, 80);
    return () => clearInterval(lineInterval);
  }, [activeIndex]);

  const currentData = introData[activeIndex];
  const currentCode = codeSnippets[currentData.id];

  return (
    <section className="intro-section">
      <div className="page-wrapper">
        <div className="intro-grid">
          <div className="intro-left">
            <div className="intro-tabs">
              {introData.map((item, idx) => (
                <button
                  key={item.id}
                  className={`intro-tab ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => { setActiveIndex(idx); setCodeVisibleLines(0); }}
                >
                  <span className="tab-icon">{item.icon}</span>
                  <span className="tab-title">{item.title}</span>
                </button>
              ))}
            </div>
            <div className="intro-content" key={activeIndex}>
              <h3 className="intro-content-title">{currentData.title}</h3>
              <p className="intro-content-desc">{currentData.description}</p>
              <ul className="intro-detail-list">
                {currentData.details.map((d, i) => {
                  if (d === '') {
                    return <li key={i} className="intro-detail-empty"><span>&nbsp;</span></li>;
                  }
                  if (d.startsWith('🌟') || d === 'Key Features:') {
                    return <li key={i} className="intro-detail-special">{d}</li>;
                  }
                  return (
                    <li key={i} className="intro-detail-item">
                      <span className="detail-dot">•</span>
                      {d}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="intro-right">
            <div className="code-block active">
              <div className="code-header">
                <span className="code-dot red"></span>
                <span className="code-dot yellow"></span>
                <span className="code-dot green"></span>
                <span className="code-title">
                  {currentData.id === 'paper' && '📄 Paper'}
                  {currentData.id === 'github' && '🚀 GitHub'}
                  {currentData.id === 'huggingface' && '🤗 HuggingFace'}
                </span>
              </div>
              <pre className="code-content terminal">
                {currentCode.map((line, idx) => (
                  <div
                    key={idx}
                    className={`code-line ${idx < codeVisibleLines ? 'visible' : ''}`}
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg-pattern"></div>
      <div className="hero-bg-glow"></div>
      <div className="page-wrapper">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Benchmark
            </div>
            <h1 className="hero-title">
              Memory<span className="title-accent">Bench</span>
            </h1>
            <p className="hero-description">
              A standardized and extensible benchmark for evaluating memory and continual learning in LLM systems
            </p>
            <div className="hero-links">
              <a href="https://arxiv.org/abs/2510.17281" target="_blank" rel="noopener noreferrer" className="hero-link">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h7v1.5h-7V13zm0 3h7v1.5h-7V16zm0-6h3v1.5h-3V10z"/>
                </svg>
                Paper
              </a>
              <a href="https://github.com/LittleDinoC/MemoryBench" target="_blank" rel="noopener noreferrer" className="hero-link">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a href="https://huggingface.co/datasets/THUIR/MemoryBench" target="_blank" rel="noopener noreferrer" className="hero-link">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.25l8.25 4.5v9L12 20.25l-8.25-4.5v-9L12 2.25z"/>
                </svg>
                HuggingFace
              </a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-card bounce-1">
              <span className="stat-value">28</span>
              <span className="stat-label">Datasets</span>
            </div>
            <div className="hero-stat-card bounce-2">
              <span className="stat-value">8</span>
              <span className="stat-label">Memory Systems</span>
            </div>
            <div className="hero-stat-card bounce-3">
              <span className="stat-value">4</span>
              <span className="stat-label">models</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getMemorySystemName(id) {
  return memorySystems.find(m => m.id === id)?.name || id;
}

function getBaseModelName(key) {
  if (key.includes('-DeepSeek-V4-Flash')) return 'DeepSeek-V4-Flash';
  if (key.includes('-Mistral-Small-3.2-24B-Instruct-2506')) return 'Mistral-Small-3.2-24B-Instruct-2506';
  if (key.includes('-Qwen3-32B')) return 'Qwen3-32B';
  return 'Qwen3-8B';
}

function HomeLeaderboard() {
  const [selectedBaseModel, setSelectedBaseModel] = useState('');
  const [selectedMemorySystem, setSelectedMemorySystem] = useState('');

  const filteredData = useMemo(() => {
    let data = Object.entries(eloData.overall_elo).map(([key, value]) => ({
      systemKey: key,
      elo: value.avg,
      participated: value.participated_cases
    }));

    data = data.filter(d => d.participated === 7);

    if (selectedBaseModel) {
      data = data.filter(d => d.systemKey.endsWith(`-${selectedBaseModel}`));
    }
    if (selectedMemorySystem) {
      data = data.filter(d => d.systemKey.startsWith(selectedMemorySystem));
    }

    return data.sort((a, b) => b.elo - a.elo);
  }, [selectedBaseModel, selectedMemorySystem]);

  const eloRange = useMemo(() => {
    if (filteredData.length === 0) return { min: 900, max: 1100 };
    const allElos = filteredData.map(d => d.elo);
    return {
      min: Math.min(...allElos),
      max: Math.max(...allElos)
    };
  }, [filteredData]);

  const barColors = ['#c9a962', '#d4b896', '#b8860b', '#8b7355', '#5c4a3a', '#a89b8a', '#6b5d4d', '#9c8b7a'];

  const getBarColor = (index) => {
    return barColors[index % barColors.length];
  };

  const clearFilters = () => {
    setSelectedBaseModel('');
    setSelectedMemorySystem('');
  };

  return (
    <section className="home-leaderboard">
      <div className="page-wrapper">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Overall Rankings</h2>
            <span className="section-badge">Top 10</span>
          </div>
          <p className="section-subtitle">Comprehensive ELO ratings across all benchmark cases, showing the top 10 model-memory combinations</p>
        </div>
        <div className="leaderboard-chart">
          {filteredData.slice(0, 10).map((row, index) => {
            const globalMinElo = 850;
            const globalMaxElo = 1150;
            const score = Math.max(0.05, (row.elo - globalMinElo) / (globalMaxElo - globalMinElo));
            const fullName = `${getBaseModelName(row.systemKey)} + ${getMemorySystemName(row.systemKey.replace('-8B', '').replace('-32B', ''))}`;
            return (
              <div key={row.systemKey} className="chart-bar-item">
                <div className="bar-label">
                  <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                  <span className="bar-name" title={fullName}>{fullName}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${score * 100}%`,
                      backgroundColor: getBarColor(index),
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                </div>
                <div className="bar-value">{row.elo.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
        <div className="view-more">
          <Link to="/leaderboard" className="view-more-link">
            View Full Leaderboard
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TagsSection({ lastClickedTag, setLastClickedTag, highlightedTag, setHighlightedTag }) {
  const domainCases = cases.filter(c => c.type === 'domain');
  const taskCases = cases.filter(c => c.type === 'task');

  const handleTagClick = (tagId) => {
    setLastClickedTag(tagId);
    setHighlightedTag('');
  };

  return (
    <section className="tags-section" id="tags-section">
      <div className="page-wrapper">
        <div className="tags-grid">
          <div className="tag-category">
            <div className="tag-category-header">
              <span className="category-icon">🤖</span>
              <span className="category-label">Models</span>
              <span className="category-count">{baseModels.length}</span>
            </div>
            <div className="tag-list">
              {baseModels.map(m => (
                <Link
                  key={m.id}
                  to={`/leaderboard?model=${m.id}&section=overall-rankings`}
                  className={`tag tag-model${highlightedTag === `model-${m.id}` ? ' highlighted-tag' : ''}`}
                  onClick={() => handleTagClick(`model-${m.id}`)}
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="tag-category">
            <div className="tag-category-header">
              <span className="category-icon">💾</span>
              <span className="category-label">Memory Systems</span>
              <span className="category-count">8</span>
            </div>
            <div className="tag-list">
              {memorySystems.map(m => (
                <Link
                  key={m.id}
                  to={`/leaderboard?memory=${m.id}&section=overall-rankings`}
                  className={`tag tag-memory${highlightedTag === `memory-${m.id}` ? ' highlighted-tag' : ''}`}
                  onClick={() => handleTagClick(`memory-${m.id}`)}
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="tag-category">
            <div className="tag-category-header">
              <span className="category-icon">🏛</span>
              <span className="category-label">Domain Benchmarks</span>
              <span className="category-count">{domainCases.length}</span>
            </div>
            <div className="tag-list">
              {domainCases.map(c => (
                <Link
                  key={c.id}
                  to={`/leaderboard?benchmark=${encodeURIComponent(c.id)}&section=benchmark-rankings`}
                  className={`tag tag-domain${highlightedTag === `domain-${c.id}` ? ' highlighted-tag' : ''}`}
                  onClick={() => handleTagClick(`domain-${c.id}`)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="tag-category">
            <div className="tag-category-header">
              <span className="category-icon">📝</span>
              <span className="category-label">Task Benchmarks</span>
              <span className="category-count">{taskCases.length}</span>
            </div>
            <div className="tag-list">
              {taskCases.map(c => (
                <Link
                  key={c.id}
                  to={`/leaderboard?benchmark=${encodeURIComponent(c.id)}&section=benchmark-rankings`}
                  className={`tag tag-task${highlightedTag === `task-${c.id}` ? ' highlighted-tag' : ''}`}
                  onClick={() => handleTagClick(`task-${c.id}`)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="tags-note">
          <span className="note-icon">📊</span>
          <span>28 datasets · 8 memory systems · 3 domains · 4 tasks · 4 models</span>
        </div>
      </div>
    </section>
  );
}

function ChartSection() {
  const chartData = useMemo(() => {
    const fullData = eloData.overall_elo_full_participation;
    const entries = Object.entries(fullData).map(([key, value]) => {
      const [memId, modelId] = key.split('-');
      const mem = memorySystems.find(m => m.id === memId);
      return {
        name: mem ? mem.name : memId,
        elo: value.avg,
        participated: value.participated_cases
      };
    }).filter(d => d.participated === 7);

    const maxElo = Math.max(...entries.map(d => d.elo));
    const minElo = Math.min(...entries.map(d => d.elo));
    const range = maxElo - minElo || 1;

    return entries
      .map(d => ({
        ...d,
        score: (d.elo - minElo) / range
      }))
      .sort((a, b) => b.elo - a.elo)
      .slice(0, 8);
  }, []);

  const barColors = ['#c9a962', '#d4b896', '#b8860b', '#8b7355', '#5c4a3a', '#a89b8a', '#6b5d4d', '#9c8b7a'];

  return (
    <section className="chart-section">
      <div className="page-wrapper">
        <h2 className="section-title">Performance Overview</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map((item, idx) => (
              <div key={item.name} className="chart-bar-item">
                <div className="bar-label">{item.name}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${item.score * 100}%`,
                      backgroundColor: barColors[idx % barColors.length],
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                </div>
                <div className="bar-value">{item.elo.toFixed(1)}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend-custom">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#c9a962' }} />
              <span>Best</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#d4b896' }} />
              <span>Strong</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#b8860b' }} />
              <span>Average</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [highlightedTag, setHighlightedTag] = useState('');
  const [lastClickedTag, setLastClickedTag] = useState('');

  // Handle hash navigation and highlight from Leaderboard
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#tags-section') {
      const element = document.getElementById('tags-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (lastClickedTag) {
          setHighlightedTag(lastClickedTag);
          setTimeout(() => setHighlightedTag(''), 2000);
        }
      }
    }
  }, [lastClickedTag]);

  return (
    <div className="home-page">
      <HeroSection />
      <IntroSection />
      <HomeLeaderboard />
      <TagsSection lastClickedTag={lastClickedTag} setLastClickedTag={setLastClickedTag} highlightedTag={highlightedTag} setHighlightedTag={setHighlightedTag} />
    </div>
  );
}
