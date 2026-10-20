import { expect, it } from 'bun:test';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { examples } from './vertical-tabs-layout.examples.js';

for (const { name, render: Example } of examples)
  it(`navigates ${name} with vertical arrows and focuses panel content`, async () => {
    render(
      <>
        <style>{'[hidden] { display: none; }'}</style>
        <Example />
      </>,
    );
    const profile = screen.getByRole('tab', { name: 'Profile' });
    act(() => profile.focus());
    await userEvent.keyboard('{ArrowDown}');
    const security = screen.getByRole('tab', { name: 'Security' });
    await waitFor(() => expect(document.activeElement).toBe(security));
    expect(security.getAttribute('aria-selected')).toBe('true');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(document.activeElement).toBe(profile));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(document.activeElement).toBe(security));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('tabpanel'));
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'Review security' }),
    );
    act(() => security.focus());
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(document.activeElement).toBe(profile));
  });
