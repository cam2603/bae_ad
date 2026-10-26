import { BasePage, KEYCODE, nfc } from './BasePage.js';
import { logger } from '../utils/logger.js';

/**
 * Màn Đăng nhập — BAExpress Admin (bản Test.6.10.190).
 *
 * App viết bằng .NET MAUI, KHÔNG có resource-id/AutomationId. Locator dưới đây
 * đã được xác minh qua Appium page source ngày 26/10/2026:
 *  - Ô nhập: định danh bằng thuộc tính `hint` (ổn định hơn so với nhãn).
 *  - Nhãn: text lưu dạng NFD nên không so khớp trực tiếp bằng XPath; lấy theo vị trí tương đối với ô nhập.
 *  - Nút ĐĂNG NHẬP: TextView không clickable, phần tử nhận chạm là ViewGroup cha.
 */
export const HINT = {
  username: 'Số điện thoại hoặc tài khoản',
  password: 'Mật khẩu',
} as const;

const SEL = {
  usernameInput: `//android.widget.EditText[@hint='${HINT.username}']`,
  passwordInput: `//android.widget.EditText[@hint='${HINT.password}']`,
  usernameLabel: `//android.widget.EditText[@hint='${HINT.username}']/../../preceding-sibling::android.widget.TextView`,
  passwordLabel: `//android.widget.EditText[@hint='${HINT.password}']/../../preceding-sibling::android.widget.TextView`,
  eyeToggle: `//android.widget.EditText[@hint='${HINT.password}']/following-sibling::android.view.ViewGroup`,
  autoLoginCheckbox: 'android=new UiSelector().descriptionStartsWith("Tự động đăng nhập")',
  forgotPassword: 'android=new UiSelector().text("Quên mật khẩu?")',
  loginButton: `//android.widget.TextView[@text='ĐĂNG NHẬP']/..`,
  loginButtonText: 'android=new UiSelector().text("ĐĂNG NHẬP")',
  versionText: 'android=new UiSelector().textStartsWith("Version:")',
  // Dialog lỗi đăng nhập (quan sát khi tài khoản không đúng)
  dialogTitle: 'android=new UiSelector().text("Thông báo")',
  dialogOkButton: 'android=new UiSelector().text("Đồng ý")',
} as const;

export class LoginPage extends BasePage {
  get usernameInput() { return $(SEL.usernameInput); }
  get passwordInput() { return $(SEL.passwordInput); }
  get usernameLabel() { return $(SEL.usernameLabel); }
  get passwordLabel() { return $(SEL.passwordLabel); }
  get eyeToggle() { return $(SEL.eyeToggle); }
  get autoLoginCheckbox() { return $(SEL.autoLoginCheckbox); }
  get forgotPasswordLink() { return $(SEL.forgotPassword); }
  get loginButton() { return $(SEL.loginButton); }
  get loginButtonText() { return $(SEL.loginButtonText); }
  get versionText() { return $(SEL.versionText); }
  get dialogTitle() { return $(SEL.dialogTitle); }
  get dialogOkButton() { return $(SEL.dialogOkButton); }

  async waitForDisplayed(timeout = 20000): Promise<void> {
    await this.passwordInput.waitForDisplayed({ timeout, timeoutMsg: 'Không thấy màn Đăng nhập' });
  }

  /** Đưa app về màn Login bằng cách mở lại app (đã xác minh: app quay về Login khi "Tự động đăng nhập" không được chọn). */
  async open(): Promise<void> {
    await this.relaunchApp();
    await this.waitForDisplayed();
  }

  async getLabelText(field: 'username' | 'password'): Promise<string> {
    const el = field === 'username' ? this.usernameLabel : this.passwordLabel;
    return nfc(await el.getText());
  }

  /**
   * Giá trị đang nhập. Android trả về chuỗi hint khi ô trống, nên quy đổi về ''.
   * Với ô mật khẩu đang che, giá trị là các ký tự "•".
   */
  async getValue(field: 'username' | 'password'): Promise<string> {
    const el = field === 'username' ? this.usernameInput : this.passwordInput;
    const text = await el.getText();
    return text === HINT[field] ? '' : text;
  }

  async isPasswordMasked(): Promise<boolean> {
    return (await this.passwordInput.getAttribute('password')) === 'true';
  }

  async isAutoLoginTicked(): Promise<boolean> {
    const desc = (await this.autoLoginCheckbox.getAttribute('content-desc')) ?? '';
    return !desc.includes('Not Ticked');
  }

  /**
   * Xóa nội dung ô nhập bằng phím DEL.
   * Lý do: element.clearValue() của Appium KHÔNG xóa được ô nhập MAUI của app này (đã kiểm chứng).
   */
  async clearField(field: 'username' | 'password'): Promise<void> {
    const el = field === 'username' ? this.usernameInput : this.passwordInput;
    await el.click();
    await this.pressKey(KEYCODE.MOVE_END);
    for (let round = 0; round < 8 && (await this.getValue(field)) !== ''; round++) {
      await this.pressKey(KEYCODE.DEL, 10);
    }
    const remaining = await this.getValue(field);
    if (remaining !== '') {
      throw new Error(`Không xóa được ô ${field}, còn lại: "${remaining}"`);
    }
  }

  async typeInto(field: 'username' | 'password', value: string): Promise<void> {
    const el = field === 'username' ? this.usernameInput : this.passwordInput;
    await el.click();
    await el.addValue(value);
  }

  /** Xóa rồi nhập. Truyền '' để để trống ô. Không ghi giá trị mật khẩu ra log. */
  async fill(username: string, password: string): Promise<void> {
    logger.step(`Nhập tài khoản: "${username}", mật khẩu: ${password ? `(${password.length} ký tự)` : '(trống)'}`);
    await this.clearField('username');
    if (username) await this.typeInto('username', username);
    await this.clearField('password');
    if (password) await this.typeInto('password', password);
    await this.hideKeyboard();
  }

  async tapLogin(): Promise<void> {
    logger.step('Bấm ĐĂNG NHẬP');
    await this.loginButton.click();
  }

  async toggleEye(): Promise<void> {
    await this.eyeToggle.click();
  }

  async dismissDialog(): Promise<void> {
    if (await this.dialogOkButton.isExisting()) {
      await this.dialogOkButton.click();
    }
  }
}

export const loginPage = new LoginPage();
