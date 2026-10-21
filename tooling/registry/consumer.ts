import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { exactDependencies } from './source.js';

export function writeConsumer(root: string, app: string, tarball: string) {
  const versions = exactDependencies(root, [
    'react',
    'react-dom',
    'typescript',
    '@types/react',
    '@types/react-dom',
    'vite',
    'tailwindcss',
    '@tailwindcss/vite',
  ]);
  const dependencies = Object.fromEntries(
    versions.map((entry) => {
      const at = entry.lastIndexOf('@');
      return [entry.slice(0, at), entry.slice(at + 1)];
    }),
  );
  dependencies['@kongmy-dev/sapphire-ui'] = tarball;
  const write = (path: string, value: string | object) =>
    writeFileSync(
      join(app, path),
      typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`,
    );
  mkdirSync(join(app, 'src'), { recursive: true });
  write('package.json', {
    name: 'sapphire-v4-consumer',
    private: true,
    type: 'module',
    dependencies,
    overrides: { '@kongmy-dev/sapphire-ui': tarball },
  });
  write('tsconfig.json', {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src'],
  });
  write(
    'vite.config.ts',
    "import tailwindcss from '@tailwindcss/vite'; import { defineConfig } from 'vite'; import { fileURLToPath } from 'node:url'; export default defineConfig({ plugins: [tailwindcss()], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } } });\n",
  );
  write(
    'index.html',
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Registry consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  write('src/index.css', '@import "tailwindcss";\n');
  write('src/main.tsx', 'export {};\n');
  write('src/vite-env.d.ts', 'import "vite/client";\n');
}

export function consumerSource(): string {
  return `import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { columnOrderingFeature, columnVisibilityFeature, createSortedRowModel, rowSortingFeature, sortFn_text, tableFeatures, useTable } from '@tanstack/react-table';
import { Card } from '@kongmy-dev/sapphire-ui/card';
import './index.css';
const features = tableFeatures({ rowSortingFeature, columnVisibilityFeature, columnOrderingFeature, sortedRowModel: createSortedRowModel() });
const columns = [{ accessorKey: 'name', sortFn: sortFn_text }, { accessorKey: 'fixed', enableSorting: false, enableHiding: false }, { id: 'actions' }];
const data = [{name: 'Zed', fixed: 'First'}, {name: 'Amy', fixed: 'Second'}];
function TableControls() {
  const table = useTable({features, columns, data});
  const column = table.getColumn('name');
  if (!column) throw new Error('Missing name column');
  return <section aria-label="Table controls"><DataTableColumnHeader column={column} title="Name" /><DataTableViewOptions table={table} /><output aria-label="Row order">{table.getRowModel().rows.map(row => row.original.name).join(',')}</output><output aria-label="Visible columns">{table.getVisibleLeafColumns().map(entry => entry.id).join(',')}</output></section>;
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<SidebarProvider><Sidebar><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton>Overview</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar><main><SidebarTrigger /><Card>Package card</Card><TableControls /><Dialog><DialogTrigger asChild><Button data-consumer-custom="true">Open dialog</Button></DialogTrigger><DialogContent><DialogTitle>Vendored dialog</DialogTitle></DialogContent></Dialog></main></SidebarProvider>);
`;
}
