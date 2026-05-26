import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { AvatarGroup } from '../components/ui/AvatarGroup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Separator } from '../components/ui/Separator';
import { Stat } from '../components/ui/Stat';
import { Chip } from '../components/ui/Chip';
import { Pagination } from '../components/ui/Pagination';
import { BarChart } from '../components/ui/BarChart';
import { Sparkline } from '../components/ui/Sparkline';
import { Progress } from '../components/ui/Progress';

// 'dark' is excluded — it ships near-white text intended for dark backgrounds
// and is showcased separately in the dark preview row below.
const badgeVariants = ['default', 'accent', 'success', 'error', 'warning', 'info'] as const;

export default function DataPage() {
  const [page, setPage] = useState(3);
  return (
    <div>
      <header className="docs-page-header">
        <h1>Data Display</h1>
        <p>Components for presenting data: tables, tabs, badges, avatars, and separators.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Badge</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            {badgeVariants.map((v) => (
              <Badge key={v} variant={v}>{v}</Badge>
            ))}
          </div>
        </div>
        <div className="docs-preview docs-preview--dark" style={{ marginTop: 12 }}>
          <div className="docs-flex">
            <Badge variant="dark">On Dark</Badge>
            <Badge variant="accent">Accent</Badge>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Avatar</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            <Avatar size="xs" fallback="KM" />
            <Avatar size="sm" fallback="KM" />
            <Avatar size="md" fallback="KM" />
            <Avatar size="lg" fallback="KM" />
            <Avatar size="lg" src="https://avatars.githubusercontent.com/u/1?v=4" alt="GitHub User" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Avatar Group</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <AvatarGroup>
              <Avatar fallback="AB" />
              <Avatar fallback="CD" />
              <Avatar fallback="EF" />
            </AvatarGroup>
            <AvatarGroup max={3}>
              <Avatar fallback="AB" />
              <Avatar fallback="CD" />
              <Avatar fallback="EF" />
              <Avatar fallback="GH" />
              <Avatar fallback="IJ" />
              <Avatar fallback="KL" />
            </AvatarGroup>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Stat</h2>
        <div className="docs-preview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
            <Stat label="Active users" value="12,438" change="+12%" changeDirection="up" />
            <Stat label="Monthly cost" value="$428.50" change="-3%" changeDirection="down" />
            <Stat label="Uptime" value="99.97%" description="last 30 days" />
            <Stat label="API calls" value="2.1M" change="0%" changeDirection="neutral" size="sm" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Chip</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ flexWrap: 'wrap' }}>
            <Chip>Default</Chip>
            <Chip variant="accent">Accent</Chip>
            <Chip variant="outline">Outline</Chip>
            <Chip onDismiss={() => {}}>Removable</Chip>
            <Chip variant="accent" onDismiss={() => {}} leading={<span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />}>
              With leading
            </Chip>
            <Chip size="sm">Small</Chip>
            <Chip size="lg">Large</Chip>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Pagination</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
            <Pagination currentPage={page} totalPages={12} onPageChange={setPage} hideControls />
            <Pagination currentPage={page} totalPages={5} onPageChange={setPage} siblings={2} />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Tabs</h2>
        <div className="docs-preview">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: 14, padding: 12 }}>
                Overview content — summary dashboard with key metrics and recent activity.
              </p>
            </TabsContent>
            <TabsContent value="accounts">
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: 14, padding: 12 }}>
                Manage connected cloud provider accounts and API credentials.
              </p>
            </TabsContent>
            <TabsContent value="settings">
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: 14, padding: 12 }}>
                Application settings including currency, timezone, and notification preferences.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Table</h2>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Workers</TableCell>
                <TableCell>Cloudflare</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
                <TableCell style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$12.50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Cloud Run</TableCell>
                <TableCell>GCP</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
                <TableCell style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$45.80</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>S3</TableCell>
                <TableCell>AWS</TableCell>
                <TableCell><Badge variant="warning">Idle</Badge></TableCell>
                <TableCell style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$3.20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Separator</h2>
        <div className="docs-preview">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-main)' }}>
            <p>Content above the separator</p>
            <Separator style={{ margin: '16px 0' }} />
            <p>Content below the separator</p>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">BarChart</h2>
        <div className="docs-preview">
          <BarChart 
            data={[45, 60, 35, 80, 55, 90]} 
            labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']} 
            height="12rem" 
            tooltipSuffix="h"
          />
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Sparkline</h2>
        <div className="docs-preview">
          <Sparkline 
            height="2rem" 
            data={Array.from({ length: 45 }).map((_, i) => {
              const isWarn = i === 12 || i === 13 || i === 29;
              return {
                status: isWarn ? 'warning' : 'success',
                tooltip: isWarn ? 'Minor latency issues detected' : 'No downtime recorded'
              }
            })} 
          />
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Progress</h2>
        <div className="docs-preview">
          <div className="docs-stack w-full max-w-[400px]" style={{ gap: 24, width: '100%', maxWidth: 400 }}>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-(--color-text-strong)">Architecture</span>
                <span className="font-mono font-medium text-(--color-text-strong)">45%</span>
              </div>
              <Progress value={45} size="default" indicatorClassName="bg-accent" aria-label="Architecture progress" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-(--color-text-strong)">Advisory</span>
                <span className="font-mono font-medium text-(--color-text-strong)">35%</span>
              </div>
              <Progress value={35} size="default" indicatorClassName="bg-(--color-text-strong)" aria-label="Advisory progress" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-(--color-text-strong)">Delivery</span>
                <span className="font-mono font-medium text-(--color-text-strong)">20%</span>
              </div>
              <Progress value={20} size="default" indicatorClassName="bg-(--color-text-muted)" aria-label="Delivery progress" />
            </div>
          </div>
        </div>
      </section>
      <section className="docs-section">
        <h2 className="docs-section-title">Props</h2>
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Badge</h3>
        <table className="docs-props-table mb-8">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>&apos;default&apos; | &apos;accent&apos; | &apos;dark&apos; | &apos;success&apos; | &apos;error&apos; | &apos;warning&apos; | &apos;info&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
          </tbody>
        </table>
        
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Chip</h3>
        <table className="docs-props-table mb-8">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>&apos;default&apos; | &apos;accent&apos; | &apos;outline&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
            <tr><td><code>size</code></td><td><code>&apos;sm&apos; | &apos;default&apos; | &apos;lg&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
            <tr><td><code>onDismiss</code></td><td><code>() =&gt; void</code></td><td>—</td></tr>
            <tr><td><code>leading</code></td><td><code>ReactNode</code></td><td>—</td></tr>
          </tbody>
        </table>
        
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Progress</h3>
        <table className="docs-props-table">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>value</code></td><td><code>number</code></td><td><code>0</code></td></tr>
            <tr><td><code>size</code></td><td><code>&apos;sm&apos; | &apos;default&apos; | &apos;lg&apos;</code></td><td><code>&apos;default&apos;</code></td></tr>
            <tr><td><code>showLabel</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
            <tr><td><code>indicatorClassName</code></td><td><code>string</code></td><td>—</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
