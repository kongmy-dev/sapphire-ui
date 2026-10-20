import { FolderOpen } from 'lucide-react';
import { Button } from '../button/button.js';
import { Empty } from './empty.js';

function EmptyMessage() {
  return <Empty title="No results" description="Try another search term." />;
}

function EmptyAction() {
  return (
    <Empty
      icon={<FolderOpen className="sp-icon" />}
      title="No projects yet"
      description="Create your first project to get started."
      action={
        <Button asChild>
          <a href="#create-project">Create project</a>
        </Button>
      }
    />
  );
}

export const examples = [
  { name: 'message', render: EmptyMessage },
  { name: 'action', render: EmptyAction },
] as const;
