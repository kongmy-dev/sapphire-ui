import { expect, it, mock } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './wizard-layout.examples.js';
import { WizardLayout, type WizardLayoutProps } from './wizard-layout.js';

const steps = [{ label: 'One' }, { label: 'Two' }];

it('preserves native props/ref and disabled actions across first and last steps', async () => {
  const ref = createRef<HTMLDivElement>();
  const next = mock();
  const previous = mock();
  const finish = mock();
  const props = {
    steps,
    currentStep: 0,
    children: 'Body',
  } satisfies WizardLayoutProps;
  const { rerender } = render(
    <WizardLayout
      {...props}
      id="wizard"
      ref={ref}
      className="custom"
      onNext={next}
      isNextDisabled
    />,
  );
  expect(ref.current?.id).toBe('wizard');
  expect(ref.current?.className).toBe('sp-wizard-layout custom');
  expect(
    screen.getByRole('button', { name: 'Back' }).hasAttribute('disabled'),
  ).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(next).not.toHaveBeenCalled();
  rerender(
    <WizardLayout
      steps={steps}
      currentStep={1}
      onPrev={previous}
      onFinish={finish}
      prevLabel="Previous"
      finishLabel="Done"
      isFinishDisabled
    >
      Body
    </WizardLayout>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(previous).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(finish).not.toHaveBeenCalled();
});

it('renders fullscreen mode and names modal fallback content', () => {
  const { rerender } = render(
    <WizardLayout mode="fullscreen" steps={steps} currentStep={0}>
      Fullscreen body
    </WizardLayout>,
  );
  expect(
    screen
      .getByText('Fullscreen body')
      .closest('[data-mode]')
      ?.getAttribute('data-mode'),
  ).toBe('fullscreen');
  rerender(
    <WizardLayout mode="modal" isOpen steps={steps} currentStep={0}>
      Modal body
    </WizardLayout>,
  );
  expect(
    screen
      .getByRole('dialog', { name: 'Wizard Modal' })
      .getAttribute('aria-describedby'),
  ).not.toBeNull();
});

for (const { name, render: Example } of examples)
  it(`completes ${name} navigation`, async () => {
    render(<Example />);
    if (name === 'modal')
      await userEvent.click(
        screen.getByRole('button', { name: 'Open setup wizard' }),
      );
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }));
    if (name === 'modal') {
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Open setup wizard' }),
      );
    } else
      expect(screen.getByRole('status').textContent).toBe('Workspace created');
  });
