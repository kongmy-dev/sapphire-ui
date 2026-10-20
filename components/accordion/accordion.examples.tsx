'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion.js';

function AccordionQuestions() {
  return (
    <Accordion type="single" collapsible defaultValue="accessibility">
      <AccordionItem value="accessibility">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Keyboard navigation and screen reader associations are built in.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="styling">
        <AccordionTrigger>Can I customize it?</AccordionTrigger>
        <AccordionContent>
          Use the shared tokens and component classes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="unavailable" disabled>
        <AccordionTrigger>Unavailable question</AccordionTrigger>
        <AccordionContent>This answer is unavailable.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AccordionMultiple() {
  const [value, setValue] = useState<string[]>(['billing']);
  return (
    <Accordion type="multiple" value={value} onValueChange={setValue}>
      <AccordionItem value="billing">
        <AccordionTrigger>Billing details</AccordionTrigger>
        <AccordionContent>
          Manage invoices and payment preferences.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger>Team details</AccordionTrigger>
        <AccordionContent>Manage workspace members.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const examples = [
  { name: 'questions', render: AccordionQuestions },
  { name: 'multiple', render: AccordionMultiple },
] as const;
