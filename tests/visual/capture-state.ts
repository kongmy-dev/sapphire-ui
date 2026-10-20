import type { Locator, Page } from '@playwright/test';
import { SPECIMEN_URL } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';

export async function captureState(
  target: Locator | Page,
  options: Parameters<Page['screenshot']>[0],
): Promise<Buffer> {
  const pixels = await target.screenshot(options);
  const page = 'page' in target ? target.page() : target;
  if (!page.url().startsWith(SPECIMEN_URL)) return pixels;
  const info = test.info();
  const index = info.annotations.filter(
    (item) => item.type === 'v4-state',
  ).length;
  info.annotations.push({ type: 'v4-state', description: String(index) });
  const name = info.title.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  expect
    .soft(pixels)
    .toMatchSnapshot(['states', name, `${index}.${info.project.name}.png`], {
      threshold: 0,
      maxDiffPixels: 0,
    });
  return pixels;
}
