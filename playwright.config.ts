// playwright.config.ts
// Cấu hình chung cho Visual Regression Testing.
// Mục tiêu: ảnh ổn định, baseline dễ so sánh, giảm nhiễu do render.

import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  // Thư mục chứa các file test.
  testDir: './tests',

  // Tăng timeout để tránh fail khi app khởi động chậm.
  timeout: 60_000,

  // Có thể chạy song song; visual test thường ổn nếu mỗi test đi vào 1 route riêng.
  fullyParallel: true,

  // Cấu hình browser mặc định.
  use: {
    // Base URL của app local. Đổi lại nếu app chạy ở cổng khác.
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',

    // Cố định viewport để baseline không bị thay đổi theo kích thước cửa sổ.
    viewport: { width: 1440, height: 1024 },

    // Dùng 1x để giảm khác biệt do scale.
    deviceScaleFactor: 1,

    // Nếu UI có biến động nhỏ, trace giúp debug nhanh khi test fail.
    trace: 'on-first-retry',
  },

  // Thiết lập chung cho so sánh ảnh.
  expect: {
    toHaveScreenshot: {
      // Chỉ cho phép lệch nhỏ do anti-aliasing/font rendering.
      threshold: 0.2,

      // Giới hạn số pixel khác nhau để tránh false positive.
      maxDiffPixels: 50,

      // CSS này sẽ ẩn phần tử động như clock, iframe, video...
      stylePath: path.join(__dirname, 'tests', 'screenshot.css'),
    },
  },

  // ... other configs
  webServer: {
    command: 'yarn dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 180000,
  },

  // Có thể thêm reporter nếu muốn xuất báo cáo HTML.
  reporter: [['list'], ['html']],
});