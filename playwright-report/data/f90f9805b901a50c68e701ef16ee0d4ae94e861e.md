# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual\visual-regression.spec.ts >> Visual Regression Testing >> 04-document-editor - Trình soạn thảo tài liệu
- Location: tests\visual\visual-regression.spec.ts:101:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/documents/new
Call log:
  - navigating to "http://127.0.0.1:3000/documents/new", waiting until "networkidle"

```

# Test source

```ts
  1   | // tests/visual-regression.spec.ts
  2   | // Bộ test Visual Regression cho 8 màn hình.
  3   | // Ý tưởng:
  4   | // 1) Mở từng màn hình ở trạng thái ổn định.
  5   | // 2) Chụp ảnh baseline lần đầu.
  6   | // 3) Những lần sau so sánh với baseline.
  7   | // 4) Nếu thay đổi là chủ đích => update snapshot.
  8   | // 5) Nếu thay đổi không mong muốn => coi là regression.
  9   | 
  10  | import { expect, test, type Page } from '@playwright/test';
  11  | 
  12  | type ScreenCase = {
  13  |   // Tên test hiển thị trong report.
  14  |   name: string;
  15  | 
  16  |   // Route cần kiểm thử.
  17  |   path: string;
  18  | 
  19  |   // Selector đại diện cho trạng thái "đã load xong".
  20  |   readySelector: string;
  21  | 
  22  |   // Ghi chú nghiệp vụ để team biết đây là màn hình nào.
  23  |   note: string;
  24  | };
  25  | 
  26  | // Danh sách các màn hình.
  27  | // Bạn đổi route/selector theo Outline thực tế.
  28  | const screens: ScreenCase[] = [
  29  |   {
  30  |     name: '01-login',
  31  |     path: '/login',
  32  |     readySelector: '[data-testid="login-form"]',
  33  |     note: 'Màn hình đăng nhập',
  34  |   },
  35  |   {
  36  |     name: '02-dashboard',
  37  |     path: '/home',
  38  |     readySelector: '[data-testid="dashboard"]',
  39  |     note: 'Trang tổng quan / home',
  40  |   },
  41  |   {
  42  |     name: '03-document-list',
  43  |     path: '/documents',
  44  |     readySelector: '[data-testid="documents-list"]',
  45  |     note: 'Danh sách tài liệu',
  46  |   },
  47  |   {
  48  |     name: '04-document-editor',
  49  |     path: '/documents/new',
  50  |     readySelector: '[data-testid="document-editor"]',
  51  |     note: 'Trình soạn thảo tài liệu',
  52  |   },
  53  |   {
  54  |     name: '05-document-detail',
  55  |     path: '/documents/example',
  56  |     readySelector: '[data-testid="document-detail"]',
  57  |     note: 'Chi tiết một tài liệu',
  58  |   },
  59  |   {
  60  |     name: '06-search-results',
  61  |     path: '/search?q=outline',
  62  |     readySelector: '[data-testid="search-results"]',
  63  |     note: 'Kết quả tìm kiếm',
  64  |   },
  65  |   {
  66  |     name: '07-share-permission',
  67  |     path: '/share/example',
  68  |     readySelector: '[data-testid="share-modal"]',
  69  |     note: 'Chia sẻ / phân quyền',
  70  |   },
  71  |   {
  72  |     name: '08-settings',
  73  |     path: '/settings/account',
  74  |     readySelector: '[data-testid="settings-account"]',
  75  |     note: 'Cài đặt tài khoản',
  76  |   },
  77  | ];
  78  | 
  79  | // Hàm mở 1 màn hình ở trạng thái ổn định.
  80  | async function openStableScreen(page: Page, path: string, readySelector: string) {
  81  |   // Ghép route tương đối với baseURL trong config.
  82  |   const url = new URL(path, process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000').toString();
  83  | 
  84  |   // Điều hướng tới trang cần chụp.
> 85  |   await page.goto(url, { waitUntil: 'networkidle' });
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/documents/new
  86  | 
  87  |   // Chờ phần tử chính xuất hiện để đảm bảo giao diện đã render xong.
  88  |   await page.locator(readySelector).waitFor({ state: 'visible' });
  89  | 
  90  |   // Né hover state để ảnh không bị thay đổi do con trỏ.
  91  |   await page.mouse.move(-1, -1);
  92  | 
  93  |   // Nếu trang có toast/loading tự bật, đóng hoặc chờ nó biến mất trước khi chụp.
  94  |   await page.locator('[data-testid="toast"]').waitFor({ state: 'hidden' }).catch(() => {});
  95  | }
  96  | 
  97  | 
  98  | test.describe('Visual Regression Testing', () => {
  99  |   // Chạy từng màn hình như một test độc lập.
  100 |   for (const screen of screens) {
  101 |     test(`${screen.name} - ${screen.note}`, async ({ page }) => {
  102 |       await openStableScreen(page, screen.path, screen.readySelector);
  103 | 
  104 |       // So sánh ảnh hiện tại với baseline.
  105 |       // Lần đầu chạy: Playwright sẽ tạo reference screenshot.
  106 |       // Lần sau: Playwright sẽ so sánh với reference.
  107 |       await expect(page).toHaveScreenshot(`${screen.name}.png`);
  108 |     });
  109 |   }
  110 | });
```