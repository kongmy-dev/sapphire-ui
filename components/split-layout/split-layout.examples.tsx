import { Textarea } from '../textarea/textarea.js';
import { SplitHandle, SplitLayout, SplitPanel } from './split-layout.js';

function SplitWorkspace() {
  return (
    <div className="docs-split-frame">
      <SplitLayout aria-label="Workspace panels">
        <SplitPanel id="navigation" defaultSize="30%" minSize="15%">
          <div className="docs-split-content">
            <h2>Navigation</h2>
            <a href="#workspace-projects">Projects</a>
          </div>
        </SplitPanel>
        <SplitHandle withHandle aria-label="Resize navigation" />
        <SplitPanel id="editor">
          <div className="docs-split-content">
            <h2>Editor</h2>
            <Textarea
              aria-label="Document content"
              defaultValue="Project notes"
            />
          </div>
        </SplitPanel>
      </SplitLayout>
    </div>
  );
}

function SplitVertical() {
  return (
    <div className="docs-split-frame">
      <SplitLayout orientation="vertical" aria-label="Preview panels">
        <SplitPanel id="preview" defaultSize="60%" minSize="20%">
          <h2>Preview</h2>
          <p>Document preview</p>
        </SplitPanel>
        <SplitHandle withHandle aria-label="Resize preview" />
        <SplitPanel id="console" minSize="20%">
          <h2>Console</h2>
          <p>No errors</p>
        </SplitPanel>
      </SplitLayout>
    </div>
  );
}

export const examples = [
  { name: 'workspace', render: SplitWorkspace },
  { name: 'vertical', render: SplitVertical },
] as const;
