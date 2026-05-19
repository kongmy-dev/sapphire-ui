import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Checkbox } from '../components/ui/Checkbox';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { RangeSlider } from '../components/ui/RangeSlider';
import { NativeSelect } from '../components/ui/NativeSelect';

export default function FormsPage() {
  const [switchOn, setSwitchOn] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);

  return (
    <div>
      <header className="docs-page-header">
        <h1>Forms</h1>
        <p>Form controls with light and dark variants. All components support forwarded refs and standard HTML attributes.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Input</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <div>
              <Label htmlFor="input-default" required>Email</Label>
              <Input id="input-default" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="input-mono">API Key</Label>
              <Input id="input-mono" variant="mono" placeholder="sk-..." />
            </div>
          </div>
        </div>
        <div className="docs-preview docs-preview--dark">
          <div style={{ maxWidth: 400 }}>
            <Label htmlFor="input-dark" style={{ color: 'var(--color-text-on-dark)' }}>Search</Label>
            <Input id="input-dark" variant="dark" placeholder="Search..." />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Textarea</h2>
        <div className="docs-preview">
          <div style={{ maxWidth: 400 }}>
            <Label htmlFor="textarea-demo">Description</Label>
            <Textarea id="textarea-demo" placeholder="Tell us about your project..." />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Checkbox</h2>
        <div className="docs-preview">
          <div className="docs-stack">
            <Checkbox label="Accept terms and conditions" description="You agree to our privacy policy." />
            <Checkbox label="Send me updates" defaultChecked />
            <Checkbox label="Indeterminate" indeterminate />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Toggle Switch</h2>
        <div className="docs-preview">
          <div className="docs-stack">
            <ToggleSwitch
              label="Enable analytics"
              checked={switchOn}
              onChange={(e) => setSwitchOn(e.target.checked)}
              activeColor="var(--color-accent)"
            />
            <ToggleSwitch label="Disabled" disabled />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Range Slider</h2>
        <div className="docs-preview">
          <div style={{ maxWidth: 400 }}>
            <Label>Volume: {sliderVal}</Label>
            <RangeSlider
              min={0} max={100}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              showValue
              variant="light"
            />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Native Select</h2>
        <div className="docs-preview">
          <div style={{ maxWidth: 300 }}>
            <Label>Cloud Provider</Label>
            <NativeSelect variant="default">
              <option value="">Select provider...</option>
              <option value="aws">Amazon Web Services</option>
              <option value="gcp">Google Cloud Platform</option>
              <option value="cf">Cloudflare</option>
            </NativeSelect>
          </div>
        </div>
      </section>
    </div>
  );
}
