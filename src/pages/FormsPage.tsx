import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Checkbox } from '../components/ui/Checkbox';
import { Switch } from '../components/ui/ToggleSwitch';
import { RangeSlider } from '../components/ui/RangeSlider';
import { NativeSelect } from '../components/ui/NativeSelect';
import { FormField } from '../components/ui/FormField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from '../components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';

export default function FormsPage() {
  const [switchOn, setSwitchOn] = useState(false);
  const [sliderVal, setSliderVal] = useState<number[]>([50]);
  const [selectVal, setSelectVal] = useState<string>('');
  const [plan, setPlan] = useState('pro');
  const [email, setEmail] = useState('');
  const emailError = email && !email.includes('@') ? 'Looks like that\'s not a valid email.' : undefined;

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
            <Checkbox label="Indeterminate" checked="indeterminate" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Switch</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Built on <code>@radix-ui/react-switch</code>. Use <code>checked</code> +{' '}
          <code>onCheckedChange</code> for controlled, or <code>defaultChecked</code> for
          uncontrolled. Override the active fill via the <code>--switch-active</code> CSS variable.
        </p>
        <div className="docs-preview">
          <div className="docs-stack">
            <Switch
              label="Enable analytics"
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <Switch label="Marketing emails" defaultChecked />
            <Switch label="Disabled" disabled />
            <Switch label="Disabled · on" disabled defaultChecked />
            <Switch
              label="Custom accent"
              defaultChecked
              style={{ ['--switch-active' as string]: '#16a34a' }}
            />
          </div>
        </div>
        <div className="docs-preview docs-preview--dark">
          <div className="docs-stack">
            <Switch label="On dark surface" defaultChecked />
            <Switch label="Off" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Range Slider</h2>
        <div className="docs-preview">
          <div style={{ maxWidth: 400 }}>
            <Label>Volume: {sliderVal[0]}</Label>
            <RangeSlider
              aria-label="Volume"
              min={0} max={100}
              value={sliderVal}
              onValueChange={setSliderVal}
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
            <Label htmlFor="cloud-provider-select">Cloud Provider</Label>
            <NativeSelect id="cloud-provider-select" variant="default">
              <option value="">Select provider...</option>
              <option value="aws">Amazon Web Services</option>
              <option value="gcp">Google Cloud Platform</option>
              <option value="cf">Cloudflare</option>
            </NativeSelect>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Select (Radix)</h2>
        <div className="docs-preview">
          <div style={{ maxWidth: 300 }}>
            <Label htmlFor="region-select">Region</Label>
            <Select value={selectVal} onValueChange={setSelectVal}>
              <SelectTrigger id="region-select" aria-label="Region">
                <SelectValue placeholder="Pick a region…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Americas</SelectLabel>
                  <SelectItem value="us-east-1">us-east-1 (Virginia)</SelectItem>
                  <SelectItem value="us-west-2">us-west-2 (Oregon)</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Europe</SelectLabel>
                  <SelectItem value="eu-west-1">eu-west-1 (Ireland)</SelectItem>
                  <SelectItem value="eu-central-1">eu-central-1 (Frankfurt)</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Asia Pacific</SelectLabel>
                  <SelectItem value="ap-southeast-1">ap-southeast-1 (Singapore)</SelectItem>
                  <SelectItem value="ap-southeast-2">ap-southeast-2 (Sydney)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Radio Group</h2>
        <div className="docs-preview">
          <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
            <RadioGroupItem value="free" label="Free" description="$0/mo — single project, community support." />
            <RadioGroupItem value="pro" label="Pro" description="$12/mo — unlimited projects, email support." />
            <RadioGroupItem value="team" label="Team" description="$48/mo — multi-seat, priority support." />
          </RadioGroup>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Form Field (composition)</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <FormField label="Email" hint="We'll send a verification link." required>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Email with validation" error={emailError}>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Plain field with hint" hint="Maximum 280 characters.">
              <Textarea placeholder="What's on your mind?" />
            </FormField>
          </div>
        </div>
      </section>
      <section className="docs-section">
        <h2 className="docs-section-title">Props</h2>
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Input</h3>
        <table className="docs-props-table mb-8">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>&apos;default&apos; | &apos;dark&apos; | &apos;mono&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
          </tbody>
        </table>
        
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">NativeSelect</h3>
        <table className="docs-props-table">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>&apos;default&apos; | &apos;dark&apos; | &apos;ghost&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
