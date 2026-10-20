function KeyValueDetails() {
  return (
    <dl className="sp-key-value-list">
      <dt>Client</dt>
      <dd>Acme Holdings</dd>
      <dt>Engagement</dt>
      <dd>Cloud migration</dd>
      <dt>Owner</dt>
      <dd>
        <a href="#platform-team">Platform team</a>
      </dd>
    </dl>
  );
}

export const examples = [{ name: 'details', render: KeyValueDetails }] as const;
