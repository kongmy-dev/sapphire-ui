export type GateCase = {
  name: string;
  v3: string;
  v4: string;
  width: number;
  height: number;
  viewport?: number;
  hover?: string;
  focus?: string;
  tolerance?: number;
};

const WIDE = 1280;
const NARROW = 500;

const gateV3 = (hidden: boolean) => `
<div class="gate${hidden ? ' is-hidden' : ''}">
  <div class="gate-card">
    <div class="gate-brand"><div class="sf-mark">K</div><span>KONGMY</span></div>
    <h2>Protected Document</h2>
    <div class="gate-doc">Digital Transformation Proposal</div>
    <p class="muted">Enter the passphrase you were given to view this document.</p>
    <label for="parity-pass">Passphrase</label>
    <div class="gate-field"><input id="parity-pass" type="password"><button class="gate-submit" type="button">Unlock</button></div>
    <div class="gate-err">Incorrect passphrase. Try again.</div>
    <div class="gate-foot"><span>Access is logged.</span></div>
  </div>
</div>`;

const gateV4 = (hidden: boolean) => `
<div class="sp-passphrase-gate"${hidden ? ' data-hidden' : ''}>
  <div class="sp-passphrase-gate-card">
    <div class="sp-passphrase-gate-brand"><div class="sp-passphrase-gate-mark">K</div><span>KONGMY</span></div>
    <h2 class="sp-passphrase-gate-title">Protected Document</h2>
    <div class="sp-passphrase-gate-document">Digital Transformation Proposal</div>
    <p class="sp-passphrase-gate-description">Enter the passphrase you were given to view this document.</p>
    <label class="sp-passphrase-gate-label" for="parity-pass">Passphrase</label>
    <div class="sp-passphrase-gate-field"><input class="sp-passphrase-gate-input" id="parity-pass" type="password"><button class="sp-passphrase-gate-submit" type="button">Unlock</button></div>
    <div class="sp-passphrase-gate-error">Incorrect passphrase. Try again.</div>
    <div class="sp-passphrase-gate-foot"><span>Access is logged.</span></div>
  </div>
</div>`;

const CHIP_V3 =
  '<button class="gate-toggle" type="button">Preview the gate</button>';
const CHIP_V4 =
  '<button class="sp-passphrase-gate-toggle" type="button">Preview the gate</button>';
const PILL_V3 = '<span class="pass-locked-pill">Locked</span>';
const PILL_V4 = '<span class="sp-passphrase-gate-pill">Locked</span>';

export const GATE_CASES: readonly GateCase[] = [
  {
    name: 'gate',
    v3: gateV3(false),
    v4: gateV4(false),
    width: WIDE,
    height: 720,
    hover: 'button',
    focus: 'input',
    tolerance: 1,
  },
  {
    name: 'gate-narrow',
    v3: gateV3(false),
    v4: gateV4(false),
    width: NARROW,
    height: 720,
    viewport: NARROW,
    tolerance: 1,
  },
  {
    name: 'gate-hidden',
    v3: gateV3(true),
    v4: gateV4(true),
    width: WIDE,
    height: 200,
  },
  {
    name: 'gate-chip',
    v3: CHIP_V3,
    v4: CHIP_V4,
    width: 320,
    height: 120,
    hover: 'button',
    tolerance: 1,
  },
  {
    name: 'gate-pill',
    v3: `<div style="padding:12px">${PILL_V3}</div>`,
    v4: `<div style="padding:12px">${PILL_V4}</div>`,
    width: 160,
    height: 60,
  },
];
