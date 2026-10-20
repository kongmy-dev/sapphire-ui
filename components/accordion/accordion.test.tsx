import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef } from 'react';
import { examples } from './accordion.examples.js';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion.js';

test('associates triggers and panels while preserving refs and inner content classes', async () => {
  const root = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLButtonElement>();
  const content = createRef<HTMLDivElement>();
  render(
    <Accordion ref={root} type="single" collapsible className="custom">
      <AccordionItem ref={item} value="first" className="custom-item">
        <AccordionTrigger ref={trigger} className="custom-trigger">
          Question
        </AccordionTrigger>
        <AccordionContent ref={content} className="custom-body">
          Answer
        </AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
  const button = screen.getByRole('button', { name: 'Question' });
  expect<HTMLElement | null>(trigger.current).toBe(button);
  expect(root.current?.className).toBe('sp-accordion custom');
  expect(item.current?.className).toBe('sp-accordion-item custom-item');
  expect(button.className).toBe('sp-accordion-trigger custom-trigger');
  await userEvent.click(button);
  const panel = screen.getByRole('region', { name: 'Question' });
  expect<HTMLElement | null>(content.current).toBe(panel);
  expect(button.getAttribute('aria-controls')).toBe(panel.id);
  expect(panel.firstElementChild?.className).toBe(
    'sp-accordion-body custom-body',
  );
  await userEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('false');
});

for (const example of examples) {
  test(`example ${example.name} supports keyboard movement and expansion`, async () => {
    render(createElement(example.render));
    const buttons = screen.getAllByRole('button');
    const first = buttons[0];
    const second = buttons[1];
    if (first === undefined || second === undefined)
      throw new Error('Example needs two disclosures');
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(second);
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(second);
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(first);
    const previous = first.getAttribute('aria-expanded');
    await userEvent.keyboard('{Enter}');
    expect(first.getAttribute('aria-expanded')).not.toBe(previous);
    await userEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    if (example.name === 'questions') {
      const disabled = screen.getByRole('button', {
        name: 'Unavailable question',
      });
      await userEvent.click(disabled);
      expect(disabled.getAttribute('aria-expanded')).toBe('false');
    }
  });
}
