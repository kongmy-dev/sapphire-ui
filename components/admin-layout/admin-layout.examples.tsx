'use client';

import { useState } from 'react';
import {
  AdminHeader,
  AdminLayout,
  AdminSidebar,
  AdminSidebarLink,
  AdminSidebarSection,
} from './admin-layout.js';

function WorkspaceIcon() {
  return (
    <svg
      className="sp-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
    </svg>
  );
}

function AdminWorkspace() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AdminLayout
      sidebar={
        <AdminSidebar
          aria-label="Workspace sidebar"
          collapsed={collapsed}
          onToggleCollapse={setCollapsed}
          brand="Sapphire"
          footer={<span>Team workspace</span>}
        >
          <AdminSidebarSection title="Workspace" collapsed={collapsed}>
            <AdminSidebarLink
              href="#admin-overview"
              active
              icon={<WorkspaceIcon />}
              collapsed={collapsed}
            >
              Overview
            </AdminSidebarLink>
            <AdminSidebarLink
              asChild
              icon={<WorkspaceIcon />}
              badge="3"
              collapsed={collapsed}
            >
              <a href="#admin-projects">Projects</a>
            </AdminSidebarLink>
          </AdminSidebarSection>
        </AdminSidebar>
      }
      header={
        <AdminHeader
          leftSlot={<span>Workspace</span>}
          breadcrumbs={<span>Home / Overview</span>}
          rightSlot={<a href="#admin-account">Account</a>}
        />
      }
    >
      <h1>Workspace overview</h1>
      <p>Manage your projects and team.</p>
    </AdminLayout>
  );
}

function AdminCollapsed() {
  return (
    <AdminLayout
      sidebar={
        <AdminSidebar collapsed aria-label="Compact sidebar" brand="Sapphire">
          <AdminSidebarSection title="Navigation">
            <AdminSidebarLink href="#compact-home" icon={<WorkspaceIcon />}>
              Home
            </AdminSidebarLink>
          </AdminSidebarSection>
        </AdminSidebar>
      }
    >
      <h1>Compact workspace</h1>
      <p>Expand the sidebar to view navigation labels.</p>
    </AdminLayout>
  );
}

export const examples = [
  { name: 'workspace', render: AdminWorkspace },
  { name: 'collapsed', render: AdminCollapsed },
] as const;
