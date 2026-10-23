'use client';

import {
  Archive,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Breadcrumb } from '../breadcrumb/breadcrumb.js';
import { Button } from '../button/button.js';
import { Card } from '../card/card.js';
import { Checkbox } from '../checkbox/checkbox.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu.js';
import { FormField } from '../form-field/form-field.js';
import { FormSection } from '../form-section/form-section.js';
import { Input } from '../input/input.js';
import { NativeSelect } from '../native-select/native-select.js';
import { PageHeader } from '../page-header/page-header.js';
import { Stat } from '../stat/stat.js';
import { StatGroup } from '../stat-group/stat-group.js';
import { ThemeToggle } from '../theme-toggle/theme-toggle.js';
import {
  AdminHeader,
  AdminLayout,
  AdminSidebar,
  AdminSidebarGroup,
  AdminSidebarLink,
  AdminSidebarSection,
} from './admin-layout.js';
import {
  initialProjects,
  NewProject,
  type Project,
  ProjectTable,
  WorkspaceProjects,
} from './admin-layout-projects.examples.js';

type Page = 'overview' | 'projects' | 'archived' | 'settings';
const titles = {
  overview: 'Overview',
  projects: 'Projects',
  archived: 'Archived projects',
  settings: 'Workspace settings',
} as const;

function WorkspaceBrand({ compact }: { compact: boolean }) {
  return (
    <a
      className="demo-workspace-identity"
      href="#workspace"
      aria-label={compact ? 'Sapphire workspace' : 'S Sapphire Team workspace'}
    >
      <span className="demo-workspace-mark" aria-hidden="true">
        S
      </span>{' '}
      {!compact && (
        <span>
          <strong>Sapphire</strong> <small>Team workspace</small>
        </span>
      )}
    </a>
  );
}

function WorkspaceAccount({
  compact,
  onSettings,
}: {
  compact: boolean;
  onSettings: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="demo-workspace-identity demo-workspace-account"
          aria-label={
            compact
              ? 'AR Aisha Rahman account'
              : 'AR Aisha Rahman Workspace admin account'
          }
        >
          <span className="demo-workspace-avatar" aria-hidden="true">
            AR
          </span>{' '}
          {!compact && (
            <>
              <span>
                <strong>Aisha Rahman</strong> <small>Workspace admin</small>
              </span>
              <ChevronDown className="sp-icon" aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end">
        <DropdownMenuItem onSelect={onSettings}>
          Workspace settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WorkspaceSidebar({
  page,
  navigate,
  projectCount,
  helpId,
}: {
  page: Page;
  navigate: (page: Page) => void;
  projectCount: number;
  helpId: string;
}) {
  return (
    <AdminSidebar
      aria-label="Workspace navigation"
      brand={WorkspaceBrand}
      footer={({ compact }) => (
        <WorkspaceAccount
          compact={compact}
          onSettings={() => navigate('settings')}
        />
      )}
    >
      <AdminSidebarSection title="Workspace">
        <AdminSidebarLink
          href="#overview"
          active={page === 'overview'}
          icon={<LayoutDashboard className="sp-icon" />}
          onClick={() => navigate('overview')}
        >
          Overview
        </AdminSidebarLink>
        <AdminSidebarLink
          href="#projects"
          active={page === 'projects'}
          badge={projectCount}
          icon={<FolderKanban className="sp-icon" />}
          onClick={() => navigate('projects')}
        >
          Projects
        </AdminSidebarLink>
        <AdminSidebarGroup
          label="Library"
          icon={<Archive className="sp-icon" />}
          active={page === 'archived'}
        >
          <AdminSidebarLink
            href="#all-projects"
            onClick={() => navigate('projects')}
          >
            All projects
          </AdminSidebarLink>
          <AdminSidebarLink
            href="#archived-projects"
            active={page === 'archived'}
            onClick={() => navigate('archived')}
          >
            Archived projects
          </AdminSidebarLink>
        </AdminSidebarGroup>
      </AdminSidebarSection>
      <AdminSidebarSection title="Manage">
        <AdminSidebarLink
          href="#settings"
          active={page === 'settings'}
          icon={<Settings className="sp-icon" />}
          onClick={() => navigate('settings')}
        >
          Settings
        </AdminSidebarLink>
        <AdminSidebarLink href={`#${helpId}`}>Help</AdminSidebarLink>
      </AdminSidebarSection>
    </AdminSidebar>
  );
}

function WorkspaceOverview({
  projects,
  actions,
  navigate,
}: {
  projects: readonly Project[];
  actions: ReactNode;
  navigate: (page: Page) => void;
}) {
  return (
    <>
      <PageHeader
        title="Workspace overview"
        description="Your projects, priorities and recent activity in one place."
        actions={actions}
      />
      <StatGroup cols={3}>
        <Stat
          label="Active projects"
          value={
            projects.filter((project) => project.status === 'Active').length
          }
          description="Across three clients"
        />
        <Stat
          label="Awaiting review"
          value="2"
          description="Ready for your feedback"
        />
        <Stat
          label="Team members"
          value="8"
          description="3 collaborators online"
        />
      </StatGroup>
      <div className="demo-workspace-overview">
        <Card padding="none">
          <div className="demo-workspace-card-heading">
            <h2>Recent projects</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('projects')}
            >
              View all projects
            </Button>
          </div>
          <ProjectTable projects={projects.slice(0, 4)} />
        </Card>
        <Card>
          <h2>Recent activity</h2>
          <ol className="demo-workspace-activity">
            <li>
              <strong>Customer portal updated</strong>
              <span>Aisha added the onboarding flow.</span>
              <small>12 minutes ago</small>
            </li>
            <li>
              <strong>Dashboard ready for review</strong>
              <span>James shared the latest version.</span>
              <small>1 hour ago</small>
            </li>
            <li>
              <strong>New teammate joined</strong>
              <span>Sarah joined the design team.</span>
              <small>Today, 09:15</small>
            </li>
          </ol>
        </Card>
      </div>
    </>
  );
}

function WorkspaceSettings() {
  const [name, setName] = useState('Sapphire');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        title="Workspace settings"
        description="Manage the details your team shares."
      />
      <Card className="demo-workspace-settings">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setError(name.trim() ? '' : 'Enter a workspace name.');
            setSaved(Boolean(name.trim()));
          }}
        >
          <FormSection
            legend="General"
            description="These details appear throughout your workspace."
          >
            <FormField
              label="Workspace name"
              required
              error={error}
              hint="Choose a name your team will recognize."
            >
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
              />
            </FormField>
            <FormField label="Timezone">
              <NativeSelect
                defaultValue="Asia/Kuala_Lumpur"
                name="timezone"
                onChange={() => setSaved(false)}
              >
                <option value="Asia/Kuala_Lumpur">Kuala Lumpur (UTC+8)</option>
                <option value="Europe/London">London</option>
              </NativeSelect>
            </FormField>
          </FormSection>
          <FormSection
            legend="Notifications"
            description="Choose what reaches your inbox."
          >
            <Checkbox
              label="Weekly project summary"
              description="A digest of progress and upcoming reviews."
              defaultChecked
              name="weekly"
              onCheckedChange={() => setSaved(false)}
            />
            <Checkbox
              label="Project review requests"
              description="An email when a teammate needs your feedback."
              defaultChecked
              name="reviews"
              onCheckedChange={() => setSaved(false)}
            />
          </FormSection>
          <div className="demo-workspace-save">
            <Button type="submit">Save changes</Button>
            <span role="status">
              {saved ? 'Workspace settings saved.' : ''}
            </span>
          </div>
        </form>
      </Card>
    </>
  );
}

function WorkspaceDemo({
  initialPage = 'overview',
  compact = false,
}: {
  initialPage?: Page;
  compact?: boolean;
}) {
  const [page, setPage] = useState(initialPage);
  const helpId = useId();
  const [projects, setProjects] = useState<readonly Project[]>(initialProjects);
  const actions = (
    <NewProject
      onCreate={(project) => {
        setProjects((current) => [project, ...current]);
        setPage('projects');
      }}
    />
  );
  return (
    <AdminLayout
      defaultDesktopState={compact ? 'compact' : 'expanded'}
      sidebar={
        <WorkspaceSidebar
          page={page}
          navigate={setPage}
          projectCount={projects.length}
          helpId={helpId}
        />
      }
      header={
        <AdminHeader
          leftSlot={
            <strong className="demo-workspace-app-name">Sapphire</strong>
          }
          breadcrumbs={<Breadcrumb items={[{ label: titles[page] }]} />}
          rightSlot={<ThemeToggle />}
        />
      }
    >
      {page === 'overview' && (
        <WorkspaceOverview
          projects={projects}
          actions={actions}
          navigate={setPage}
        />
      )}
      {(page === 'projects' || page === 'archived') && (
        <WorkspaceProjects
          key={page}
          projects={projects}
          actions={actions}
          archived={page === 'archived'}
        />
      )}
      {page === 'settings' && <WorkspaceSettings />}
      <p id={helpId} className="demo-workspace-help">
        Need a hand? Contact your workspace administrator.
      </p>
    </AdminLayout>
  );
}

function AdminWorkspace() {
  return <WorkspaceDemo />;
}
function AdminCollapsed() {
  return <WorkspaceDemo compact initialPage="projects" />;
}
function AdminRecords() {
  return <WorkspaceDemo initialPage="projects" />;
}
function AdminSettings() {
  return <WorkspaceDemo initialPage="settings" />;
}

export const examples = [
  { name: 'workspace', render: AdminWorkspace },
  { name: 'collapsed', render: AdminCollapsed },
  { name: 'records', render: AdminRecords },
  { name: 'settings', render: AdminSettings },
] as const;
