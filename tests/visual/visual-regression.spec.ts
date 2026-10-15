// tests/visual-regression.spec.ts
// Bộ test Visual Regression cho 8 màn hình.
// Ý tưởng:
// 1) Mở từng màn hình ở trạng thái ổn định.
// 2) Chụp ảnh baseline lần đầu.
// 3) Những lần sau so sánh với baseline.
// 4) Nếu thay đổi là chủ đích => update snapshot.
// 5) Nếu thay đổi không mong muốn => coi là regression.

import { expect, test, type Page } from '@playwright/test';

type ScreenCase = {
  // Tên test hiển thị trong report.
  name: string;

  // Route cần kiểm thử.
  path: string;

  // Selector đại diện cho trạng thái "đã load xong".
  readySelector: string;

  // Ghi chú nghiệp vụ để team biết đây là màn hình nào.
  note: string;
};

// Danh sách các màn hình.
// Bạn đổi route/selector theo Outline thực tế.
const screens: ScreenCase[] = [
  {
    name: '01-login',
    path: '/login',
    readySelector: '[data-testid="login-form"]',
    note: 'Màn hình đăng nhập',
  },
  {
    name: '02-dashboard',
    path: '/home',
    readySelector: '[data-testid="dashboard"]',
    note: 'Trang tổng quan / home',
  },
  {
    name: '03-document-list',
    path: '/documents',
    readySelector: '[data-testid="documents-list"]',
    note: 'Danh sách tài liệu',
  },
  {
    name: '04-document-editor',
    path: '/documents/new',
    readySelector: '[data-testid="document-editor"]',
    note: 'Trình soạn thảo tài liệu',
  },
  {
    name: '05-document-detail',
    path: '/documents/example',
    readySelector: '[data-testid="document-detail"]',
    note: 'Chi tiết một tài liệu',
  },
  {
    name: '06-search-results',
    path: '/search?q=outline',
    readySelector: '[data-testid="search-results"]',
    note: 'Kết quả tìm kiếm',
  },
  {
    name: '07-share-permission',
    path: '/share/example',
    readySelector: '[data-testid="share-modal"]',
    note: 'Chia sẻ / phân quyền',
  },
  {
    name: '08-settings',
    path: '/settings/account',
    readySelector: '[data-testid="settings-account"]',
    note: 'Cài đặt tài khoản',
  },
];

// Hàm mở 1 màn hình ở trạng thái ổn định.
async function openStableScreen(page: Page, path: string, readySelector: string) {
  // Ghép route tương đối với baseURL trong config.
  const url = new URL(path, process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000').toString();

  // Điều hướng tới trang cần chụp.
  await page.goto(url, { waitUntil: 'networkidle' });

  // Chờ phần tử chính xuất hiện để đảm bảo giao diện đã render xong.
  await page.locator(readySelector).waitFor({ state: 'visible' });

  // Né hover state để ảnh không bị thay đổi do con trỏ.
  await page.mouse.move(-1, -1);

  // Nếu trang có toast/loading tự bật, đóng hoặc chờ nó biến mất trước khi chụp.
  await page.locator('[data-testid="toast"]').waitFor({ state: 'hidden' }).catch(() => {});
}


test.describe('Visual Regression Testing', () => {
  // Chạy từng màn hình như một test độc lập.
  for (const screen of screens) {
    test(`${screen.name} - ${screen.note}`, async ({ page }) => {
      await openStableScreen(page, screen.path, screen.readySelector);

      // So sánh ảnh hiện tại với baseline.
      // Lần đầu chạy: Playwright sẽ tạo reference screenshot.
      // Lần sau: Playwright sẽ so sánh với reference.
      await expect(page).toHaveScreenshot(`${screen.name}.png`);
    });
  }
});