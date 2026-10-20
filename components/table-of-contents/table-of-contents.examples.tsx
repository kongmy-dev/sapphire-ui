import { TableOfContents, type TocItem } from './table-of-contents.js';

function TocSections() {
  const items = [
    { id: 'overview', title: 'Overview', level: 2 },
    {
      id: 'requirements',
      title:
        'Requirements and implementation considerations for a successful delivery across distributed teams and services',
      level: 3,
    },
    { id: 'delivery', title: 'Delivery', level: 2 },
  ] satisfies TocItem[];
  return <TableOfContents items={items} activeId="overview" />;
}

function TocCustom() {
  return (
    <TableOfContents
      title="Proposal sections"
      aria-label="Proposal contents"
      items={[
        { id: 'scope', title: 'Scope', level: 2 },
        { id: 'cost', title: 'Cost', level: 3 },
      ]}
    />
  );
}

export const examples = [
  { name: 'sections', render: TocSections },
  { name: 'custom', render: TocCustom },
] as const;
