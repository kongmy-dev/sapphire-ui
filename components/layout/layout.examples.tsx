import { Layout } from './layout.js';

function LayoutSimple() {
  return (
    <Layout
      className="docs-layout-demo"
      header={<header>Workspace header</header>}
      footer={<footer>Workspace footer</footer>}
    >
      <h2>Overview</h2>
      <p>Page content belongs in the main landmark.</p>
    </Layout>
  );
}
function LayoutSidebar() {
  return (
    <Layout
      className="docs-layout-demo"
      sidebar={
        <aside className="sp-layout-sidebar docs-layout-sidebar">
          Workspace navigation
        </aside>
      }
    >
      <h2>Workspace</h2>
      <p>The rail and content share the remaining width.</p>
    </Layout>
  );
}
export const examples = [
  { name: 'simple', render: LayoutSimple },
  { name: 'sidebar', render: LayoutSidebar },
] as const;
