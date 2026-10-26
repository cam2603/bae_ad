import { BasePage } from './BasePage.js';

/**
 * Màn Trang chủ sau khi đăng nhập. Chỉ khai báo những gì cần để xác nhận đăng nhập thành công.
 * Đã xác minh: thanh tab dưới có content-desc "Selected Trang chủ", "Chuyến hàng", "Đơn hàng", "Giám sát", "Tài khoản".
 */
export class HomePage extends BasePage {
  get homeTab() { return $('android=new UiSelector().descriptionContains("Trang chủ")'); }
  get accountTab() { return $('~Tài khoản'); }

  async waitForDisplayed(timeout = 20000): Promise<void> {
    await this.homeTab.waitForDisplayed({ timeout, timeoutMsg: 'Không thấy màn Trang chủ sau khi đăng nhập' });
  }

  async isHomeTabSelected(): Promise<boolean> {
    return ((await this.homeTab.getAttribute('content-desc')) ?? '').startsWith('Selected');
  }
}

export const homePage = new HomePage();
