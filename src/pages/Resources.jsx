import { Link } from 'react-router-dom';
import './Resources.css';

const datasets = [
  { name: 'LoCoMo', domain: 'Open-Domain', language: 'EN', taskType: 'LiSo', metric: 'F1', authors: 'Maharana et al., 2024', description: 'Long-term conversational memory evaluation dataset; contains 10 long dialogues with ~200 questions per dialogue, grounded in personas and temporal event graphs.', link: 'https://arxiv.org/abs/2402.17753' },
  { name: 'DialSim', domain: 'Open-Domain', language: 'EN', taskType: 'LiSo', metric: 'Accuracy', authors: 'Kim et al., 2025', description: 'Dialogue simulation framework and QA dataset derived from long-running TV shows (Friends, TBBT, The Office) for evaluating multi-party, long-term dialogue understanding.', link: 'https://arxiv.org/abs/2406.13144' },
  { name: 'LexEval', domain: 'Legal', language: 'ZH', taskType: 'LiSo / SiSo', metric: 'ROUGE-L', authors: 'Li et al., 2024a', description: 'Comprehensive Chinese legal benchmark with 23 tasks and 14,150 questions, covering memorization, understanding, reasoning, discrimination, generation, and ethics.', link: 'https://proceedings.neurips.cc/paper_files/paper/2024/file/2cb40fc022ca7bdc1a9a78b793661284-Paper-Datasets_and_Benchmarks_Track.pdf' },
  { name: 'JuDGE', domain: 'Legal', language: 'ZH', taskType: 'SiSo', metric: 'METEOR, BERTScore, Accuracy', authors: 'Su et al., 2025', description: 'Benchmark for generating complete Chinese legal judgment documents from case facts, evaluated on penalty accuracy, convicting accuracy, referencing accuracy, and semantic similarity.', link: 'https://dl.acm.org/doi/10.1145/3726302.3730295' },
  { name: 'IdeaBench', domain: 'Academic', language: 'EN', taskType: 'LiSo', metric: 'BERTScore, LLM Rating', authors: 'Guo et al., 2025b', description: 'Benchmark for evaluating LLMs\' ability to generate novel and feasible research ideas, using a reference-based "Insight Score" aligned with human judgment.', link: 'https://dl.acm.org/doi/10.1145/3711896.3737419' },
  { name: 'LimitGen-Syn', domain: 'Academic', language: 'EN', taskType: 'SiSo', metric: 'Accuracy, Rating', authors: 'Xu et al., 2025b', description: 'Synthetic subset that introduces controlled perturbations (e.g., missing baselines, limited datasets) to evaluate LLMs\' ability to identify scientific paper limitations.', link: 'https://aclanthology.org/2025.acl-long.1009/' },
  { name: 'WritingPrompts', domain: 'Open-Domain', language: 'EN', taskType: 'SiSo', metric: 'METEOR', authors: 'Fan et al., 2018', description: 'Dataset of 300K human-written stories paired with short writing prompts from Reddit, used for hierarchical story generation and evaluating creative text generation.', link: 'https://aclanthology.org/P18-1082/' },
  { name: 'HelloBench', domain: 'Multi-Domain', language: 'EN', taskType: 'LiSo / LiLo', metric: 'LLM Rating', authors: 'Que et al., 2024', description: 'Comprehensive, in-the-wild, open-ended benchmark for evaluating LLMs\' long-text generation capabilities across 5 tasks (QA, summarization, chat, text completion, heuristic generation).', link: 'https://arxiv.org/abs/2409.16191' },
  { name: 'WritingBench', domain: 'Multi-Domain', language: 'EN/ZH', taskType: 'LiSo', metric: 'LLM Rating', authors: 'Wu et al., 2025c', description: 'Comprehensive benchmark for generative writing, covering 6 core domains and 100 subdomains, with a dynamic, query-dependent evaluation framework.', link: 'https://arxiv.org/abs/2503.05244' },
  { name: 'NF-Cats', domain: 'Open-Domain', language: 'EN', taskType: 'SiSo', metric: 'LLM Rating (1-5)', authors: 'Bolotova et al., 2022', description: 'Taxonomy and dataset categorizing non-factoid questions (e.g., instructions, reasons, debates) to analyze question-type distributions and model performance on complex QA.', link: 'https://dl.acm.org/doi/10.1145/3477495.3531926' },
  { name: 'SciTechNews', domain: 'Academic', language: 'EN', taskType: 'SiSo', metric: 'ROUGE-L, BERTScore, Readability', authors: 'Cardenas et al., 2023', description: 'Dataset pairing full scientific papers with their corresponding journalistic news articles, designed for automatic science journalism generation.', link: 'https://aclanthology.org/2023.emnlp-main.76/' },
];

const backboneModels = [
  { name: 'DeepSeek-V4-Flash', parameters: '-', usage: 'High-performance reasoning model with flash attention', description: 'Latest DeepSeek model optimized for speed and efficiency.', link: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash' },
  { name: 'Mistral-Small-3.2-24B-Instruct-2506', parameters: '24B', usage: 'Efficient instruct-tuned model', description: 'Mistral small model with 24B parameters, instruct-tuned for dialogue.', link: 'https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506' },
  { name: 'Qwen3-8B', parameters: '8B', usage: 'Main backbone for all memory systems', description: 'Primary experiment backbone; non-thinking mode deployment.', link: 'https://huggingface.co/Qwen/Qwen3-8B' },
  { name: 'Qwen3-32B', parameters: '32B', usage: 'Used as backbone model or user simulator', description: 'Larger-parameter Qwen3 model demonstrating stronger performance in tests.', link: 'https://huggingface.co/Qwen/Qwen3-32B' },
];

const memorySystems = {
  noMemory: { name: 'Vanilla', description: 'Directly uses the backbone LLM (no retrieval, no external memory) to answer each query.', config: 'base.json' },
  rag: [
    { name: 'BM25-S', algorithm: 'BM25', granularity: 'Entire session as single retrieval entry' },
    { name: 'BM25-M', algorithm: 'BM25', granularity: 'Each message as independent retrieval entry' },
    { name: 'Embed-S', algorithm: 'Qwen3-Embedding-0.6B', granularity: 'Entire session as single retrieval entry' },
    { name: 'Embed-M', algorithm: 'Qwen3-Embedding-0.6B', granularity: 'Each message as independent retrieval entry' },
  ],
  sota: [
    { name: 'A-Mem', fullName: 'Agentic Memory', authors: 'Xu et al., 2025a', description: 'An agentic memory system that dynamically organizes memories into interconnected knowledge networks via LLM-driven note construction, linking, and evolution.', link: 'https://arxiv.org/abs/2502.12110' },
    { name: 'Mem0', fullName: 'Memory-Centric', authors: 'Chhikara et al., 2025', description: 'A scalable memory-centric architecture that dynamically extracts, consolidates, and retrieves salient information from conversations, with an enhanced graph-based version (Mem0^g).', link: 'https://arxiv.org/abs/2504.19413' },
    { name: 'MemoryOS', fullName: 'Memory Operating System', authors: 'Kang et al., 2025', description: 'A memory operating system inspired by OS principles, featuring a hierarchical storage (short/mid/long-term) with segmented paging and heat-based updates for AI agents.', link: 'https://arxiv.org/abs/2506.06326' },
  ]
};

function ExternalLink({ href, children, className = '' }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`ext-link ${className}`}>
      {children}
    </a>
  );
}

export default function Resources() {
  return (
    <div className="resources-page">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Resources & Documentation</h1>
          <p className="page-subtitle">Complete reference for datasets, models, and memory systems in MemoryBench</p>
        </div>

        {/* Datasets */}
        <section className="resource-section">
          <div className="section-header">
            <h2 className="section-title">Datasets</h2>
            <p className="section-subtitle">11 public datasets used in MemoryBench evaluation</p>
          </div>
          <div className="dataset-grid">
            {datasets.map(ds => (
              <div key={ds.name} className="dataset-card">
                <div className="dataset-header">
                  <h3 className="dataset-name">{ds.name}</h3>
                  <div className="dataset-meta">
                    <span className={`domain-tag domain-${ds.domain.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ds.domain}
                    </span>
                    <span className="lang-tag">{ds.language === 'EN' ? 'EN' : ds.language === 'EN/ZH' ? 'EN/CN' : 'CN'}</span>
                  </div>
                </div>
                <div className="dataset-info">
                  <div className="info-row">
                    <span className="info-label">Task Type:</span>
                    <span className="info-value">{ds.taskType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Metric:</span>
                    <span className="info-value">{ds.metric}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Authors:</span>
                    <span className="info-value">{ds.authors}</span>
                  </div>
                </div>
                <p className="dataset-desc">{ds.description}</p>
                <ExternalLink href={ds.link} className="dataset-link">
                  <span>View Paper</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </ExternalLink>
              </div>
            ))}
          </div>
        </section>

        {/* Models */}
        <section className="resource-section">
          <div className="section-header">
            <h2 className="section-title">Evaluated Large Language Models</h2>
          </div>
          <div className="models-grid">
            {backboneModels.map(m => (
              <div key={m.name} className="model-card">
                <div className="model-header">
                  <h3 className="model-name">{m.name}</h3>
                  <span className="param-badge">{m.parameters}</span>
                </div>
                <div className="model-info">
                  <div className="info-row">
                    <span className="info-label">Usage:</span>
                    <span className="info-value">{m.usage}</span>
                  </div>
                </div>
                <p className="model-desc">{m.description}</p>
                <ExternalLink href={m.link} className="model-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>HuggingFace</span>
                </ExternalLink>
              </div>
            ))}
          </div>
        </section>

        {/* Memory Systems */}
        <section className="resource-section">
          <div className="section-header">
            <h2 className="section-title">Memory Systems</h2>
          </div>

          {/* No-Memory Baseline */}
          <div className="memory-subsection">
            <h3 className="subsection-title">No-Memory Baseline</h3>
            <div className="baseline-card">
              <div className="baseline-header">
                <h4 className="baseline-name">{memorySystems.noMemory.name}</h4>
              </div>
              <p className="baseline-desc">{memorySystems.noMemory.description}</p>
            </div>
          </div>

          {/* RAG Systems */}
          <div className="memory-subsection">
            <h3 className="subsection-title">Retrieval-Augmented Generation (RAG) Systems</h3>
            <div className="table-container">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>System Name</th>
                    <th>Retrieval Algorithm</th>
                    <th>Storage Granularity</th>
                  </tr>
                </thead>
                <tbody>
                  {memorySystems.rag.map(sys => (
                    <tr key={sys.name}>
                      <td className="name-col"><strong>{sys.name}</strong></td>
                      <td>{sys.algorithm}</td>
                      <td>{sys.granularity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOTA Memory Systems */}
          <div className="memory-subsection">
            <h3 className="subsection-title">State-of-the-Art Memory Systems</h3>
            <div className="sota-grid">
              {memorySystems.sota.map(sys => (
                <div key={sys.name} className="sota-card">
                  <div className="sota-header">
                    <h4 className="sota-name">{sys.name}</h4>
                    <span className="sota-fullname">{sys.fullName}</span>
                  </div>
                  <div className="sota-info">
                    <div className="info-row">
                      <span className="info-label">Authors:</span>
                      <span className="info-value">{sys.authors}</span>
                    </div>
                  </div>
                  <p className="sota-desc">{sys.description}</p>
                  <ExternalLink href={sys.link} className="sota-link">
                    <span>View Paper</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </ExternalLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="resource-section summary-section">
          <div className="section-header">
            <h2 className="section-title">Quick Summary</h2>
          </div>
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-number">11</span>
              <span className="summary-label">Datasets</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">4</span>
              <span className="summary-label">LLMs</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">8</span>
              <span className="summary-label">Memory Systems</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}