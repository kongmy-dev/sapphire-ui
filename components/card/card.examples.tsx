import { Card, CardBody, CardFooter, CardHeader } from './card.js';

function CardVariants() {
  return (
    <div className="sp-stack">
      <Card>
        <h3>Default card</h3>
        <p>A clear surface for focused content.</p>
      </Card>
      <Card variant="dark">
        <h3>Dark card</h3>
        <p>Editorial contrast for a featured message.</p>
      </Card>
      <Card variant="feature">
        <div>
          <h3>Feature card</h3>
          <p>A flexible layout for prominent content.</p>
        </div>
        <span>Featured</span>
      </Card>
      <Card variant="dashed">
        <h3>Dashed card</h3>
        <p>Space for a new project.</p>
      </Card>
    </div>
  );
}

function CardPadding() {
  return (
    <div className="sp-stack">
      <Card>Default padding</Card>
      <Card padding="compact">Compact padding</Card>
      <Card padding="none">No padding</Card>
    </div>
  );
}

function CardParts() {
  return (
    <Card bordered hoverable>
      <CardHeader>
        <h3>Project overview</h3>
        <p>Updated today</p>
      </CardHeader>
      <CardBody>
        <p>Keep the important work visible.</p>
      </CardBody>
      <CardFooter>
        <span>3 contributors</span>
        <a href="#project">View project</a>
      </CardFooter>
    </Card>
  );
}

export const examples = [
  { name: 'variants', render: CardVariants },
  { name: 'padding', render: CardPadding },
  { name: 'parts', render: CardParts },
] as const;
