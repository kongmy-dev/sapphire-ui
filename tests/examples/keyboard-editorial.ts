import { expect, type Page } from '@playwright/test';

async function marginReferences(page: Page) {
  const links = page.locator('#example .sp-margin-note-anchor');
  const notes = page.locator('#example .sp-margin-note-inline');
  await expect(links).toHaveCount(2);
  await expect(notes).toHaveCount(2);
  for (const link of await links.all()) {
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveAccessibleDescription(/.+/);
    await page.keyboard.press('Enter');
    const target = await link.getAttribute('href');
    if (!target) throw new Error('Missing note destination');
    await expect(page.locator(target)).toBeFocused();
  }
  const first = await notes.nth(0).boundingBox();
  const second = await notes.nth(1).boundingBox();
  if (!first || !second) throw new Error('Missing note geometry');
  expect(first.y + first.height).toBeLessThanOrEqual(second.y);
}

async function contentsLinks(page: Page) {
  const links = page.locator('#example .sp-toc-link');
  for (const link of await links.all()) {
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    const target = await link.getAttribute('href');
    await expect(page).toHaveURL((url) => url.hash === target);
  }
  const long = page.getByRole('link', {
    name: /^Requirements and implementation/,
  });
  if (await long.count()) {
    const lineHeight = await long.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).lineHeight),
    );
    const bounds = await long.boundingBox();
    if (!bounds) throw new Error('Missing contents link geometry');
    expect(bounds.height).toBeLessThanOrEqual(lineHeight * 2);
  }
}

async function proseContent(page: Page) {
  await expect(page.locator('#example ul')).toHaveCSS(
    'list-style-type',
    'disc',
  );
  await expect(page.locator('#example ol')).toHaveCSS(
    'list-style-type',
    'decimal',
  );
  const paragraphs = page.locator('#example p');
  const first = await paragraphs.nth(0).boundingBox();
  const second = await paragraphs.nth(1).boundingBox();
  if (!first || !second) throw new Error('Missing paragraph geometry');
  expect(second.y).toBeGreaterThan(first.y + first.height);
  await followLink(page, 'principles', '#principles');
}

async function followLink(page: Page, name: string, hash: string) {
  const link = page.getByRole('link', { name, exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL((url) => url.hash === hash);
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'margin-note/references': marginReferences,
  'table-of-contents/sections': contentsLinks,
  'table-of-contents/custom': contentsLinks,
  'prose/article': proseContent,
  'callout/notice': (page) => followLink(page, 'requirements', '#requirements'),
  'timeline/history': (page) =>
    followLink(page, 'Read kickoff notes', '#kickoff'),
  'document/proposal': (page) =>
    followLink(page, 'Review approval', '#approval'),
  'key-value-list/details': (page) =>
    followLink(page, 'Platform team', '#platform-team'),
};
