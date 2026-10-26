import { env } from '../../config/env.js';
import { logger } from '../utils/logger.js';

// Android keycodes dùng trong dự án
export const KEYCODE = {
  DEL: 67,
  MOVE_END: 123,
} as const;

/** Chuẩn hóa Unicode: nhãn trong app lưu tiếng Việt dạng tổ hợp (NFD), cần đưa về NFC trước khi so sánh. */
export function nfc(text: string): string {
  return text.normalize('NFC');
}

function decodeXml(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export class BasePage {
  async pressKey(keycode: number, times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await driver.execute('mobile: pressKey', { keycode });
    }
  }

  async isKeyboardShown(): Promise<boolean> {
    return Boolean(await driver.execute('mobile: isKeyboardShown'));
  }

  async hideKeyboard(): Promise<void> {
    if (await this.isKeyboardShown()) {
      await driver.execute('mobile: hideKeyboard');
    }
  }

  /** Đóng hẳn rồi mở lại app. KHÔNG xóa dữ liệu, KHÔNG đăng xuất. */
  async relaunchApp(): Promise<void> {
    logger.step(`Đóng và mở lại ${env.appPackage}`);
    await driver.execute('mobile: terminateApp', { appId: env.appPackage });
    await driver.execute('mobile: activateApp', { appId: env.appPackage });
  }

  /**
   * Đọc Toast của Android. Toast chỉ hiện ~2 giây nên phải gọi ngay sau thao tác gây ra nó.
   * Trả về undefined nếu không thấy Toast trong khoảng timeout.
   *
   * Đọc từ page source thay vì $('//android.widget.Toast').getText(): Toast là phần tử ảo,
   * UiAutomator2 tìm thấy nhưng getText() sau đó báo "stale element reference" (đã kiểm chứng trong appium log).
   */
  async waitForToast(timeout = 5000): Promise<string | undefined> {
    let text: string | undefined;
    try {
      await browser.waitUntil(
        async () => {
          const source = await driver.getPageSource();
          const match = source.match(/<android\.widget\.Toast\b[^>]*\btext="([^"]*)"/);
          text = match ? decodeXml(match[1]) : undefined;
          return Boolean(text);
        },
        { timeout, interval: 200 },
      );
    } catch {
      logger.warn(`Không thấy Toast trong ${timeout}ms`);
    }
    if (text) logger.info(`Toast: "${text}"`);
    return text;
  }
}
