// legacyCompat.js — jembatan nama lama untuk skrip scraper dari server.
// Skrip scraper OTA yang sudah dipublikasikan masih memakai nama lama
// (window.__moriDeps, window.MoriMainBridge, kunci mori_*, dst). Alias di sini
// meneruskan nama lama ke nama Skarp supaya scraper lama tetap jalan.
// Hapus file ini setelah semua scraper di server dibuat ulang dengan nama baru.

const KEY_MAP = {
  mori_doh: "skarp_doh",
  mori_request_timeout: "skarp_request_timeout",
  mori_header_spoofing: "skarp_header_spoofing",
  mori_bypass_ssl: "skarp_bypass_ssl",
  mori_force_ipv4: "skarp_force_ipv4",
};

(function installLegacyAliases() {
  if (typeof window === "undefined" || window.__skarpLegacyCompat) return;
  window.__skarpLegacyCompat = true;

  try {
    const nativeGet = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      const mapped = Object.prototype.hasOwnProperty.call(KEY_MAP, key)
        ? KEY_MAP[key]
        : key;
      return nativeGet.call(this, mapped);
    };
  } catch (_) {}

  // satu objek callback dipakai bersama oleh sisi native dan share
  const shared = window.__skarpNativeCallbacks || window.__skarpShareCallbacks || {};
  window.__skarpNativeCallbacks = shared;
  window.__skarpShareCallbacks = shared;

  const alias = (legacyName, getter, setter) => {
    try {
      Object.defineProperty(window, legacyName, {
        configurable: true,
        get: getter,
        set: setter || function () {},
      });
    } catch (_) {}
  };

  alias("__moriDeps", () => window.__skarpDeps);
  alias("MoriMainBridge", () => window.SkarpMainBridge);
  alias("MoriShareBridge", () => window.SkarpShareBridge);
  alias(
    "__moriNativeCallbacks",
    () => window.__skarpNativeCallbacks,
    (v) => {
      if (v && typeof v === "object") window.__skarpNativeCallbacks = v;
    },
  );
  alias(
    "__moriShareCallbacks",
    () => window.__skarpShareCallbacks,
    (v) => {
      if (v && typeof v === "object") window.__skarpShareCallbacks = v;
    },
  );
})();
