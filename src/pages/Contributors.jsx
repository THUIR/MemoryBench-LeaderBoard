import './Contributors.css';

const contributors = [
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    isPI: true,
    role: 'Project Lead',
    description: 'Lead of the MemoryBench project',
  },
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    role: 'Core Developer',
    description: 'Primary development and architecture',
  },
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    role: 'Data Lead',
    description: 'Dataset curation and processing',
  },
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    role: 'Evaluation Lead',
    description: 'Metrics design and evaluation pipeline',
  },
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    role: 'Paper Lead',
    description: 'Paper writing and submission',
  },
  {
    name: 'To Be Confirmed',
    affiliation: 'To Be Confirmed',
    role: 'Frontend Developer',
    description: 'Web interface design and implementation',
  },
];

function ContributorCard({ contributor, index }) {
  return (
    <div className="contributor-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="contributor-avatar">
        <span className="avatar-placeholder">{contributor.name[0]}</span>
      </div>
      <div className="contributor-info">
        <h3 className="contributor-name">{contributor.name}</h3>
        <p className="contributor-affiliation">{contributor.affiliation}</p>
        {contributor.isPI && <span className="contributor-role pi-badge">PI</span>}
        {!contributor.isPI && <span className="contributor-role">{contributor.role}</span>}
        <p className="contributor-desc">{contributor.description}</p>
      </div>
    </div>
  );
}

export default function Contributors() {
  return (
    <div className="contributors-page">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Contributors</h1>
          <p className="page-subtitle">The team behind MemoryBench</p>
        </div>

        {/* Core Team */}
        <section className="contributors-section">
          <div className="section-header">
            <h2 className="section-title">Core Team</h2>
            <p className="section-subtitle">Main contributors to the MemoryBench project</p>
          </div>
          <div className="contributors-grid">
            {contributors.map((contributor, index) => (
              <ContributorCard key={index} contributor={contributor} index={index} />
            ))}
          </div>
        </section>

        {/* Acknowledgments */}
        <section className="contributors-section acknowledgment-section">
          <div className="section-header">
            <h2 className="section-title">Acknowledgments</h2>
          </div>
          <p className="acknowledgment-text">We thank all the researchers and developers who contributed to the datasets and memory systems that make MemoryBench possible.<br/>
Special thanks to the open-source community for their invaluable contributions to the field of memory and continual learning in LLM systems.</p>
        </section>

        {/* Contact */}
        <section className="contributors-section contact-section">
          <div className="section-header">
            <h2 className="section-title">Contact</h2>
          </div>
          <div className="contact-card">
            <p className="contact-text">
              For questions or collaboration inquiries, please reach out via our GitHub repository or contact the team lead.
            </p>
            <div className="contact-links">
              <a
                href="https://github.com/THUIR/MemoryBench"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://arxiv.org/abs/2510.17281"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h7v1.5h-7V13zm0 3h7v1.5h-7V16zm0-6h3v1.5h-3V10z"/>
                </svg>
                Paper
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}