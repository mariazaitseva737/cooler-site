// Thin wrapper around the Telegram Mini App SDK. Everything is optional:
// outside Telegram these functions quietly do nothing.
export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
export const inTelegram = !!(tg && tg.initData);

export function initTelegram() {
  if (!inTelegram) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#F3F7F5');
    tg.setBackgroundColor?.('#F3F7F5');
    tg.disableVerticalSwipes?.();
  } catch (e) { /* older Telegram clients */ }
}

export const telegramLang = () => tg?.initDataUnsafe?.user?.language_code;

// Telegram DeviceStorage (Bot API 9.0+) keeps data on the device even if the WebView cache is cleared.
const ds = () => (inTelegram ? tg.DeviceStorage : undefined);
export function deviceSave(key, value) {
  try { ds()?.setItem(key, value, () => {}); } catch (e) {}
}
export function deviceLoad(key) {
  return new Promise((resolve) => {
    const s = ds();
    if (!s) return resolve(null);
    try { s.getItem(key, (err, v) => resolve(err ? null : v || null)); } catch (e) { resolve(null); }
  });
}
export function haptic(type = 'light') {
  try { tg?.HapticFeedback?.impactOccurred(type); } catch (e) {}
}

// Confirmation dialog: native Telegram popup inside Telegram, browser confirm elsewhere.
export function ask(message) {
  if (inTelegram && tg.showConfirm) return new Promise((resolve) => { try { tg.showConfirm(message, (ok) => resolve(!!ok)); } catch (e) { resolve(window.confirm(message)); } });
  return Promise.resolve(window.confirm(message));
}
