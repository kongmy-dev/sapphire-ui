'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion/accordion.js';
import { Button } from '../button/button.js';
import { Callout } from '../callout/callout.js';
import { Card, CardBody, CardFooter, CardHeader } from '../card/card.js';
import { Checkbox } from '../checkbox/checkbox.js';
import { FormField } from '../form-field/form-field.js';
import { Input } from '../input/input.js';
import { NativeSelect } from '../native-select/native-select.js';
import { PageSection } from '../page-section/page-section.js';
import { TableOfContents } from '../table-of-contents/table-of-contents.js';
import { Toggle } from '../toggle/toggle.js';
import { Layout } from './layout.js';

function LayoutSimple() {
  return (
    <Layout
      className="docs-layout-demo"
      header={<header>Workspace header</header>}
      footer={<footer>Workspace footer</footer>}
    >
      <h2>Overview</h2>
      <p>Page content belongs in the main landmark.</p>
    </Layout>
  );
}
function LayoutSidebar() {
  return (
    <Layout
      className="docs-layout-demo"
      sidebar={
        <aside className="sp-layout-sidebar docs-layout-sidebar">
          Workspace navigation
        </aside>
      }
    >
      <h2>Workspace</h2>
      <p>The rail and content share the remaining width.</p>
    </Layout>
  );
}
function LayoutSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <Layout className="docs-layout-demo">
      <PageSection
        heading="Workspace settings"
        subheading="Manage the details your team sees every day."
      >
        <form
          className="sp-stack"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <Card>
            <CardHeader>
              <h3>General</h3>
              <p>Keep your workspace recognizable.</p>
            </CardHeader>
            <CardBody className="sp-stack">
              <FormField
                label="Workspace name"
                hint="Shown in navigation and invitations."
              >
                <Input defaultValue="Sapphire Studio" />
              </FormField>
              <FormField label="Default language">
                <NativeSelect defaultValue="en">
                  <option value="en">English</option>
                  <option value="ms">Bahasa Melayu</option>
                </NativeSelect>
              </FormField>
              <Checkbox
                label="Send a weekly activity summary"
                description="One email with the changes that matter."
                defaultChecked
              />
            </CardBody>
            <CardFooter>
              <Button type="submit">Save changes</Button>
              <Button type="reset" variant="outline">
                Reset
              </Button>
            </CardFooter>
          </Card>
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger>
                Advanced notification and delivery preferences
              </AccordionTrigger>
              <AccordionContent>
                <Checkbox label="Include detailed audit events" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <output>
            {saved ? 'Settings saved' : 'Your changes stay in this preview.'}
          </output>
        </form>
      </PageSection>
    </Layout>
  );
}
function LayoutReading() {
  return (
    <Layout className="docs-layout-demo">
      <PageSection
        label="Field notes"
        heading="A quieter interface"
        subheading="Small decisions that help people read, act and move on."
      >
        <div className="sp-stack">
          <TableOfContents
            items={[
              {
                id: 'reading-rhythm',
                title: 'Build a steady rhythm',
                level: 2,
              },
              { id: 'reading-actions', title: 'Make actions clear', level: 2 },
            ]}
          />
          <article className="sp-prose">
            <h2 id="reading-rhythm">Build a steady rhythm</h2>
            <p>
              Related information belongs together. A consistent inset helps
              readers recognize a group without adding another border or
              heading.
            </p>
            <p>
              Give longer passages room to breathe. Compact controls can sit
              beside generous reading space when each serves a clear purpose.
            </p>
            <ul>
              <li>Align labels and controls.</li>
              <li>Use spacing to show relationships.</li>
              <li>Keep the next action easy to find.</li>
            </ul>
            <h2 id="reading-actions">Make actions clear</h2>
            <p>
              A useful interface makes the ordinary action obvious and the
              destructive action deliberate.{' '}
              <a href="#reading-rhythm">Review the rhythm</a> before adding more
              decoration.
            </p>
          </article>
          <Callout title="Keep the signal">
            Density should remove wasted space while preserving legibility,
            focus and comfortable touch targets.
          </Callout>
          <div className="sp-cluster">
            <Toggle aria-label="Like this article" variant="outline">
              Like
            </Toggle>
            <Button variant="ghost" asChild>
              <a href="#reading-rhythm">Back to the article</a>
            </Button>
          </div>
        </div>
      </PageSection>
    </Layout>
  );
}
export const examples = [
  { name: 'simple', render: LayoutSimple },
  { name: 'sidebar', render: LayoutSidebar },
  { name: 'settings', render: LayoutSettings },
  { name: 'reading', render: LayoutReading },
] as const;
