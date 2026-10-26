import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}. Hãy sao chép .env.example thành .env và điền giá trị.`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const env = {
  androidHome: required('ANDROID_HOME'),
  deviceUdid: required('DEVICE_UDID'),
  appPackage: required('APP_PACKAGE'),
  appActivity: required('APP_ACTIVITY'),
  appiumPort: Number(optional('APPIUM_PORT') ?? 4723),
  testUsername: optional('TEST_USERNAME'),
  testPassword: optional('TEST_PASSWORD'),
  invalidUsername: optional('INVALID_USERNAME'),
  invalidPassword: optional('INVALID_PASSWORD'),
};
