function DocumentProposal() {
  return (
    <article>
      <div className="sp-document-bar">
        <span className="sp-document-mark">S</span>
        <span className="sp-document-wordmark">Sapphire</span>
        <span className="sp-document-bar-meta">Revision 1.0</span>
      </div>
      <div className="sp-document-shell">
        <header className="sp-document-hero">
          <div className="sp-document-eyebrow">Proposal</div>
          <h1>Cloud migration</h1>
          <p className="sp-document-lede">
            A phased delivery with clear milestones.
          </p>
        </header>
        <section
          className="sp-document-section"
          aria-labelledby="proposal-scope"
        >
          <span className="sp-document-section-number">01</span>
          <h2 id="proposal-scope">Scope</h2>
          <p>Assess the platform and plan the migration.</p>
          <a href="#approval">Review approval</a>
        </section>
        <footer className="sp-document-foot">
          Prepared for the platform team.
        </footer>
      </div>
    </article>
  );
}

export const examples = [
  { name: 'proposal', render: DocumentProposal },
] as const;
