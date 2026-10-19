import path from 'node:path';
import { expect, test, Page, Locator } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const STORAGE_STATE = process.env.PLAYWRIGHT_STORAGE_STATE;
const DOC_TITLE = process.env.VRT_DOC_TITLE ?? 'VRT Document';
const COLLECTION_TITLE = process.env.VRT_COLLECTION_TITLE ?? 'VRT Collection';

const stylePath = path.join(__dirname, 'screenshot.css');

test.describe.configure({ mode: 'serial' });

function absUrl(route: string) {
  return new URL(route, BASE_URL).toString();
}

async function gotoStable(page: Page, route: string) {
  await page.goto(absUrl(route), { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.mouse.move(0, 0);
}

async function hideHoverAndWait(page: Page) {
  await page.mouse.move(-1, -1);
  await page.waitForLoadState('networkidle');
}

async function snapshot(page: Page, name: string) {
  await hideHoverAndWait(page);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    stylePath,
    maxDiffPixels: 80,
    threshold: 0.1,
  });
}

async function clickFirstVisible(page: Page, candidates: Array<{ role: 'button' | 'link' | 'menuitem'; name: RegExp }>): Promise<boolean> {
  for (const candidate of candidates) {
    const loc = page.getByRole(candidate.role, { name: candidate.name }).first();
    if (await loc.count()) {
      await loc.click();
      return true;
    }
  }
  return false;
}

async function fillFirstVisible(page: Page, candidates: Array<{ role: 'textbox' | 'searchbox'; name?: RegExp; placeholder?: RegExp }>, value: string): Promise<boolean> {
  for (const candidate of candidates) {
    let loc: Locator | null = null;

    if (candidate.name) {
      loc = page.getByRole(candidate.role, { name: candidate.name }).first();
    } else if (candidate.placeholder) {
      loc = page.getByPlaceholder(candidate.placeholder).first();
    }

    if (loc && (await loc.count())) {
      await loc.fill(value);
      return true;
    }
  }
  return false;
}

async function getSidebarToggle(page: Page) {
  const candidates = [
    page.getByRole('button', { name: /Expand sidebar/i }),
    page.getByRole('button', { name: /Close pane/i }),
    page.getByRole('button', { name: /Expand/i }),
    page.getByRole('button', { name: /Collapse/i }),
  ];

  for (const loc of candidates) {
    if (await loc.count()) return loc.first();
  }

  throw new Error('Không tìm thấy nút sidebar.');
}

test('01-login-screen', async ({ page }) => {
  await gotoStable(page, '/login');
  await snapshot(page, '01-login-screen');
});

test.describe('authenticated visual regression', () => {
  test.use({ storageState: STORAGE_STATE });

  test('02-dashboard-home', async ({ page }) => {
    await gotoStable(page, '/home');
    await snapshot(page, '02-dashboard-home');
  });

  test('03-sidebar-expanded', async ({ page }) => {
    await gotoStable(page, '/home');

    const sidebarToggle = page.getByRole('button', {
      name: /Expand sidebar|Close pane|Expand|Collapse/i,
    }).first();

    if (await sidebarToggle.count()) {
      await sidebarToggle.click();
      await page.waitForLoadState('networkidle');
    }

    await snapshot(page, '03-sidebar-expanded');
  });

  test('04-documents-sidebar', async ({ page }) => {
    await gotoStable(page, '/home');

    const sidebarToggle = page.getByRole('button', {
      name: /Expand sidebar|Close pane|Expand|Collapse/i,
    }).first();

    if (await sidebarToggle.count()) {
      await sidebarToggle.click();
      await page.waitForLoadState('networkidle');
    }

    await snapshot(page, '04-documents-sidebar');
  });

  test('05-document-editor-view', async ({ page }) => {
    await gotoStable(page, '/home');

    const candidates = [
      page.getByRole('link', { name: /VRT Document/i }),
      page.getByRole('link', { name: /Untitled/i }),
      page.getByRole('link', { name: /Document/i }),
      page.getByRole('link', { name: /Documents/i }),
    ];

    for (const candidate of candidates) {
      if (await candidate.count()) {
        await candidate.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        break;
      }
    }

    await snapshot(page, '05-document-editor-view');
  });

  test('06-editor-content', async ({ page }) => {
    await gotoStable(page, '/home');

    const opened = await clickFirstVisible(page, [
      { role: 'link', name: /VRT Document/i },
      { role: 'link', name: /Untitled/i },
      { role: 'link', name: /Document/i },
      { role: 'link', name: /Documents/i },
    ]);

    if (opened) {
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    const editor = page.locator('[aria-label="Editor content"]');
    if (await editor.count()) {
      await editor.click().catch(() => {});
    }

    await snapshot(page, '06-editor-content');
  });

  test('07-share-dialog', async ({ page }) => {
    await gotoStable(page, '/home');

    const opened = await clickFirstVisible(page, [
      { role: 'link', name: /VRT Document/i },
      { role: 'link', name: /Untitled/i },
      { role: 'link', name: /Document/i },
      { role: 'link', name: /Documents/i },
    ]);

    if (opened) {
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    const shareButton = page.getByRole('button', { name: /^Share$/i }).first();
    if (await shareButton.count()) {
      await shareButton.click().catch(() => {});
    }

    await snapshot(page, '07-share-dialog');
  });

  test('08-search-results', async ({ page }) => {
    await gotoStable(page, '/search');
    await snapshot(page, '08-search-results');
  });

  test('09-comment-thread', async ({ page }) => {
    await gotoStable(page, '/home');

    const opened = await clickFirstVisible(page, [
      { role: 'link', name: /VRT Document/i },
      { role: 'link', name: /Untitled/i },
      { role: 'link', name: /Document/i },
      { role: 'link', name: /Documents/i },
    ]);

    if (opened) {
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    const commentThreadButton = page.getByRole('button', {
      name: /View comment thread/i,
    }).first();

    if (await commentThreadButton.count()) {
      await commentThreadButton.click().catch(() => {});
    }

    await snapshot(page, '09-comment-thread');
  });

  test('10-notifications-popover', async ({ page }) => {
    await gotoStable(page, '/home');

    const notificationsButton = page.getByRole('button', {
      name: /Notifications/i,
    }).first();

    if (await notificationsButton.count()) {
      await notificationsButton.click().catch(() => {});
    }

    await snapshot(page, '10-notifications-popover');
  });
});