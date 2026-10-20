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
}

export function consumerSource(): string {
  return `import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card } from '@kongmy-dev/sapphire-ui/card';
import './index.css';
const root = document.getElementById('root');
if (root) createRoot(root).render(<SidebarProvider><Sidebar><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton>Overview</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar><main><SidebarTrigger /><Card>Package card</Card><Dialog><DialogTrigger asChild><Button data-consumer-custom="true">Open dialog</Button></DialogTrigger><DialogContent><DialogTitle>Vendored dialog</DialogTitle></DialogContent></Dialog></main></SidebarProvider>);
`;
}
