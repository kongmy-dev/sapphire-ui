import { useState, useRef } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SiteHeader, SiteHeaderLink } from '../components/ui/SiteHeader';
import { SiteFooter, SiteFooterGroup, SiteFooterLink } from '../components/ui/SiteFooter';
import { Layout } from '../components/ui/Layout';
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
import { Container } from '../components/ui/Container';
import { SplitLayout, SplitPanel, SplitHandle } from '../components/ui/SplitLayout';
import { WizardLayout } from '../components/ui/WizardLayout';
import { StatGroup } from '../components/ui/StatGroup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Toast, type ToastRef } from '../components/Toast';
import { BarChart } from '../components/ui/BarChart';
import { Sparkline } from '../components/ui/Sparkline';
import { Progress } from '../components/ui/Progress';
import { cn } from '../lib/utils';

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

export default function LayoutsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'billing' | 'metrics' | 'status'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold' | 'completed'>('all');
  const [engagements, setEngagements] = useState<Engagement[]>(initialEngagements);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const toastRef = useRef<ToastRef>(null);

  // Handle mock status changes
  const updateStatus = (id: string, newStatus: Engagement['status']) => {
    setEngagements(prev =>
      prev.map(eng => (eng.id === id ? { ...eng, status: newStatus } : eng))
    );
  };

  const filteredEngagements = engagements.filter(eng => {
    const matchesSearch =
      eng.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eng.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eng.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <header className="docs-page-header">
        <h1>Layouts</h1>
        <p>Structural page components for building applications, dashboards, and websites.</p>
      </header>

      {/* ─── AdminLayout ────────────────────────────────────────────── */}
      <section className="docs-section" style={{ borderTop: 'none' }}>
        <h2 className="docs-section-title">Admin Layout</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          A comprehensive administrative workbench layout system using full whitespace.
        </p>
        
        {/* Full whitespace container breaking out of docs padding */}
        <div className="-mx-4 mb-12 overflow-hidden border-y border-border md:-mx-8" style={{ height: '85vh', minHeight: 700 }}>
          <AdminLayout
            className="h-full min-h-0"
            sidebar={
              <AdminSidebar
                className="h-full"
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
                  <AdminSidebarLink 
                    icon="bar_chart" 
                    active={activeTab === 'metrics'} 
                    onClick={() => setActiveTab('metrics')} 
                    collapsed={collapsed} 
                    style={{ cursor: 'pointer' }}
                  >
                    Metrics & Analytics
                  </AdminSidebarLink>
                  <AdminSidebarLink 
                    icon="dns" 
                    active={activeTab === 'status'} 
                    onClick={() => setActiveTab('status')} 
                    collapsed={collapsed} 
                    style={{ cursor: 'pointer' }}
                  >
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
                      { label: activeTab === 'dashboard' ? 'Overview' : activeTab === 'services' ? 'Services' : activeTab === 'billing' ? 'Billing' : activeTab === 'metrics' ? 'Metrics' : 'Status' }
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
                        <DropdownMenuItem onSelect={() => toastRef.current?.show('Navigating to Profile Settings...', 'info')}>
                          Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toastRef.current?.show('Navigating to Support Tickets...', 'info')}>
                          Support Tickets
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => toastRef.current?.show('Log Out action triggered (mocked)', 'warning')} style={{ color: '#ef4444' }}>
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
                      <h3 className="m-0 font-serif text-lg font-medium text-(--color-text-strong)">
                        Current Consulting Engagements
                      </h3>
                      <p className="text-text-muted m-0 mt-1 text-sm">
                        I record client contracts, project scope categories, and active hourly metrics in real-time.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEngagements(initialEngagements); toastRef.current?.show('Consulting engagement data reset.', 'info'); }}>
                        Reset Data
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => toastRef.current?.show('Adding a new contract capability is mocked.', 'warning')}>
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
                              ? 'bg-(--color-text-strong) text-(--color-surface)'
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
                                  <div className="font-semibold text-(--color-text-strong)">{eng.client}</div>
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
              </div>
            )}
            
            {activeTab === 'services' && (
              <Card style={{ padding: 24 }}>
                <h3 className="mb-2 font-serif text-lg font-medium text-(--color-text-strong)">
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
                <h3 className="mb-2 font-serif text-lg font-medium text-(--color-text-strong)">
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
                        <TableCell className="font-semibold text-(--color-text-strong)">Kuala Lumpur Tech Corp</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 32,000</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">INV-2026-041</TableCell>
                        <TableCell>May 01, 2026</TableCell>
                        <TableCell className="font-semibold text-(--color-text-strong)">Sime Darby Retail</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 16,500</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">INV-2026-040</TableCell>
                        <TableCell>April 15, 2026</TableCell>
                        <TableCell className="font-semibold text-(--color-text-strong)">Maybank Innovation</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">RM 35,000</TableCell>
                        <TableCell style={{ textAlign: 'center' }}><Badge variant="success">Paid</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {activeTab === 'metrics' && (
              <Card style={{ padding: 24 }}>
                <h3 className="mb-2 font-serif text-lg font-medium text-(--color-text-strong)">
                  Metrics & Analytics
                </h3>
                <p className="text-text-muted mb-6 text-sm">
                  Monthly billable hours analysis and revenue breakdown.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <h4 className="font-sans text-sm font-semibold mb-4 text-(--color-text-strong)">Billable Hours (Last 6 Months)</h4>
                    <BarChart 
                      data={[45, 60, 35, 80, 55, 90]} 
                      labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']} 
                      height="12rem" 
                      tooltipSuffix="h"
                    />
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <h4 className="font-sans text-sm font-semibold mb-6 text-(--color-text-strong)">Revenue by Service Type</h4>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-(--color-text-strong)">Architecture</span>
                          <span className="font-mono font-medium text-accent">45%</span>
                        </div>
                        <Progress value={45} size="default" indicatorClassName="bg-accent" className="h-2.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-(--color-text-strong)">Advisory</span>
                          <span className="font-mono font-medium text-accent">35%</span>
                        </div>
                        <Progress value={35} size="default" indicatorClassName="bg-(--color-text-strong)" className="h-2.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-(--color-text-strong)">Delivery</span>
                          <span className="font-mono font-medium text-accent">20%</span>
                        </div>
                        <Progress value={20} size="default" indicatorClassName="bg-(--color-text-muted)" className="h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'status' && (
              <Card style={{ padding: 24 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="mb-1 font-serif text-lg font-medium text-(--color-text-strong)">
                      System Status Monitor
                    </h3>
                    <p className="text-text-muted m-0 text-sm">
                      Real-time uptime and incident tracking across all regions.
                    </p>
                  </div>
                  <Badge variant="success" className="px-3 py-1.5 shrink-0 self-start sm:self-auto border border-[var(--color-success)]/20">
                    <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                    All Systems Operational
                  </Badge>
                </div>
                
                <div className="space-y-6">
                  {[
                    { name: 'API Gateway', uptime: '99.99%', region: 'ap-southeast-1' },
                    { name: 'Authentication Services', uptime: '100%', region: 'global' },
                    { name: 'Database Clusters', uptime: '99.95%', region: 'ap-southeast-1' },
                  ].map((sys, idx) => (
                    <div key={idx} style={{ borderBottom: idx < 2 ? '1px solid var(--color-border)' : 'none', paddingBottom: idx < 2 ? '24px' : '0' }}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-(--color-text-strong)">{sys.name}</span>
                          <span className="text-[10px] text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded">{sys.region}</span>
                        </div>
                        <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-success)' }}>{sys.uptime} uptime</span>
                      </div>
                      <Sparkline 
                        height="2rem" 
                        data={Array.from({ length: 45 }).map(() => {
                          const isWarn = Math.random() > 0.96;
                          return {
                            status: isWarn ? 'warning' : 'success',
                            tooltip: isWarn ? 'Minor latency issues detected' : 'No downtime recorded'
                          }
                        })} 
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </AdminLayout>
        </div>
      </section>

      {/* ─── PageSection ────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">PageSection</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Consistent section wrapper with constrained width, optional label + heading + subheading.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden' }}>
          <PageSection
            label="01 — Services"
            heading="What we build"
            subheading="Cloud infrastructure, AI/ML pipelines, and custom software for growing businesses."
            maxWidth="full"
            style={{ padding: '2rem 1.5rem', background: 'var(--color-surface)' }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {['Cloud Ops', 'AI / ML', 'Web Apps'].map((t) => (
                <div key={t} className="rounded-md border border-border bg-card-bg p-6">
                  <span className="font-sans font-semibold text-text-strong">{t}</span>
                </div>
              ))}
            </div>
          </PageSection>
        </div>
      </section>

      {/* ─── Layout ─────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Layout</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Canonical page shell — composes SiteHeader, SiteFooter, and an optional sidebar slot.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <Layout
            style={{ minHeight: 360 }}
            header={
              <SiteHeader
                sticky={false}
                brand={
                  <>
                    <span className="font-serif text-lg font-bold">KONGMY</span>
                    <span className="font-sans text-lg font-light text-accent">dev</span>
                  </>
                }
                nav={
                  <>
                    <SiteHeaderLink href="#" active>Home</SiteHeaderLink>
                    <SiteHeaderLink href="#">Docs</SiteHeaderLink>
                  </>
                }
              />
            }
            footer={
              <SiteFooter
                brand={
                  <span className="font-sans text-sm text-(--color-text-on-dark-muted)">
                    © KONGMY Digital Solutions
                  </span>
                }
                bottom={<span>Built with Sapphire UI</span>}
              />
            }
          >
            <div style={{ padding: '2rem 1.5rem' }}>
              <h3 className="m-0 mb-2 font-serif text-xl font-semibold text-text-strong">
                Main content area
              </h3>
              <p className="m-0 font-sans text-sm text-(--color-text-muted)">
                Pages, routes, or any children render here between the header and footer slots.
              </p>
            </div>
          </Layout>
        </div>
      </section>

      {/* ─── SiteHeader ─────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">SiteHeader</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Composable sticky header with brand, nav, and actions slots.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <SiteHeader
            sticky={false}
            brand={
              <>
                <span className="font-serif text-lg font-bold">KONGMY</span>
                <span className="font-sans text-lg font-light text-accent">dev</span>
              </>
            }
            nav={
              <>
                <SiteHeaderLink href="#" active>Home</SiteHeaderLink>
                <SiteHeaderLink href="#">Services</SiteHeaderLink>
                <SiteHeaderLink href="#">Blog</SiteHeaderLink>
                <SiteHeaderLink href="#">Contact</SiteHeaderLink>
              </>
            }
            actions={
              <Button variant="on-dark-primary" size="sm">Get Started</Button>
            }
          />
        </div>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', marginTop: 12 }}>
          <SiteHeader
            sticky={false}
            variant="light"
            brand={
              <>
                <span className="font-serif text-lg font-bold">Cloud</span>
                <span className="font-sans text-lg font-light text-accent">Cost</span>
              </>
            }
            nav={
              <>
                <SiteHeaderLink href="#" variant="light" active>Dashboard</SiteHeaderLink>
                <SiteHeaderLink href="#" variant="light">Projects</SiteHeaderLink>
                <SiteHeaderLink href="#" variant="light">Settings</SiteHeaderLink>
              </>
            }
            actions={
              <Button variant="primary" size="sm">Sync</Button>
            }
          />
        </div>
      </section>

      {/* ─── SiteFooter ─────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">SiteFooter</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Composable footer with brand, link groups, and bottom bar slots.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <SiteFooter
            brand={
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-serif text-xl font-bold text-white">KONGMY</span>
                  <span className="font-sans text-xl font-light text-accent">dev</span>
                </div>
                <p className="m-0 font-sans text-sm/relaxed text-(--color-text-on-dark-muted)">
                  Helping businesses cut costs, automate operations, and build software that works.
                </p>
              </div>
            }
            links={
              <>
                <SiteFooterGroup title="Products">
                  <SiteFooterLink href="#">CloudCost</SiteFooterLink>
                  <SiteFooterLink href="#">Web Toolbox</SiteFooterLink>
                  <SiteFooterLink href="#">Sapphire UI</SiteFooterLink>
                </SiteFooterGroup>
                <SiteFooterGroup title="Resources">
                  <SiteFooterLink href="#">Blog</SiteFooterLink>
                  <SiteFooterLink href="#">Documentation</SiteFooterLink>
                  <SiteFooterLink href="#">GitHub</SiteFooterLink>
                </SiteFooterGroup>
                <SiteFooterGroup title="Legal">
                  <SiteFooterLink href="#">Privacy Policy</SiteFooterLink>
                  <SiteFooterLink href="#">Terms of Service</SiteFooterLink>
                </SiteFooterGroup>
              </>
            }
            bottom={
              <>
                <span>© 2024 KONGMY Digital Solutions</span>
                <span>Built with Sapphire UI</span>
              </>
            }
          />
        </div>
      </section>

      {/* ─── Split Layout ───────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Split Layout (Draggable)</h2>
        <div className="docs-preview">
          <div className="h-[250px] rounded-md border border-border">
            <SplitLayout orientation="horizontal">
              <SplitPanel defaultSize={30} minSize={20}>
                <div className="flex h-full items-center justify-center bg-surface p-6">
                  <span className="text-text-muted text-sm font-medium">Sidebar</span>
                </div>
              </SplitPanel>
              <SplitHandle withHandle />
              <SplitPanel defaultSize={70} minSize={30}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="text-text-main text-sm font-medium">Main Content Area</span>
                </div>
              </SplitPanel>
            </SplitLayout>
          </div>
        </div>
      </section>

      {/* ─── Wizard Layout ──────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Wizard Layout</h2>
        <p className="mb-4 text-sm text-(--color-text-muted)">A standardized multi-step flow supporting inline, fullscreen, and modal modes.</p>
        <div className="docs-preview">
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
            onFinish={() => { toastRef.current?.show('Cloud Infrastructure Provisioned Successfully!', 'success'); setWizardOpen(false); }}
          >
            <div className="flex h-full flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8">
              <p className="text-lg font-medium">Content for Step {wizardStep + 1}</p>
              <p className="text-text-muted mt-2 text-sm">Interactive configuration forms would go here.</p>
            </div>
          </WizardLayout>
        </div>
      </section>

      {/* ─── Container ──────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Container Layout</h2>
        <div className="docs-preview">
          <div className="overflow-hidden rounded-md border border-dashed border-accent/50 bg-surface/50">
            <Container maxWidth="md" padding="default" className="bg-background text-center outline-1 outline-border outline-dashed">
              <p className="text-text-muted text-sm font-semibold">Content constrained to `md` (768px) inside the Container.</p>
            </Container>
          </div>
        </div>
      </section>

      {/* ─── Vertical Tabs Layout ────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Vertical Tabs Layout</h2>
        <div className="docs-preview">
          <Card style={{ padding: 24, width: '100%' }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Vertical Tabs</h3>
            <Tabs orientation="vertical" defaultValue="tab1" className="flex min-h-[150px]">
              <TabsList variant="underline" className="w-24 sm:w-32 md:w-48 shrink-0">
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Integrations</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-0 flex-1 px-4 md:px-6">
                <p className="text-sm text-(--color-text-muted)">A vertical layout for tabs, commonly used for settings and large navigation rails.</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-0 flex-1 px-4 md:px-6">
                <p className="text-sm text-(--color-text-muted)">Webhook and API integrations configuration.</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-0 flex-1 px-4 md:px-6">
                <p className="text-sm text-(--color-text-muted)">User preferences and security settings.</p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      <Toast ref={toastRef} />
    </div>
  );
}
