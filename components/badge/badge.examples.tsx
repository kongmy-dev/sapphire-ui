import { Card } from '../card/card.js';
import { Badge } from './badge.js';

function BadgeVariants() {
  return (
    <div className="sp-cluster">
      <Badge>Default</Badge>
      <Badge variant="brand">Brand</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Card variant="dark">
        <Badge variant="on-dark">On dark</Badge>
      </Card>
    </div>
  );
}

function BadgeSizes() {
  return (
    <div className="sp-cluster">
      <Badge size="sm">Small</Badge>
      <Badge>Default</Badge>
      <Badge size="lg">Large</Badge>
      <Badge asChild variant="brand">
        <a href="#badge-details">View details</a>
      </Badge>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: BadgeVariants },
  { name: 'sizes', render: BadgeSizes },
] as const;
