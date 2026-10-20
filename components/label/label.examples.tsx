import { Input } from '../input/input.js';
import { Label } from './label.js';

function LabelSizes() {
  return (
    <div className="sp-stack">
      <Label size="sm" htmlFor="small-label-input">
        Small label
      </Label>
      <Input id="small-label-input" />
      <Label htmlFor="default-label-input">Default label</Label>
      <Input id="default-label-input" />
      <Label size="lg" htmlFor="large-label-input">
        Large label
      </Label>
      <Input id="large-label-input" />
    </div>
  );
}

function LabelRequired() {
  return (
    <div>
      <Label required htmlFor="required-label-input">
        Email
      </Label>
      <Input id="required-label-input" type="email" required />
    </div>
  );
}

export const examples = [
  { name: 'sizes', render: LabelSizes },
  { name: 'required', render: LabelRequired },
] as const;
