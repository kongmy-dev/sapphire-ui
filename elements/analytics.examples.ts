import { setConsentStatus } from '../lib/consent.js';
import './analytics.js';

function ConsentLifecycle() {
  const section = document.createElement('section');
  const explanation = document.createElement('p');
  explanation.textContent =
    'Analytics respects consent and stays idle until a tracker is configured.';
  const tracker = document.createElement('sapphire-analytics');
  section.append(explanation, tracker);
  for (const [label, analytics] of [
    ['Allow analytics', true],
    ['Withdraw analytics', false],
  ] as const) {
    const button = document.createElement('button');
    button.className = 'sp-button';
    button.textContent = label;
    button.addEventListener('click', () => setConsentStatus({ analytics }));
    section.append(button);
  }
  return section;
}

export const examples = [
  { name: 'consent', render: ConsentLifecycle },
] as const;
