function ProseArticle() {
  return (
    <article className="sp-prose">
      <h2>Design for clarity</h2>
      <p>Start with a clear goal.</p>
      <p>
        Then explain the <a href="#principles">principles</a>.
      </p>
      <ul>
        <li>Use familiar words.</li>
        <li>Keep navigation predictable.</li>
      </ul>
      <ol>
        <li>Explore the problem.</li>
        <li>Validate the solution.</li>
      </ol>
      <blockquote>Make every detail earn its place.</blockquote>
      <pre>
        <code>const clarity = true;</code>
      </pre>
    </article>
  );
}

export const examples = [{ name: 'article', render: ProseArticle }] as const;
