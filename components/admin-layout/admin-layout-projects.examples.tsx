'use client';

import { Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Badge } from '../badge/badge.js';
import { Button } from '../button/button.js';
import { Card } from '../card/card.js';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog/dialog.js';
import { Empty } from '../empty/empty.js';
import { FormField } from '../form-field/form-field.js';
import { Input } from '../input/input.js';
import { NativeSelect } from '../native-select/native-select.js';
import { PageHeader } from '../page-header/page-header.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table/table.js';

export const initialProjects = [
  {
    name: 'Customer portal',
    client: 'Northstar',
    status: 'Active',
    updated: 'Today',
    owner: 'AR',
  },
  {
    name: 'Inventory refresh',
    client: 'Fieldwork',
    status: 'Active',
    updated: 'Today',
    owner: 'JL',
  },
  {
    name: 'Operations dashboard',
    client: 'Meridian',
    status: 'Review',
    updated: 'Yesterday',
    owner: 'AR',
  },
  {
    name: 'Brand website',
    client: 'Northstar',
    status: 'Active',
    updated: '22 Oct',
    owner: 'SK',
  },
  {
    name: 'Billing integration',
    client: 'Fieldwork',
    status: 'Review',
    updated: '21 Oct',
    owner: 'JL',
  },
  {
    name: 'Member directory',
    client: 'Meridian',
    status: 'Archived',
    updated: '18 Oct',
    owner: 'SK',
  },
] as const;
export type Project = {
  name: string;
  client: string;
  status: string;
  updated: string;
  owner: string;
};

export function NewProject({
  onCreate,
}: {
  onCreate: (project: Project) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setName('');
      setError('');
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button icon={<Plus className="sp-icon" aria-hidden="true" />}>
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) {
              setError('Enter a project name.');
              return;
            }
            onCreate({
              name: name.trim(),
              client: 'Your workspace',
              status: 'Active',
              updated: 'Just now',
              owner: 'AR',
            });
            changeOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Start a project for your team.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FormField label="Project name" required error={error}>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectTable({ projects }: { projects: readonly Project[] }) {
  return (
    <Table aria-label="Projects">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Project</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead scope="col">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell>
              <strong>{project.name}</strong>
              <span className="demo-project-client">{project.client}</span>
            </TableCell>
            <TableCell>
              <Badge
                variant={project.status === 'Active' ? 'success' : 'default'}
              >
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>
              <span
                className="demo-workspace-avatar"
                role="img"
                aria-label={`Owner ${project.owner}`}
              >
                {project.owner}
              </span>
            </TableCell>
            <TableCell className="demo-project-updated">
              {project.updated}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function WorkspaceProjects({
  projects,
  actions,
  archived,
}: {
  projects: readonly Project[];
  actions: ReactNode;
  archived: boolean;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(archived ? 'Archived' : 'All');
  const [page, setPage] = useState(0);
  const filtered = projects.filter(
    (project) =>
      `${project.name} ${project.client}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === 'All' || project.status === status),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 4));
  const currentPage = Math.min(page, pageCount - 1);
  return (
    <>
      <PageHeader
        title={archived ? 'Archived projects' : 'Projects'}
        description="Find a project and see what needs attention."
        actions={actions}
      />
      <Card padding="none">
        <div className="demo-workspace-filters">
          <Input
            type="search"
            aria-label="Search projects"
            placeholder="Search projects or clients…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
          <NativeSelect
            aria-label="Project status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="All">All statuses</option>
            <option>Active</option>
            <option>Review</option>
            <option>Archived</option>
          </NativeSelect>
        </div>
        {filtered.length ? (
          <ProjectTable
            projects={filtered.slice(currentPage * 4, currentPage * 4 + 4)}
          />
        ) : (
          <Empty
            title="No projects found"
            description="Try another search or clear your filters."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatus('All');
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
        <ProjectPagination
          currentPage={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          onPageChange={setPage}
        />
      </Card>
    </>
  );
}

function ProjectPagination({
  currentPage,
  pageCount,
  total,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="demo-workspace-pagination">
      <span role="status">
        {total} projects · Page {currentPage + 1} of {pageCount}
      </span>
      <div className="sp-cluster">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage + 1 === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
