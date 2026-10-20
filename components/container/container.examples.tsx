import { Container } from './container.js';

function ContainerWidths() {
  return (
    <div className="docs-container-frame">
      <Container maxWidth="sm" className="docs-container-demo">
        <p>Small reading width</p>
      </Container>
      <Container maxWidth="full" padding="none">
        <p>Full width without padding</p>
      </Container>
    </div>
  );
}
function ContainerPadding() {
  return (
    <Container padding="lg">
      <p>Generous section padding</p>
    </Container>
  );
}
export const examples = [
  { name: 'widths', render: ContainerWidths },
  { name: 'padding', render: ContainerPadding },
] as const;
