import { expect, it, mock } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './tabs.examples.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.js';

it('links tabs and focusable panels and preserves native refs and classes', async () => {
  const root = createRef<HTMLDivElement>();
  const list = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLButtonElement>();
  const content = createRef<HTMLDivElement>();
  render(
    <Tabs ref={root} className="root" defaultValue="one">
      <TabsList
        ref={list}
        className="list"
        variant="dashboard"
        aria-label="Sections"
      >
        <TabsTrigger ref={trigger} className="trigger" value="one">
          One
        </TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three" disabled>
          Three
        </TabsTrigger>
      </TabsList>
      <TabsContent ref={content} className="content" value="one">
        First panel
      </TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>,
  );
  const tab = screen.getByRole('tab', { name: 'One' });
  const panel = screen.getByRole('tabpanel', { name: 'One' });
  expect(root.current?.className).toBe('sp-tabs root');
  expect(list.current?.className).toBe('sp-tabs-list list');
  expect(trigger.current).toBe(tab);
  expect(content.current).toBe(panel);
  expect(panel.className).toBe('sp-tabs-content content');
  expect(panel.id).toBe(tab.getAttribute('aria-controls'));
  expect(panel.tabIndex).toBe(0);
  await userEvent.click(tab);
  await userEvent.tab();
  expect(document.activeElement).toBe(panel);
  await userEvent.click(screen.getByRole('tab', { name: 'Three' }));
  expect(tab.getAttribute('aria-selected')).toBe('true');
  await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
  expect(screen.getByRole('tabpanel', { name: 'Two' }).textContent).toBe(
    'Second panel',
  );
});

it('honors controlled selection rather than switching without consumer updates', async () => {
  const change = mock();
  render(
    <Tabs value="one" onValueChange={change}>
      <TabsList aria-label="Controlled">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First</TabsContent>
      <TabsContent value="two">Second</TabsContent>
    </Tabs>,
  );
  await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
  expect(change).toHaveBeenCalledWith('two');
  expect(
    screen.getByRole('tab', { name: 'One' }).getAttribute('aria-selected'),
  ).toBe('true');
});

for (const { name, render: Example } of examples) {
  it(`operates ${name} by keyboard`, async () => {
    render(<Example />);
    const tabs = screen.getAllByRole('tab');
    const first = tabs[0];
    const second = tabs[1];
    if (!first || !second) throw new Error('Expected two tabs');
    await userEvent.click(first);
    const key = name === 'controlled' ? 'ArrowDown' : 'ArrowRight';
    await userEvent.keyboard(`{${key}>}`);
    await waitFor(() => expect(document.activeElement).toBe(second));
    await userEvent.keyboard(`{/${key}}`);
    if (name === 'controlled') {
      expect(first.getAttribute('aria-selected')).toBe('true');
      await userEvent.keyboard('{Enter}');
    }
    expect(second.getAttribute('aria-selected')).toBe('true');
    await userEvent.tab();
    expect(document.activeElement?.getAttribute('role')).toBe('tabpanel');
  });
}
