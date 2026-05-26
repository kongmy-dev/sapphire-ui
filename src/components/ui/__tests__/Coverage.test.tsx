import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { IconMark } from '../IconMark';
import { MobileNav } from '../MobileNav';
import { PassphraseGate } from '../PassphraseGate';
import { ProposalLayout, ProposalHero, ProposalSection } from '../ProposalLayout';
import { SEOHead, generateSEOTags } from '../SEOHead';
import { ThemeToggle } from '../ThemeToggle';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '../DropdownMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../Sheet';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '../Pagination';
import { Steps } from '../Steps';
import { Sparkline } from '../Sparkline';
import { Icon } from '../Icon';
import userEvent from '@testing-library/user-event';

describe('Coverage Smoke Tests', () => {
  it('renders IconMark', () => {
    render(<IconMark size="md" color="var(--color-primary)" />);
  });

  it('renders MobileNav', () => {
    render(
      <MobileNav 
        brandName="Brand"
        navItems={[{ href: '/', label: 'Home' }]}
      />
    );
  });

  it('renders PassphraseGate', () => {
    render(
      <PassphraseGate isHidden={false} brandMark={<div>Mark</div>} brandName="Brand" title="Title" documentTitle="Doc" description="Desc">
        <div>Content</div>
      </PassphraseGate>
    );
  });

  it('renders ProposalLayout components', () => {
    render(
      <ProposalLayout brandMark={<div>M</div>} brandName="N" breadcrumbs={<span>Crumb</span>} metadata={<span>Meta</span>}>
        <ProposalHero eyebrow="Eyebrow" title="Hero Title" lede="Lede" metaRows={[{label: 'L', value: 'V'}]} />
        <ProposalSection sectionNo="1" title="Section 1" lede="Lede">
          <p>Content</p>
        </ProposalSection>
      </ProposalLayout>
    );
  });

  it('renders SEOHead', () => {
    render(
      <SEOHead 
        title="Test" 
        description="Desc" 
        canonical="https://example.com"
        ogImage="img.png"
        twitterCard="summary_large_image"
        noindex={true}
        author="Kongmy"
        publishedTime="2023-01-01"
        twitterSite="@kongmy"
        keywords={['a', 'b']}
        jsonLd={{ "@context": "http://schema.org" }}
      />
    );
  });

  it('generates SEO tags', () => {
    generateSEOTags({
      title: 'Test & "Escape" <tag>',
      description: 'Desc',
      url: 'https://example.com',
      image: 'img.png',
      twitterCard: 'summary_large_image',
      author: 'Kongmy',
      publishedTime: '2023-01-01',
      twitterSite: '@kongmy',
      keywords: ['a', 'b'],
      jsonLd: { "@context": "http://schema.org" }
    });
  });

  it('renders ThemeToggle and clicks it', async () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
  });

  it('renders DropdownMenu', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>L</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={true} onCheckedChange={() => {}}>Check</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="1">
              <DropdownMenuRadioItem value="1">Radio</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  });

  it('renders Sheet', () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  });

  it('renders Pagination', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  });

  it('renders Steps', () => {
    render(
      <Steps 
        current={1} 
        steps={[{ label: 'Step 1' }, { label: 'Step 2' }]} 
      />
    );
  });

  it('renders Sparkline', () => {
    render(<Sparkline data={[1, 2, 3]} />);
  });

  it('renders Icon', () => {
    render(<Icon name="bolt" />);
  });
});
