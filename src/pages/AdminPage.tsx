import { useState } from 'react';
import {
  AdminLayout,
  AdminSidebar,
  AdminSidebarSection,
  AdminSidebarLink,
  AdminHeader,
} from '../components/ui/AdminLayout';
import { Stat } from '../components/ui/Stat';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../components/ui/DropdownMenu';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Banner } from '../components/Banner';
import { Callout } from '../components/ui/Callout';
import { Container } from '../components/ui/Container';
import { MarginNote } from '../components/ui/MarginNote';
import { StatGroup } from '../components/ui/StatGroup';
import { SplitLayout, SplitPanel, SplitHandle } from '../components/ui/SplitLayout';
import { TableOfContents } from '../components/ui/TableOfContents';
import { Timeline, TimelineItem, TimelineIndicator, TimelineContent } from '../components/ui/Timeline';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { WizardLayout } from '../components/ui/WizardLayout';

// Mock consulting projects for the interactive table
interface Engagement {
  id: string;
  client: string;
  project: string;
  type: 'Advisory' | 'Architecture' | 'Delivery';
  status: 'active' | 'completed' | 'on_hold';
  budget: string;
  hours: number;
}

const initialEngagements: Engagement[] = [
  { id: '1', client: 'Kuala Lumpur Tech Corp', project: 'Microservice Migration', type: 'Architecture', status: 'active', budget: 'RM 85,000', hours: 74 },
  { id: '2', client: 'Sime Darby Retail', project: 'eCommerce Optimization', type: 'Advisory', status: 'active', budget: 'RM 48,000', hours: 32 },
  { id: '3', client: 'Petronas Digital', project: 'API Gateway Strategy', type: 'Architecture', status: 'on_hold', budget: 'RM 120,000', hours: 15 },
  { id: '4', client: 'Maybank Innovation', project: 'Cloud Compliance Audit', type: 'Advisory', status: 'completed', budget: 'RM 35,000', hours: 40 },
  { id: '5', client: 'Axiata Digital', project: 'DevOps Orchestration Plan', type: 'Delivery', status: 'active', budget: 'RM 62,500', hours: 55 },
];

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'billing'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold' | 'completed'>('all');
  const [engagements, setEngagements] = useState<Engagement[]>(initialEngagements);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // Handle mock status changes
  const updateStatus = (id: string, newStatus: Engagement['status']) => {
    setEngagements(prev =>
      prev.map(eng => (eng.id === id ? { ...eng, status: newStatus } : eng))
    );
  };

  // Filter engagements
  const filteredEngagements = engagements.filter(eng => {
    const matchesSearch =
      eng.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eng.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eng.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <header className="docs-page-header">
        <h1>Admin Dashboard & Composite Layout</h1>
        <p>
          A comprehensive administrative workbench layout system. Demonstrates the synergy of Sapphire UI tokens,
          fluid typography, responsive sidebar rails, tabular data, and first-person editorial consultancy states.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Admin Layout Workspace</h2>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', minHeight: 680, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          
          <AdminLayout
            sidebar={
              <AdminSidebar
                collapsed={collapsed}
                onToggleCollapse={setCollapsed}
                brand={
                  <div className="flex items-center gap-2 pl-1">
                    <span className="flex size-6 items-center justify-center rounded-sm bg-accent font-serif text-sm font-semibold text-primary">K</span>
                    <span className="font-serif text-base font-semibold tracking-wide text-white">
                      KONGMY
                    </span>
                    <span className="font-sans text-[10px] tracking-wider text-accent uppercase">
                      Console
                    </span>
                  </div>
                }
                footer={
                  <div className={collapsed ? "flex justify-center" : "flex items-center gap-3 p-1"}>
                    <Avatar size="sm" fallback="KM" />
                    {!collapsed && (
                      <div className="flex-1 truncate">
                        <div className="text-xs font-semibold text-white">Kong My</div>
                        <div className="text-[10px] text-white/50">Consultant</div>
                      </div>
                    )}
                  </div>
                }
              >
                <AdminSidebarSection title="Operations" collapsed={collapsed}>
                  <AdminSidebarLink
                    icon="dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    collapsed={collapsed}
                    style={{ cursor: 'pointer' }}
                  >
                    My Dashboard
                  </AdminSidebarLink>
                  <AdminSidebarLink
                    icon="engineering"
                    active={activeTab === 'services'}
                    onClick={() => setActiveTab('services')}
                    badge="3"
                    collapsed={collapsed}
                    style={{ cursor: 'pointer' }}
                  >
                    Consulting Services
                  </AdminSidebarLink>
                  <AdminSidebarLink
                    icon="payments"
                    active={activeTab === 'billing'}
                    onClick={() => setActiveTab('billing')}
                    collapsed={collapsed}
                    style={{ cursor: 'pointer' }}
                  >
                    Contracts & Invoices
                  </AdminSidebarLink>
                </AdminSidebarSection>

                <AdminSidebarSection title="Insights" collapsed={collapsed}>
                  <AdminSidebarLink icon="bar_chart" collapsed={collapsed} style={{ cursor: 'pointer' }}>
                    Metrics & Analytics
                  </AdminSidebarLink>
                  <AdminSidebarLink icon="dns" collapsed={collapsed} style={{ cursor: 'pointer' }}>
                    Status Monitor
                  </AdminSidebarLink>
                </AdminSidebarSection>
              </AdminSidebar>
            }
            header={
              <AdminHeader
                breadcrumbs={
                  <Breadcrumb
                    items={[
                      { label: 'Admin', href: '#' },
                      { label: 'Consulting' },
                      { label: activeTab === 'dashboard' ? 'Overview' : activeTab === 'services' ? 'Services' : 'Billing' }
                    ]}
                  />
                }
                rightSlot={
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-transparent outline-none">
                          <Avatar size="xs" fallback="KM" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Console</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => alert('Profile settings')}>
                          Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => alert('Support tickets')}>
                          Support Tickets
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => alert('Sign out')} style={{ color: '#ef4444' }}>
                          Log Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                }
              />
            }
          >
            {/* Banner message displaying editorial first-person singular voice */}
            <div style={{ marginBottom: 24 }}>
              <Banner variant="accent">
                I am currently serving 3 active clients under advisory SLA. Weekly timesheets close every Friday at 18:00 UTC.
              </Banner>
            </div>

            {/* Stat Row */}
            <div className="mb-8">
              <StatGroup cols={4}>
                <Card style={{ padding: 20, margin: 0 }}>
                  <Stat
                    label="My Billable Hours"
                    value="142.5h"
                    change="+8.3%"
                    changeDirection="up"
                    description="this fiscal month"
                  />
                </Card>
                <Card style={{ padding: 20, margin: 0 }}>
                  <Stat
                    label="Active Contracts"
                    value="3 Engaged"
                    change="+1 client"
                    changeDirection="up"
                    description="2 pending sign-off"
                  />
                </Card>
                <Card style={{ padding: 20, margin: 0 }}>
                  <Stat
                    label="Consulting Revenue YTD"
                    value="RM 248.5k"
                    change="+14.2%"
                    changeDirection="up"
                    description="RM 32k invoiced today"
                  />
                </Card>
                <Card style={{ padding: 20, margin: 0 }}>
                  <Stat
                    label="System API Gateway"
                    value="99.98%"
                    change="Healthy"
                    changeDirection="neutral"
                    description="uptime last 30 days"
                  />
                </Card>
              </StatGroup>
            </div>

            {/* Main Section: Interactive client engagement list */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <Card style={{ padding: 24 }}>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="m-0 font-serif text-lg font-medium text-primary dark:text-white">
                        Current Consulting Engagements
                      </h3>
                      <p className="text-text-muted m-0 mt-1 text-sm">
                        I record client contracts, project scope categories, and active hourly metrics in real-time.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEngagements(initialEngagements)}>
                        Reset Data
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => alert('Adding a new contract capability is mocked.')}>
                        New Contract
                      </Button>
                    </div>
                  </div>

                  {/* Filter and search control widgets */}
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by client or project name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {(['all', 'active', 'on_hold', 'completed'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`cursor-pointer rounded-btn px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                            statusFilter === f
                              ? 'bg-primary text-white dark:bg-accent dark:text-primary'
                              : 'text-text-muted bg-surface hover:bg-border'
                          }`}
                          style={{ border: 'none', outline: 'none' }}
                        >
                          {f === 'on_hold' ? 'on hold' : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabular records section */}
                  <div className="overflow-x-auto" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client & Scope</TableHead>
                          <TableHead>Service Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead style={{ textAlign: 'right' }}>Hours Logged</TableHead>
                          <TableHead style={{ textAlign: 'right' }}>Budget Cap</TableHead>
                          <TableHead style={{ textAlign: 'center' }}>Admin Operations</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEngagements.length > 0 ? (
                          filteredEngagements.map((eng) => (
                            <TableRow key={eng.id}>
                              <TableCell>
                                <div>
                                  <div className="font-semibold text-primary dark:text-white">{eng.client}</div>
                                  <div className="text-text-muted mt-0.5 text-xs">{eng.project}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-text-muted font-mono text-xs">{eng.type}</span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    eng.status === 'active'
                                      ? 'success'
                                      : eng.status === 'on_hold'
                                      ? 'warning'
                                      : 'info'
                                  }
                                >
                                  {eng.status === 'active' ? 'Active' : eng.status === 'on_hold' ? 'On Hold' : 'Completed'}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ textAlign: 'right', fontWeight: 500 }} className="font-mono">
                                {eng.hours} hrs
                              </TableCell>
                              <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">
                                {eng.budget}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                <div className="flex items-center justify-center gap-1.5">
                                  {eng.status !== 'active' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => updateStatus(eng.id, 'active')}
                                      style={{ padding: '4px 8px', fontSize: 11 }}
                                    >
                                      Activate
                                    </Button>
                                  )}
                                  {eng.status === 'active' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStatus(eng.id, 'on_hold')}
                                      style={{ padding: '4px 8px', fontSize: 11 }}
                                    >
                                      Hold
                                    </Button>
                                  )}
                                  {eng.status !== 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStatus(eng.id, 'completed')}
                                      style={{ padding: '4px 8px', fontSize: 11, borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                                    >
                                      Finish
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                              No client contracts found matching your filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* Additional Consulting Resource & Cap Widget */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card style={{ padding: 24 }}>
                    <h4 className="mb-2 font-serif text-base font-semibold text-primary dark:text-white">
                      Weekly Capacity & Allocation
                    </h4>
                    <p className="text-text-muted mb-4 text-sm">
                      My target is capped at 40 billable hours per week to maintain quality and avoid fatigue.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-semibold">
                          <span>Architectural Delivery</span>
                          <span className="font-mono">75% capacity allocated</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                          <div className="h-full bg-accent" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-semibold">
                          <span>Strategic Advisory SLAs</span>
                          <span className="font-mono">20% capacity allocated</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                          <div className="h-full bg-primary dark:bg-accent/60" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-semibold">
                          <span>Open Availability</span>
                          <span className="font-mono">5% unallocated</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                          <div className="bg-success/60 h-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card style={{ padding: 24 }}>
                    <h4 className="mb-2 font-serif text-base font-semibold text-primary dark:text-white">
                      Founder&apos;s Advisory Note
                    </h4>
                    <p className="text-text-muted mb-4 text-sm">
                      Quiet authority is earned through consistent, direct technical excellence. I do not run offshore teams;
                      every system architecture block, code review, and performance audit is personally executed by me.
                    </p>
                    <blockquote style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: 16, margin: 0 }} className="text-text-muted text-sm italic">
                      &quot;I help growing companies streamline operations, optimize infrastructure cost, and adopt rigorous coding patterns.&quot;
                    </blockquote>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <Card style={{ padding: 24 }}>
                <h3 className="mb-2 font-serif text-lg font-medium text-primary dark:text-white">
                  My Core Consultancy Services
                </h3>
                <p className="text-text-muted mb-6 text-sm">
                  Bespoke, elite consultancy services tailored for expanding technology stacks.
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div style={{ border: '1px solid var(--color-border)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <span className="material-symbols-outlined text-accent" style={{ fontSize: 32 }}>architecture</span>
                    <h4 className="mt-3 mb-2 font-serif text-base font-semibold">Cloud System Architecture</h4>
                    <p className="text-text-muted text-xs">High-scale AWS/GCP setups using Terraform, Docker, and serverless runtime architectures.</p>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <span className="material-symbols-outlined text-accent" style={{ fontSize: 32 }}>speed</span>
                    <h4 className="mt-3 mb-2 font-serif text-base font-semibold">Performance Engineering</h4>
                    <p className="text-text-muted text-xs">Full-stack database query profiling, custom edge caching configurations, and API optimization.</p>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <span className="material-symbols-outlined text-accent" style={{ fontSize: 32 }}>security</span>
                    <h4 className="mt-3 mb-2 font-serif text-base font-semibold">Technical Due Diligence</h4>
                    <p className="text-text-muted text-xs">Strict cybersecurity audits, compliance reports, and architectural diligence for SaaS acquisitions.</p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card style={{ padding: 24 }}>
                <h3 className="mb-2 font-serif text-lg font-medium text-primary dark:text-white">
                  Contracts & Fiscal Invoicing
                </h3>
                <p className="text-text-muted mb-4 text-sm">
                  Electronic payments processed under standard Net-15 terms in Kuala Lumpur, Malaysia.
                </p>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Recipient Client</TableHead>
                        <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
                        <TableHead style={{ textAlign: 'center' }}>Fulfillment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">INV-2026-042</TableCell>
                        <TableCell>May 15, 2026</TableCell>
                        <TableCell className="font-semibold text-primary dark:text-white">Kuala Lumpur Tech Corp</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 32,000</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">INV-2026-041</TableCell>
                        <TableCell>May 01, 2026</TableCell>
                        <TableCell className="font-semibold text-primary dark:text-white">Sime Darby Retail</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 16,500</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">INV-2026-040</TableCell>
                        <TableCell>April 15, 2026</TableCell>
                        <TableCell className="font-semibold text-primary dark:text-white">Maybank Innovation</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 35,000</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </AdminLayout>
        </div>
      </section>

      <section className="docs-section mt-12">
        <h2 className="docs-section-title">Common UI Primitives</h2>
        <div className="flex flex-col gap-8">
          
          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Editorial Callout</h3>
            <Callout title="Key Takeaway" icon="bolt" variant="subtle">
              <ul>
                <li>UI primitives should be highly cohesive and loosely coupled.</li>
                <li>Design systems enforce consistency across micro-frontends.</li>
              </ul>
            </Callout>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Margin Note (Sidenote)</h3>
            <p className="text-sm text-(--color-text-main) leading-relaxed" style={{ maxWidth: 600 }}>
              When writing highly technical blog posts, we often need to reference external sources or explain a tangential concept without interrupting the main prose. Here is an example of a <MarginNote id="mn-1" note="This note appears in the margin on desktop and reflows inline on mobile devices.">Tufte-style margin note</MarginNote> in action.
            </p>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Vertical Tabs</h3>
            <Tabs orientation="vertical" defaultValue="tab1" className="flex min-h-[150px]">
              <TabsList variant="underline" className="w-48 shrink-0">
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Integrations</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="flex-1 mt-0">
                <p className="text-sm text-(--color-text-muted)">A vertical layout for tabs, commonly used for settings and large navigation rails.</p>
              </TabsContent>
              <TabsContent value="tab2" className="flex-1 mt-0">
                <p className="text-sm text-(--color-text-muted)">Webhook and API integrations configuration.</p>
              </TabsContent>
              <TabsContent value="tab3" className="flex-1 mt-0">
                <p className="text-sm text-(--color-text-muted)">User preferences and security settings.</p>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card style={{ padding: 24 }}>
              <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Revision Timeline</h3>
              <Timeline orientation="vertical">
                <TimelineItem>
                  <TimelineIndicator>
                    <Avatar size="xs" fallback="KM" />
                  </TimelineIndicator>
                  <TimelineContent>
                    <div className="text-sm font-semibold">v1.2.0 - Core Update</div>
                    <div className="text-xs text-(--color-text-muted)">Added timeline primitive.</div>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineIndicator isLast>
                    <Avatar size="xs" fallback="KM" />
                  </TimelineIndicator>
                  <TimelineContent>
                    <div className="text-sm font-semibold">v1.1.0 - Layouts</div>
                    <div className="text-xs text-(--color-text-muted)">Added admin sidebar layout.</div>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Table of Contents</h3>
              <TableOfContents
                activeId="sec2"
                items={[
                  { id: 'sec1', level: 2, title: 'Introduction to Web Architecture' },
                  { id: 'sec2', level: 2, title: 'Component Reusability' },
                  { id: 'sec2-1', level: 3, title: 'Extracting Primitives' },
                  { id: 'sec2-2', level: 3, title: 'Styling with CSS Variables' },
                  { id: 'sec3', level: 2, title: 'Conclusion' }
                ]}
              />
            </Card>
          </div>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Container Layout</h3>
            <div className="bg-surface/50 overflow-hidden rounded-md border border-dashed border-accent/50">
              <Container maxWidth="md" padding="default" className="bg-background text-center outline-1 outline-dashed outline-border">
                <p className="text-sm font-semibold text-text-muted">Content constrained to `md` (768px) inside the Container.</p>
              </Container>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Split Layout (Draggable)</h3>
            <div className="h-[250px] rounded-md border border-border">
              <SplitLayout orientation="horizontal">
                <SplitPanel defaultSize={30} minSize={20}>
                  <div className="flex h-full items-center justify-center bg-surface p-6">
                    <span className="text-sm font-medium text-text-muted">Sidebar</span>
                  </div>
                </SplitPanel>
                <SplitHandle withHandle />
                <SplitPanel defaultSize={70} minSize={30}>
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="text-sm font-medium text-text-main">Main Content Area</span>
                  </div>
                </SplitPanel>
              </SplitLayout>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-primary dark:text-white">Wizard Layout</h3>
            <p className="mb-4 text-sm text-(--color-text-muted)">A standardized multi-step flow supporting inline, fullscreen, and modal modes.</p>
            <Button onClick={() => { setWizardOpen(true); setWizardStep(0); }}>
              Launch Modal Wizard
            </Button>
            <WizardLayout
              mode="modal"
              isOpen={wizardOpen}
              onOpenChange={setWizardOpen}
              title="Cloud Infrastructure Provisioning"
              description="Configure the networking and compute resources."
              steps={[
                { label: 'Region', description: 'Select datacenter' },
                { label: 'Compute', description: 'Instance sizing' },
                { label: 'Review', description: 'Confirm costs' }
              ]}
              currentStep={wizardStep}
              onNext={() => setWizardStep(s => Math.min(2, s + 1))}
              onPrev={() => setWizardStep(s => Math.max(0, s - 1))}
              onFinish={() => { alert('Provisioned!'); setWizardOpen(false); }}
            >
              <div className="flex h-full flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-8">
                <p className="text-lg font-medium">Content for Step {wizardStep + 1}</p>
                <p className="text-sm text-text-muted mt-2">Interactive configuration forms would go here.</p>
              </div>
            </WizardLayout>
          </Card>

        </div>
      </section>
    </div>
  );
}
