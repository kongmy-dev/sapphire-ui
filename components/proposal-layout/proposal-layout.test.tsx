import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './proposal-layout.examples.js';
import {
  ProposalHero,
  type ProposalHeroProps,
  ProposalLayout,
  type ProposalLayoutProps,
  ProposalSection,
  type ProposalSectionProps,
} from './proposal-layout.js';

it('preserves semantic document structure, native refs and optional slots', () => {
  const layout = createRef<HTMLDivElement>();
  const hero = createRef<HTMLDivElement>();
  const section = createRef<HTMLElement>();
  const root = {
    brandName: 'Consultancy',
    children: null,
  } satisfies ProposalLayoutProps;
  const heading = {
    title: 'Proposal',
    metaRows: [],
  } satisfies ProposalHeroProps;
  const body = {
    title: 'Scope',
    children: 'Delivery',
  } satisfies ProposalSectionProps;
  render(
    <ProposalLayout {...root} ref={layout} className="custom">
      <ProposalHero {...heading} ref={hero} className="hero" />
      <ProposalSection
        {...body}
        ref={section}
        className="section"
        aria-label="Scope section"
      />
    </ProposalLayout>,
  );
  expect(layout.current?.className).toBe('sp-proposal-layout custom');
  expect(hero.current?.className).toBe('sp-document-hero hero');
  expect(section.current).toBe(
    screen.getByRole('region', { name: 'Scope section' }),
  );
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Proposal',
  );
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Scope');
});

for (const { name, render: Example } of examples)
  it(`renders ${name} proposal`, () => {
    render(<Example />);
    expect(screen.getAllByRole('heading')).toHaveLength(2);
    if (name === 'complete') {
      expect(screen.getByRole('term').textContent).toBe('Prepared for');
      expect(screen.getByRole('definition').textContent).toBe('Platform team');
    }
  });
