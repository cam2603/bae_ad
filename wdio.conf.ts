import fs from 'node:fs';
import path from 'node:path';
import { env } from './config/env.js';
import { androidCapabilities } from './config/capabilities.js';
import { logger } from './src/utils/logger.js';

// Appium (chạy dưới dạng tiến trình con) kế thừa biến môi trường này để tìm adb.
process.env.ANDROID_HOME = env.androidHome;
process.env.ANDROID_SDK_ROOT = env.androidHome;

const ARTIFACT_DIR = path.resolve('artifacts');
const LOG_DIR = path.resolve('logs');

export const config: WebdriverIO.Config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: env.appiumPort,
  specs: ['./tests/**/*.spec.ts'],
  maxInstances: 1,
  capabilities: [androidCapabilities],

  logLevel: 'warn',
  outputDir: LOG_DIR,
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,

  services: [
    [
      'appium',
      {
        // Dùng Appium 3 cài global trên máy (đã kiểm tra: 3.7.0, uiautomator2@8.6.4).
        command: 'appium',
        args: { address: '127.0.0.1', port: env.appiumPort, logNoColors: true },
        logPath: LOG_DIR,
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  onPrepare() {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    fs.mkdirSync(LOG_DIR, { recursive: true });
  },

  beforeTest(test) {
    logger.info(`▶ ${test.parent} › ${test.title}`);
  },

  async afterTest(test, _context, { passed, error, duration }) {
    if (passed) {
      logger.info(`✔ PASS (${duration}ms): ${test.title}`);
      return;
    }
    logger.error(`✘ FAIL (${duration}ms): ${test.title} — ${error?.message ?? 'không rõ lỗi'}`);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const base = path.join(ARTIFACT_DIR, `${stamp}_${test.title.replace(/[^\w-]+/g, '_').slice(0, 60)}`);
    try {
      await browser.saveScreenshot(`${base}.png`);
      fs.writeFileSync(`${base}.xml`, await browser.getPageSource(), 'utf8');
      logger.info(`Đã lưu ảnh và page source: ${base}.png / .xml`);
    } catch (e) {
      logger.warn(`Không lưu được ảnh/page source: ${(e as Error).message}`);
    }
  },
};
