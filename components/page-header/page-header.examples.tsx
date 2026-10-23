import { Button } from '../button/button.js';
import { PageHeader } from './page-header.js';

function RecordsHeader() {
  return (
    <PageHeader
      title="Invoices"
      description="Manage invoices and payment status."
      actions={<Button>New invoice</Button>}
    />
  );
}

function BreadcrumbHeader() {
  return (
    <PageHeader
      title="Account settings"
      breadcrumbs={
        <nav aria-label="Breadcrumb">
          <a href="#settings">Settings</a>
        </nav>
      }
      description="Update your business profile and contact details."
    />
  );
}

export const examples = [
  { name: 'records', render: RecordsHeader },
  { name: 'breadcrumbs', render: BreadcrumbHeader },
] as const;
