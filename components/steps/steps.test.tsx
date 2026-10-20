import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './steps.examples.js';
import { Steps, type StepsProps } from './steps.js';

it('exposes ordered progress and current step while preserving ref and props', () => {
  const ref = createRef<HTMLElement>();
  render(
    <Steps
      ref={ref}
      className="custom"
      steps={[
        { label: 'Start' },
        { label: 'Continue', description: 'Invite collaborators' },
        { label: 'Finish' },
      ]}
      current={1}
    />,
  );
  expect(ref.current).toBe(
    screen.getByRole('navigation', { name: 'Progress' }),
  );
  expect(ref.current?.className).toBe('sp-steps custom');
  const items = screen.getAllByRole('listitem');
  expect(items.map((item) => item.getAttribute('aria-current'))).toEqual([
    null,
    'step',
    null,
  ]);
  expect(screen.getByText('Invite collaborators')).not.toBeNull();
});

it('calls custom indicators with each status and omits compact descriptions', () => {
  const renderIndicator = mock((index: number, state: string) => (
    <span>
      {state} {index}
    </span>
  ));
  const props = {
    steps: [
      { label: 'One', description: 'Hidden details' },
      { label: 'Two' },
      { label: 'Three' },
    ],
    current: 1,
    variant: 'compact',
    renderIndicator,
  } satisfies StepsProps;
  render(<Steps {...props} />);
  expect(renderIndicator.mock.calls).toEqual([
    [0, 'done'],
    [1, 'active'],
    [2, 'upcoming'],
  ]);
  expect(screen.queryByText('Hidden details')).toBeNull();
});

for (const { name, render: Example } of examples)
  it(`renders ${name} progress`, () => {
    render(<Example />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('navigation').querySelector('[aria-current="step"]')
        ?.textContent,
    ).toContain(name === 'progress' ? 'Accounts' : 'Projects');
  });
