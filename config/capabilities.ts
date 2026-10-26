import { env } from './env.js';

// noReset/dontStopAppOnReset: không xóa dữ liệu app, không đóng app khi kết thúc session.
// Việc mở lại app giữa các test do LoginPage.relaunchApp() đảm nhiệm.
export const androidCapabilities: WebdriverIO.Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:udid': env.deviceUdid,
  'appium:appPackage': env.appPackage,
  'appium:appActivity': env.appActivity,
  'appium:noReset': true,
  'appium:fullReset': false,
  'appium:dontStopAppOnReset': true,
  'appium:forceAppLaunch': false,
  'appium:autoGrantPermissions': false,
  'appium:newCommandTimeout': 300,
  'appium:uiautomator2ServerLaunchTimeout': 60000,
  'appium:adbExecTimeout': 60000,
};
