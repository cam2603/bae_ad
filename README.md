# BAExpress Admin — Android Automation (Login)

Bộ test UI tự động cho màn **Đăng nhập** của app **BAExpress Admin** (`com.binhanh.admin.baexpress`),
dùng Appium 3 + UiAutomator2 + WebdriverIO 10 + Mocha + TypeScript, theo mô hình Page Object.

## Môi trường đã kiểm tra (26/10/2026)

| Thành phần | Phiên bản |
|---|---|
| Node.js / npm | 24.21.0 / 11.19.0 |
| Java | Temurin 17.0.20.1 |
| Appium (global) | 3.7.0 |
| Driver | uiautomator2@8.6.4 (server 10.6.6 trên máy) |
| adb | 37.0.1 — `<ANDROID_HOME>\platform-tools` |
| Thiết bị | Samsung SM-G973F, Android 12 (API 31), ADB qua Wi-Fi |
| App | 6.10.190 (Test) |

### Lưu ý môi trường
- Máy **không có Android SDK build-tools** (`aapt2`, `apksigner`). Appium vẫn chạy được, nhưng sẽ
  **không tự cập nhật** UiAutomator2 server khi nâng cấp driver. Khi nâng cấp driver, cài lại thủ công:
  ```
  adb install -r -g "%USERPROFILE%\.appium\node_modules\appium-uiautomator2-driver\node_modules\appium-uiautomator2-server\apks\appium-uiautomator2-server-v<ver>.apk"
  adb install -r -g "%USERPROFILE%\.appium\node_modules\appium-uiautomator2-driver\node_modules\appium-uiautomator2-server\apks\appium-uiautomator2-server-debug-androidTest.apk"
  ```
  Hướng lâu dài: cài build-tools vào `ANDROID_HOME`.
- ADB qua Wi-Fi có thể đổi port sau mỗi lần ghép nối → cập nhật `DEVICE_UDID` trong `.env`.

## Cài đặt & chạy

```
npm install
copy .env.example .env      # rồi điền giá trị
npm run typecheck
npm test                     # chạy toàn bộ
npm run test:ui              # LOGIN-001, 005, 006
npm run test:validation      # LOGIN-002, 003, 004
npm run test:auth            # LOGIN-007, 008
```
Appium được `@wdio/appium-service` tự khởi động (lệnh `appium` global, port trong `.env`).
Không cần mở Appium riêng.

## Cấu trúc

```
config/env.ts            Đọc .env, báo lỗi rõ khi thiếu biến
config/capabilities.ts   Capabilities Appium (noReset, không đóng app khi kết thúc)
src/pages/BasePage.ts    Phím, bàn phím, mở lại app, đọc Toast
src/pages/LoginPage.ts   Locator + thao tác màn Login
src/pages/HomePage.ts    Nhận diện màn Trang chủ sau đăng nhập
src/utils/logger.ts      Log có thời gian
test-data/login.data.ts  Dữ liệu và kết quả mong đợi
tests/login.spec.ts      LOGIN-001 … LOGIN-008
wdio.conf.ts             Cấu hình WDIO; chụp ảnh + page source khi fail → artifacts/
```
Khác với cấu trúc đề xuất ban đầu (`pages/` ở gốc): mã nguồn đặt trong `src/`, cấu hình tách ra `config/`,
và thông tin đăng nhập lấy từ `.env` để không nằm trong source code.

## Ghi chú kỹ thuật quan trọng

1. **Không có resource-id.** App viết bằng .NET MAUI, không đặt `AutomationId`. Ô nhập được định danh
   bằng thuộc tính `hint`. Đề xuất dev thêm `AutomationId` để locator bền hơn.
2. **Nhãn tiếng Việt lưu dạng NFD** (ví dụ "Số điện thoại/ Tài khoản" dài 29 ký tự thay vì 24).
   XPath `@text='...'` với nhãn sẽ không khớp → so sánh sau khi `normalize('NFC')`.
3. **`clearValue()` không xóa được ô nhập.** Dùng `LoginPage.clearField()` (chạm ô → MOVE_END → DEL).
4. **Ô trống trả về chuỗi hint** khi `getText()` → `LoginPage.getValue()` quy đổi về `''`.
5. **Toast đọc từ page source**, không dùng `$('//android.widget.Toast').getText()` (bị stale element).
6. **Về màn Login giữa các test** bằng cách đóng/mở lại app, KHÔNG đăng xuất, KHÔNG xóa dữ liệu.
   Đã kiểm chứng: thông tin đăng nhập đã lưu vẫn còn sau khi mở lại (khi "Tự động đăng nhập" không chọn).

## Kết quả mong đợi — nguồn gốc

Thông báo lỗi trong `test-data/login.data.ts` được **ghi nhận từ hành vi thực tế** của bản Test.6.10.190,
chưa đối chiếu tài liệu nghiệp vụ. Cần BA/PM xác nhận:

| Case | Hiển thị | Nội dung |
|---|---|---|
| Trống cả 2 ô / trống tài khoản | Toast | Vui lòng nhập thông tin tài khoản vào ô trống |
| Trống mật khẩu | Toast | Vui lòng nhập mật khẩu vào ô trống |
| Tài khoản không tồn tại | Dialog "Thông báo" + nút "Đồng ý" | Tài khoản không đúng |
| Ô tài khoản | — | Tự chuyển chữ thường → chữ HOA; bàn phím chữ (không phải bàn phím số) |

## LOGIN-008 (đăng nhập thành công)
- Có `TEST_USERNAME` + `TEST_PASSWORD` trong `.env` → nhập rồi đăng nhập.
- Chỉ có `TEST_USERNAME` → dùng thông tin **đã lưu sẵn** trên máy, chỉ khi ô tài khoản đang hiển thị đúng tài khoản đó.
- Không thỏa → test bị skip (BLOCKED), không tự đoán mật khẩu.

## An toàn dữ liệu
- Không gỡ app, không xóa dữ liệu app, không đăng xuất.
- LOGIN-007 thử **1 lần** với tài khoản không tồn tại để tránh khóa tài khoản thật.
- Log không in mật khẩu (chỉ in độ dài).
