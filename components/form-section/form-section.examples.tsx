import { FormField } from '../form-field/form-field.js';
import { Input } from '../input/input.js';
import { FormSection } from './form-section.js';

function BusinessDetails() {
  return (
    <FormSection
      legend="Business details"
      description="This information appears on your invoices."
    >
      <FormField label="Business name" required>
        <Input defaultValue="Acme Trading" />
      </FormField>
      <FormField label="Billing email" hint="Payment reminders are sent here.">
        <Input type="email" defaultValue="billing@example.com" />
      </FormField>
    </FormSection>
  );
}

function LockedDetails() {
  return (
    <FormSection
      legend="Verified business"
      description="Contact support to change verified details."
      disabled
    >
      <FormField label="Registration number">
        <Input defaultValue="202601234567" />
      </FormField>
    </FormSection>
  );
}

export const examples = [
  { name: 'business-details', render: BusinessDetails },
  { name: 'disabled', render: LockedDetails },
] as const;
