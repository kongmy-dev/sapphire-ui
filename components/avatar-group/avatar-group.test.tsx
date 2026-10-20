import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Avatar } from '../avatar/avatar.js';
import { examples } from './avatar-group.examples.js';
import { AvatarGroup } from './avatar-group.js';

it('limits avatars, shows the overflow count, preserves refs and child styles', async () => {
  const ref = createRef<HTMLDivElement>();
  const child = createRef<HTMLSpanElement>();
  render(
    <AvatarGroup
      ref={ref}
      className="custom"
      aria-label="Team members"
      max={2}
      spacing={12}
    >
      <Avatar ref={child} fallback="AB" style={{ opacity: 0.7 }} />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
      ignored text
    </AvatarGroup>,
  );
  expect(ref.current).toBe(screen.getByRole('group', { name: 'Team members' }));
  expect(screen.getByRole('img', { name: '1 more people' })).not.toBeNull();
  expect(ref.current?.className).toBe('sp-avatar-group custom');
  expect(child.current?.style.opacity).toBe('0.7');
  expect(child.current?.style.marginInlineStart).toBe('0');
  await screen.findByText('+1');
  expect(screen.queryByText('EF')).toBeNull();
  expect(ref.current?.children[1]?.getAttribute('style')).toContain(
    'margin-inline-start: -12px',
  );
});

for (const max of [undefined, Number.NaN, Infinity, -1, 0, 1.9, 10]) {
  it(`normalizes avatar cap ${String(max)}`, () => {
    const { container } = render(
      <AvatarGroup max={max}>
        <Avatar fallback="A" />
        <Avatar fallback="B" />
        <Avatar fallback="C" />
      </AvatarGroup>,
    );
    const expected =
      max === undefined || !Number.isFinite(max) || max >= 3
        ? 3
        : Math.max(0, Math.floor(max)) + 1;
    expect(container.querySelectorAll('.sp-avatar').length).toBe(expected);
  });
}

for (const { name, render: Example } of examples) {
  it(`renders ${name}`, async () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-avatar-group')).not.toBeNull();
    await screen.findByText('AB');
  });
}
