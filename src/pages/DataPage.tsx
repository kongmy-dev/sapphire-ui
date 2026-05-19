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
    </div>
  );
}
