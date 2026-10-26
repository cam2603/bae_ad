import { env } from '../config/env.js';

/**
 * Kết quả mong đợi dưới đây được GHI NHẬN TỪ HÀNH VI THỰC TẾ của app bản Test.6.10.190
 * (khảo sát ngày 26/10/2026), CHƯA đối chiếu với tài liệu nghiệp vụ.
 * Cần BA/PM xác nhận; nếu tài liệu khác, cập nhật tại đây.
 */
export const LOGIN_UI = {
  usernameLabel: 'Số điện thoại/ Tài khoản',
  passwordLabel: 'Mật khẩu',
  usernameHint: 'Số điện thoại hoặc tài khoản',
  passwordHint: 'Mật khẩu',
  loginButton: 'ĐĂNG NHẬP',
  forgotPassword: 'Quên mật khẩu?',
  versionPattern: /^Version: \S+/,
} as const;

export const LOGIN_MESSAGES = {
  // Toast — LOGIN-002 và LOGIN-003 cho cùng một thông báo
  emptyUsername: 'Vui lòng nhập thông tin tài khoản vào ô trống',
  // Toast — LOGIN-004
  emptyPassword: 'Vui lòng nhập mật khẩu vào ô trống',
  // Dialog — LOGIN-007 với tài khoản không tồn tại
  dialogTitle: 'Thông báo',
  invalidAccount: 'Tài khoản không đúng',
} as const;

/** Dữ liệu giả, không phải thông tin thật. */
export const DUMMY = {
  username: 'AUTO_USER_01',
  password: 'Abc12345',
  // Ô tài khoản tự chuyển chữ thường thành chữ hoa (quan sát thực tế)
  lowercaseInput: 'auto_input_01',
  lowercaseInputDisplayed: 'AUTO_INPUT_01',
} as const;

export const INVALID_ACCOUNT = {
  username: env.invalidUsername,
  password: env.invalidPassword,
};

export const VALID_ACCOUNT = {
  username: env.testUsername,
  password: env.testPassword,
};
