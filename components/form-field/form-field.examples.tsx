'use client';

import { useState } from 'react';
import { Input } from '../input/input.js';
import { NativeSelect } from '../native-select/native-select.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select.js';
import { Textarea } from '../textarea/textarea.js';
import { FormField } from './form-field.js';

function FieldComposition() {
  return (
    <div className="docs-form-field-demo sp-stack">
      <FormField
        label="Email"
        required
        hint="We will send a verification link."
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Message" hint="Maximum 280 characters.">
        <Textarea maxLength={280} />
      </FormField>
      <FormField label="Plan">
        <NativeSelect>
          <option>Free</option>
          <option>Pro</option>
        </NativeSelect>
      </FormField>
    </div>
  );
}

function FieldStates() {
  return (
    <div className="docs-form-field-demo sp-stack">
      <FormField label="Invalid email" error="Enter a valid email." required>
        <Input type="email" defaultValue="invalid" />
      </FormField>
      <FormField label="Locked field" hint="This value cannot be changed.">
        <Input disabled defaultValue="Locked" />
      </FormField>
    </div>
  );
}

function FieldValidation() {
  const [value, setValue] = useState('');
  const error =
    value && !value.includes('@') ? 'Enter an email with @.' : undefined;
  return (
    <FormField
      label="Validated email"
      hint="Use your work email."
      error={error}
    >
      <Input
        type="email"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
    </FormField>
  );
}

function CompoundField() {
  return (
    <FormField
      label="Billing country"
      required
      hint="Used for tax calculations."
    >
      {({ controlProps, required }) => (
        <Select required={required} defaultValue="my" name="billing-country">
          <SelectTrigger {...controlProps}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="my">Malaysia</SelectItem>
            <SelectItem value="sg">Singapore</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}

export const examples = [
  { name: 'compound-control', render: CompoundField },
  { name: 'composition', render: FieldComposition },
  { name: 'states', render: FieldStates },
  { name: 'validation', render: FieldValidation },
] as const;
