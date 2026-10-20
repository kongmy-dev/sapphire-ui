import {
  ProposalHero,
  ProposalLayout,
  ProposalSection,
} from './proposal-layout.js';

function ProposalComplete() {
  return (
    <ProposalLayout
      brandMark="S"
      brandName="Sapphire"
      breadcrumbs="Cloud migration"
      metadata="Revision 1.0"
    >
      <ProposalHero
        eyebrow="Proposal"
        title="Cloud migration"
        lede="A phased transition with clear milestones."
        metaRows={[{ label: 'Prepared for', value: 'Platform team' }]}
      />
      <ProposalSection
        sectionNo="01"
        title="Scope"
        lede="A measured approach to delivery."
      >
        <p>Assess the platform and plan the migration.</p>
        <a href="#proposal-approval">Review proposal</a>
      </ProposalSection>
    </ProposalLayout>
  );
}

function ProposalMinimal() {
  return (
    <ProposalLayout>
      <ProposalHero title="Delivery plan" />
      <ProposalSection title="Milestones">
        <p>Discovery, design, delivery.</p>
      </ProposalSection>
    </ProposalLayout>
  );
}

export const examples = [
  { name: 'complete', render: ProposalComplete },
  { name: 'minimal', render: ProposalMinimal },
] as const;
