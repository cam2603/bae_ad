import { expect } from '@wdio/globals';
import { loginPage } from '../src/pages/LoginPage.js';
import { homePage } from '../src/pages/HomePage.js';
import { logger } from '../src/utils/logger.js';
import { DUMMY, INVALID_ACCOUNT, LOGIN_MESSAGES, LOGIN_UI, VALID_ACCOUNT } from '../test-data/login.data.js';

/**
 * Mỗi test bắt đầu bằng việc mở lại app để về màn Login.
 * Không xóa dữ liệu app, không đăng xuất. Đã xác minh: thông tin đăng nhập đã lưu
 * vẫn còn sau khi mở lại app, kể cả khi test trước đã xóa ô hoặc đăng nhập sai.
 */
describe('Đăng nhập — BAExpress Admin', () => {
  beforeEach(async () => {
    await loginPage.open();
  });

  after(async () => {
    // Đưa app về màn Login cho trạng thái sau cùng dễ đoán.
    await loginPage.open();
  });

  it('LOGIN-001: Kiểm tra giao diện đăng nhập @ui', async () => {
    // Mục tiêu: các thành phần chính hiển thị đúng nhãn/hint, ô mật khẩu được che.
    expect(await loginPage.getLabelText('username')).toBe(LOGIN_UI.usernameLabel);
    expect(await loginPage.getLabelText('password')).toBe(LOGIN_UI.passwordLabel);

    await expect(loginPage.usernameInput).toBeDisplayed();
    await expect(loginPage.passwordInput).toBeDisplayed();
    expect(await loginPage.usernameInput.getAttribute('hint')).toBe(LOGIN_UI.usernameHint);
    expect(await loginPage.passwordInput.getAttribute('hint')).toBe(LOGIN_UI.passwordHint);
    expect(await loginPage.isPasswordMasked()).toBe(true);

    await expect(loginPage.eyeToggle).toBeDisplayed();
    await expect(loginPage.autoLoginCheckbox).toBeDisplayed();
    await expect(loginPage.forgotPasswordLink).toBeDisplayed();
    await expect(loginPage.loginButton).toBeDisplayed();
    expect(await loginPage.loginButtonText.getText()).toBe(LOGIN_UI.loginButton);
    expect(await loginPage.versionText.getText()).toMatch(LOGIN_UI.versionPattern);

    // Chỉ ghi nhận, không khẳng định: trạng thái checkbox phụ thuộc lần dùng trước.
    logger.info(`Tự động đăng nhập đang chọn: ${await loginPage.isAutoLoginTicked()}`);
    logger.info(`Phiên bản hiển thị: ${await loginPage.versionText.getText()}`);
  });

  it('LOGIN-002: Bỏ trống cả số điện thoại và mật khẩu @validation', async () => {
    await loginPage.fill('', '');
    await loginPage.tapLogin();

    expect(await loginPage.waitForToast()).toBe(LOGIN_MESSAGES.emptyUsername);
    await expect(loginPage.passwordInput).toBeDisplayed();
  });

  it('LOGIN-003: Bỏ trống số điện thoại @validation', async () => {
    await loginPage.fill('', DUMMY.password);
    await loginPage.tapLogin();

    expect(await loginPage.waitForToast()).toBe(LOGIN_MESSAGES.emptyUsername);
    await expect(loginPage.passwordInput).toBeDisplayed();
  });

  it('LOGIN-004: Bỏ trống mật khẩu @validation', async () => {
    await loginPage.fill(DUMMY.username, '');
    await loginPage.tapLogin();

    expect(await loginPage.waitForToast()).toBe(LOGIN_MESSAGES.emptyPassword);
    await expect(loginPage.passwordInput).toBeDisplayed();
  });

  it('LOGIN-005: Kiểm tra khả năng nhập, xóa và hiển thị dữ liệu @ui', async () => {
    // Ô tài khoản: chạm thì hiện bàn phím, xóa được, nhập được.
    await loginPage.usernameInput.click();
    expect(await loginPage.isKeyboardShown()).toBe(true);

    await loginPage.clearField('username');
    expect(await loginPage.getValue('username')).toBe('');

    await loginPage.typeInto('username', DUMMY.lowercaseInput);
    // Hành vi quan sát được: app tự chuyển chữ thường thành chữ hoa.
    expect(await loginPage.getValue('username')).toBe(DUMMY.lowercaseInputDisplayed);

    await loginPage.clearField('username');
    expect(await loginPage.getValue('username')).toBe('');

    // Ô mật khẩu: nhập được, mỗi ký tự hiển thị thành 1 dấu che, xóa được.
    await loginPage.clearField('password');
    await loginPage.typeInto('password', DUMMY.password);
    expect(await loginPage.getValue('password')).toHaveLength(DUMMY.password.length);

    await loginPage.clearField('password');
    expect(await loginPage.getValue('password')).toBe('');
    await loginPage.hideKeyboard();
  });

  it('LOGIN-006: Mật khẩu được che khi nhập và icon mắt ẩn/hiện mật khẩu @ui', async () => {
    await loginPage.fill(DUMMY.username, DUMMY.password);

    expect(await loginPage.isPasswordMasked()).toBe(true);
    expect(await loginPage.getValue('password')).not.toContain(DUMMY.password);

    await loginPage.toggleEye();
    expect(await loginPage.isPasswordMasked()).toBe(false);
    expect(await loginPage.getValue('password')).toBe(DUMMY.password);

    await loginPage.toggleEye();
    expect(await loginPage.isPasswordMasked()).toBe(true);
  });

  it('LOGIN-007: Đăng nhập với tài khoản không hợp lệ @auth', async function () {
    if (!INVALID_ACCOUNT.username || !INVALID_ACCOUNT.password) {
      logger.warn('BLOCKED: thiếu INVALID_USERNAME/INVALID_PASSWORD trong .env');
      this.skip();
    }
    // Chỉ 1 lần thử, với tài khoản không tồn tại, để tránh khóa tài khoản thật.
    await loginPage.fill(INVALID_ACCOUNT.username!, INVALID_ACCOUNT.password!);
    await loginPage.tapLogin();

    await loginPage.dialogTitle.waitForDisplayed({ timeout: 20000 });
    await expect($(`android=new UiSelector().text("${LOGIN_MESSAGES.invalidAccount}")`)).toBeDisplayed();

    await loginPage.dismissDialog();
    await expect(loginPage.dialogTitle).not.toBeDisplayed();
    await expect(loginPage.passwordInput).toBeDisplayed();
  });

  it('LOGIN-008: Đăng nhập thành công bằng tài khoản test @auth', async function () {
    if (VALID_ACCOUNT.username && VALID_ACCOUNT.password) {
      await loginPage.fill(VALID_ACCOUNT.username, VALID_ACCOUNT.password);
    } else {
      // Không có mật khẩu trong .env: chỉ dùng thông tin ĐÃ LƯU sẵn trên máy, và chỉ khi đúng tài khoản test.
      const shown = await loginPage.getValue('username');
      const hasSavedPassword = (await loginPage.getValue('password')) !== '';
      if (!VALID_ACCOUNT.username || shown.toUpperCase() !== VALID_ACCOUNT.username.toUpperCase() || !hasSavedPassword) {
        logger.warn('BLOCKED: thiếu TEST_PASSWORD và không có thông tin đã lưu khớp TEST_USERNAME');
        this.skip();
      }
      logger.info(`Dùng thông tin đã lưu trên máy cho tài khoản "${shown}"`);
    }
    await loginPage.tapLogin();

    await homePage.waitForDisplayed();
    expect(await homePage.isHomeTabSelected()).toBe(true);
    await expect(homePage.accountTab).toBeDisplayed();
  });
});
