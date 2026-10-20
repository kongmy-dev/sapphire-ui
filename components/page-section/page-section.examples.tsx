import { PageSection } from './page-section.js';

function PageSectionHeading() {
  return (
    <PageSection
      label="Our approach"
      heading="Built for clarity"
      subheading="Shared foundations for coherent experiences."
      maxWidth="lg"
    >
      <p>Compose content with a consistent section heading.</p>
    </PageSection>
  );
}
function PageSectionPlain() {
  return (
    <PageSection maxWidth="sm">
      <p>A section can contain content without a heading.</p>
    </PageSection>
  );
}
export const examples = [
  { name: 'heading', render: PageSectionHeading },
  { name: 'plain', render: PageSectionPlain },
] as const;
