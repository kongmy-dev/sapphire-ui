import { expect, test } from 'bun:test';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { examples } from './admin-layout.examples.js';

function workspace(name: (typeof examples)[number]['name']) {
  const example = examples.find((entry) => entry.name === name);
  if (!example) throw new Error(`Missing ${name} example`);
  const Example = example.render;
  return render(<Example />);
}

function projectRows() {
  return within(screen.getByRole('table', { name: 'Projects' }))
    .getAllByRole('row')
    .slice(1);
}

test('overview navigates to project records, archived library and back home', async () => {
  workspace('workspace');
  expect(
    screen.getByRole('heading', { level: 1, name: 'Workspace overview' }),
  ).not.toBeNull();
  expect(projectRows()).toHaveLength(4);
  await userEvent.click(
    screen.getByRole('button', { name: 'View all projects' }),
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Projects' }),
  ).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Library' }));
  await userEvent.click(
    screen.getByRole('link', { name: 'Archived projects' }),
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Archived projects' }),
  ).not.toBeNull();
  expect(projectRows()).toHaveLength(1);
  expect(screen.getByRole('row', { name: /Member directory/ })).not.toBeNull();
  await userEvent.click(screen.getByRole('link', { name: 'All projects' }));
  expect(screen.getByRole('status').textContent).toContain('6 projects');
  await userEvent.click(screen.getByRole('link', { name: 'Overview' }));
  expect(
    screen.getByRole('heading', { name: 'Workspace overview' }),
  ).not.toBeNull();
});

test('new projects reject whitespace, cancel cleanly and update the collection and badge', async () => {
  workspace('workspace');
  const trigger = screen.getByRole('button', { name: 'New project' });
  await userEvent.click(trigger);
  const input = screen.getByRole('textbox', { name: 'Project name' });
  await userEvent.type(input, '   ');
  await userEvent.click(screen.getByRole('button', { name: 'Create project' }));
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByText('Enter a project name.')).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  await userEvent.click(trigger);
  const reopened = screen.getByRole('textbox', { name: 'Project name' });
  expect(reopened.getAttribute('value')).toBe('');
  expect(reopened.hasAttribute('aria-invalid')).toBe(false);
  await userEvent.type(reopened, '  Supplier portal  ');
  await userEvent.click(screen.getByRole('button', { name: 'Create project' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(
    screen.getByRole('heading', { level: 1, name: 'Projects' }),
  ).not.toBeNull();
  expect(projectRows()[0]?.textContent).toContain(
    'Supplier portalYour workspace',
  );
  expect(screen.getByRole('status').textContent).toContain('7 projects');
  expect(screen.getByRole('link', { name: 'Projects 7' })).not.toBeNull();
});

test('project search and status filters reset pagination and can be cleared from an empty result', async () => {
  workspace('records');
  const search = screen.getByRole('searchbox', { name: 'Search projects' });
  const status = screen.getByRole('combobox', { name: 'Project status' });
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('status').textContent).toContain('Page 2 of 2');
  expect(projectRows()).toHaveLength(2);
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(screen.getByRole('status').textContent).toContain('Page 1 of 2');
  expect(
    screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled'),
  ).toBe(true);
  await userEvent.type(search, 'NORTHSTAR');
  expect(projectRows()).toHaveLength(2);
  expect(screen.getByRole('status').textContent).toContain(
    '2 projects · Page 1 of 1',
  );
  await userEvent.selectOptions(status, 'Review');
  expect(
    screen.getByRole('heading', { name: 'No projects found' }),
  ).not.toBeNull();
  expect(screen.queryByRole('table')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(search.getAttribute('value')).toBe('');
  expect(projectRows()).toHaveLength(4);
  await userEvent.selectOptions(status, 'Review');
  expect(projectRows()).toHaveLength(2);
  expect(
    screen.getByRole('row', { name: /Operations dashboard/ }),
  ).not.toBeNull();
  expect(
    screen.getByRole('row', { name: /Billing integration/ }),
  ).not.toBeNull();
});

test('settings validate the workspace and clear confirmation after every kind of edit', async () => {
  workspace('settings');
  const input = screen.getByRole('textbox', { name: 'Workspace name' });
  const save = screen.getByRole('button', { name: 'Save changes' });
  await userEvent.clear(input);
  await userEvent.type(input, '  ');
  await userEvent.click(save);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByText('Enter a workspace name.')).not.toBeNull();
  expect(screen.getByRole('status').textContent).toBe('');
  fireEvent.change(input, { target: { value: 'Sapphire Operations' } });
  await userEvent.click(save);
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  expect(screen.getByRole('status').textContent).toBe(
    'Workspace settings saved.',
  );
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Timezone' }),
    'Europe/London',
  );
  expect(screen.getByRole('status').textContent).toBe('');
  await userEvent.click(save);
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Weekly project summary' }),
  );
  expect(screen.getByRole('status').textContent).toBe('');
  await userEvent.click(save);
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Project review requests' }),
  );
  expect(screen.getByRole('status').textContent).toBe('');
  await userEvent.click(save);
  await userEvent.type(input, ' team');
  expect(screen.getByRole('status').textContent).toBe('');
});

test('compact and expanded navigation both reach settings through account actions', async () => {
  workspace('collapsed');
  await userEvent.click(
    screen.getByRole('button', { name: /Aisha Rahman.*account/ }),
  );
  await userEvent.click(
    screen.getByRole('menuitem', { name: 'Workspace settings' }),
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Workspace settings' }),
  ).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
  await userEvent.click(screen.getByRole('link', { name: 'Projects 6' }));
  await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
  expect(
    screen.getByRole('heading', { level: 1, name: 'Workspace settings' }),
  ).not.toBeNull();
  await userEvent.click(
    screen.getByRole('button', { name: /Aisha Rahman.*account/ }),
  );
  await userEvent.click(
    screen.getByRole('menuitem', { name: 'Workspace settings' }),
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Workspace settings' }),
  ).not.toBeNull();
});

test('multiple workspace examples keep separate help destinations', () => {
  workspace('workspace');
  workspace('records');
  const targets = screen
    .getAllByRole('link', { name: 'Help' })
    .map((link) => link.getAttribute('href'));
  expect(new Set(targets).size).toBe(2);
  for (const target of targets) {
    if (!target) throw new Error('Help link missing its destination');
    expect(document.getElementById(target.slice(1))?.textContent).toContain(
      'Contact your workspace administrator.',
    );
  }
});
