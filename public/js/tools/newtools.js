// tools/newtools.js — Image Converter, QR Code Generator, OCR Text Scanner,
// JSON Formatter and Color Picker for the Tools tab.
// Everything runs on-device: no uploads, no analytics, no external requests.
import { showToast } from "../utils/index.js";
import { esc, formatBytes, saveToSkarp, stampName, openSaveFolder, bytesToBase64 } from "./common.js";
import {
  InputError,
  JsonError,
  JSON_SAMPLE,
  parseJson,
  stringifyJson,
  describeJson,
  buildText,
  buildWifi,
  buildVCard,
  normalizeUrl,
  parseHex,
  toHex,
  rgbToHsl,
  contrastRatio,
  luminance,
  targetSize,
  fitWithin,
} from "./logic.js";

/* ---------------------------------------------------------------- strings */
export const NEW_STRINGS = {
  en: {
    "ic-desc": "Convert image formats easily",
    "qr-desc": "Make QR codes from text, links and more",
    "ocr-desc": "Turn text in photos into copyable text",
    "json-desc": "Format, validate and tidy JSON fast",
    "color-desc": "Pick colours from an image with exact codes",
    "tools-search-ph": "Search tools…",
    "tools-empty": "No tools found",
    "tools-empty-d": "Try another keyword, for example “image”, “PDF” or “QR”.",
    "nt-clear-search": "Clear search",
    "nt-save": "Save",
    "nt-share": "Share",
    "nt-copy": "Copy",
    "nt-copy-all": "Copy all",
    "nt-copied": "Copied",
    "nt-clear": "Clear",
    "nt-cancel": "Cancel",
    "nt-no-image": "Choose an image first.",
    "nt-load-fail": "This image could not be opened. The format may be unsupported or the file damaged.",
    "nt-too-big": "This image is too large to process on this device.",
    "nt-share-fail": "Could not open the share sheet.",
    "nt-saved-line": "Saved to {path}",
    "nt-downloaded-line": "Downloaded as {path}",
    "nt-nothing-copy": "Nothing to copy yet.",
    "nt-copy-fail": "Could not copy to the clipboard.",
    "nt-pick-image": "Choose an image",
    /* image converter */
    "icv-hint": "Convert JPG, PNG or WebP photos. Everything happens on your device.",
    "icv-format": "Output format",
    "icv-quality": "Quality",
    "icv-lossless": "PNG is lossless, so there is no quality setting.",
    "icv-size": "Size",
    "icv-orig": "Original",
    "icv-custom": "Max px",
    "icv-custom-ph": "Longest side in px",
    "icv-run": "Convert",
    "icv-working": "Converting…",
    "icv-result": "Result",
    "icv-bad-custom": "Enter a size between 16 and 16000 px.",
    "icv-no-webp": "This device cannot create WebP files.",
    "icv-fmt-fail": "This device could not create {fmt} files.",
    "icv-capped": "The image was scaled down automatically to fit the device memory.",
    "icv-smaller": "{pct}% smaller",
    "icv-larger": "{pct}% larger",
    /* qr */
    "qr-hint": "Pick a type, fill it in and the QR code updates live. Nothing leaves your device.",
    "qr-type-text": "Text",
    "qr-type-url": "Link",
    "qr-type-wifi": "Wi-Fi",
    "qr-type-contact": "Contact",
    "qr-text": "Text",
    "qr-text-ph": "Type or paste any text…",
    "qr-url-ph": "https://example.com",
    "qr-ssid": "Network name (SSID)",
    "qr-pass": "Password",
    "qr-security": "Security",
    "qr-sec-wpa": "WPA/WPA2/WPA3",
    "qr-sec-wep": "WEP",
    "qr-sec-none": "None",
    "qr-hidden": "Hidden network",
    "qr-show-pass": "Show password",
    "qr-hide-pass": "Hide password",
    "qr-c-name": "Full name",
    "qr-c-phone": "Phone number",
    "qr-c-email": "Email",
    "qr-c-org": "Company (optional)",
    "qr-c-url": "Website (optional)",
    "qr-fg": "QR colour",
    "qr-bg": "Background",
    "qr-reset": "Reset colours",
    "qr-save": "Save PNG",
    "qr-preview-empty": "Fill in the form to see your QR code here.",
    "qr-low-contrast": "These colours are too close to each other. Pick a darker QR colour or a lighter background so scanners can read it.",
    "qr-inverted": "Light-on-dark QR codes are not readable by every scanner.",
    "qr-too-long": "That is too much data for one QR code. Shorten it.",
    "qr-err-text-empty": "Enter some text first.",
    "qr-err-url-empty": "Enter a link first.",
    "qr-err-url-invalid": "That does not look like a valid web link.",
    "qr-err-wifi-ssid-empty": "Enter the network name.",
    "qr-err-wifi-ssid-long": "A network name can be at most 32 bytes.",
    "qr-err-wifi-pass-empty": "Enter the Wi-Fi password, or choose “None”.",
    "qr-err-wifi-pass-wpa": "A WPA password must be 8–63 characters.",
    "qr-err-wifi-pass-wep": "A WEP password must be 5 or 13 characters, or 10 or 26 hex digits.",
    "qr-err-contact-name-empty": "Enter the contact name.",
    "qr-err-contact-need-one": "Enter a phone number or an email.",
    "qr-err-contact-phone": "That phone number does not look valid.",
    "qr-err-contact-email": "That email address does not look valid.",
    /* ocr */
    "ocr-hint": "Pick a photo and read the text in it. Recognition runs on your device and the photo is never uploaded.",
    "ocr-lang": "Language",
    "ocr-lang-both": "Indonesian + English",
    "ocr-lang-en": "English",
    "ocr-lang-id": "Indonesian",
    "ocr-run": "Scan text",
    "ocr-rescan": "Scan again",
    "ocr-st-load": "Loading the OCR engine…",
    "ocr-st-data": "Loading language data…",
    "ocr-st-read": "Reading text…",
    "ocr-result": "Recognised text",
    "ocr-ph": "The text appears here. You can edit it.",
    "ocr-empty": "No text found",
    "ocr-empty-d": "Try a sharper, well-lit photo with the text facing the camera, or pick another language.",
    "ocr-stats": "{words} words · {chars} characters · confidence {conf}%",
    "ocr-cancelled": "Scan cancelled.",
    "ocr-unsupported": "This device’s browser engine cannot run the OCR engine (WebAssembly or Workers missing).",
    /* json */
    "json-hint": "Paste JSON, then format, minify or validate it. Numbers and strings keep their exact text.",
    "json-input": "JSON input",
    "json-input-ph": "Paste or type JSON here…",
    "json-indent": "Indent",
    "json-indent-tab": "Tab",
    "json-format": "Format JSON",
    "json-minify": "Minify",
    "json-validate": "Validate",
    "json-sample": "Sample",
    "json-output": "Result",
    "json-valid": "Valid JSON",
    "json-valid-d": "{type}{size}",
    "json-t-object": "object",
    "json-t-array": "array",
    "json-t-string": "string",
    "json-t-number": "number",
    "json-t-true": "boolean",
    "json-t-false": "boolean",
    "json-t-null": "null",
    "json-keys": " · {n} keys",
    "json-items": " · {n} items",
    "json-invalid": "Invalid JSON",
    "json-at": "Line {line}, column {col}",
    "json-err-empty": "The input is empty.",
    "json-err-unexpected-end": "The JSON ends too early. Something is not closed.",
    "json-err-unexpected-char": "Unexpected character “{ch}”.",
    "json-err-expected-key": "A property name in double quotes was expected here (found “{ch}”).",
    "json-err-expected-colon": "A colon “:” was expected after the property name.",
    "json-err-expected-comma-or-end": "A comma or “{close}” was expected here (found “{ch}”).",
    "json-err-bad-string": "This string is not valid.",
    "json-err-unterminated-string": "This string is missing its closing quote.",
    "json-err-bad-escape": "Invalid escape sequence in a string.",
    "json-err-ctrl-char": "A raw line break or control character is not allowed inside a string. Use \\n instead.",
    "json-err-bad-number": "This number is not valid JSON.",
    "json-err-trailing": "Unexpected extra content after the JSON value (“{ch}”).",
    "json-err-too-deep": "The JSON is nested too deeply.",
    /* color */
    "color-hint": "Pick a photo, then tap or drag on it to read the colour under your finger.",
    "color-tap": "Tap the image to pick a colour",
    "color-none": "No colour picked yet",
    "color-history": "History",
    "color-clear-history": "Clear history",
    "color-empty-history": "Picked colours show up here.",
    "color-transparent": "This pixel is transparent",
    "color-hex": "HEX",
    "color-rgb": "RGB",
    "color-hsl": "HSL",
    "color-pos": "Pixel {x}, {y}",
  },
  id: {
    "ic-desc": "Konversi format gambar dengan mudah",
    "qr-desc": "Buat QR Code dari teks, tautan, atau informasi lainnya",
    "ocr-desc": "Ekstrak tulisan dari foto jadi teks yang bisa disalin",
    "json-desc": "Format, validasi, dan rapikan JSON dengan cepat",
    "color-desc": "Ambil warna dari gambar dan dapatkan kode yang akurat",
    "tools-search-ph": "Cari tools…",
    "tools-empty": "Tools tidak ditemukan",
    "tools-empty-d": "Coba kata kunci lain, misalnya “gambar”, “PDF”, atau “QR”.",
    "nt-clear-search": "Hapus pencarian",
    "nt-save": "Simpan",
    "nt-share": "Bagikan",
    "nt-copy": "Salin",
    "nt-copy-all": "Salin semua",
    "nt-copied": "Disalin",
    "nt-clear": "Hapus",
    "nt-cancel": "Batal",
    "nt-no-image": "Pilih gambar dulu.",
    "nt-load-fail": "Gambar tidak bisa dibuka. Formatnya mungkin tidak didukung atau file rusak.",
    "nt-too-big": "Gambar terlalu besar untuk diproses di perangkat ini.",
    "nt-share-fail": "Menu bagikan tidak bisa dibuka.",
    "nt-saved-line": "Tersimpan di {path}",
    "nt-downloaded-line": "Diunduh sebagai {path}",
    "nt-nothing-copy": "Belum ada yang bisa disalin.",
    "nt-copy-fail": "Gagal menyalin ke clipboard.",
    "nt-pick-image": "Pilih gambar",
    "icv-hint": "Konversi foto JPG, PNG, atau WebP. Semua diproses di perangkatmu.",
    "icv-format": "Format hasil",
    "icv-quality": "Kualitas",
    "icv-lossless": "PNG tanpa kompresi lossy, jadi tidak ada pengaturan kualitas.",
    "icv-size": "Ukuran",
    "icv-orig": "Asli",
    "icv-custom": "Maks px",
    "icv-custom-ph": "Sisi terpanjang dalam px",
    "icv-run": "Konversi",
    "icv-working": "Mengonversi…",
    "icv-result": "Hasil",
    "icv-bad-custom": "Isi ukuran antara 16 dan 16000 px.",
    "icv-no-webp": "Perangkat ini tidak bisa membuat file WebP.",
    "icv-fmt-fail": "Perangkat ini gagal membuat file {fmt}.",
    "icv-capped": "Gambar otomatis diperkecil supaya muat di memori perangkat.",
    "icv-smaller": "Lebih kecil {pct}%",
    "icv-larger": "Lebih besar {pct}%",
    "qr-hint": "Pilih jenis, isi datanya, dan QR langsung diperbarui. Tidak ada data yang keluar dari perangkat.",
    "qr-type-text": "Teks",
    "qr-type-url": "Tautan",
    "qr-type-wifi": "Wi-Fi",
    "qr-type-contact": "Kontak",
    "qr-text": "Teks",
    "qr-text-ph": "Ketik atau tempel teks apa saja…",
    "qr-url-ph": "https://contoh.com",
    "qr-ssid": "Nama jaringan (SSID)",
    "qr-pass": "Kata sandi",
    "qr-security": "Keamanan",
    "qr-sec-wpa": "WPA/WPA2/WPA3",
    "qr-sec-wep": "WEP",
    "qr-sec-none": "Tanpa sandi",
    "qr-hidden": "Jaringan tersembunyi",
    "qr-show-pass": "Tampilkan sandi",
    "qr-hide-pass": "Sembunyikan sandi",
    "qr-c-name": "Nama lengkap",
    "qr-c-phone": "Nomor telepon",
    "qr-c-email": "Email",
    "qr-c-org": "Perusahaan (opsional)",
    "qr-c-url": "Situs web (opsional)",
    "qr-fg": "Warna QR",
    "qr-bg": "Latar",
    "qr-reset": "Reset warna",
    "qr-save": "Simpan PNG",
    "qr-preview-empty": "Isi formulir untuk melihat QR Code di sini.",
    "qr-low-contrast": "Warna QR dan latarnya terlalu mirip. Pilih warna QR yang lebih gelap atau latar yang lebih terang supaya bisa dipindai.",
    "qr-inverted": "QR terang di atas latar gelap tidak terbaca di semua pemindai.",
    "qr-too-long": "Data terlalu banyak untuk satu QR Code. Persingkat dulu.",
    "qr-err-text-empty": "Isi teksnya dulu.",
    "qr-err-url-empty": "Isi tautannya dulu.",
    "qr-err-url-invalid": "Tautan ini tidak terlihat seperti alamat web yang valid.",
    "qr-err-wifi-ssid-empty": "Isi nama jaringan.",
    "qr-err-wifi-ssid-long": "Nama jaringan maksimal 32 byte.",
    "qr-err-wifi-pass-empty": "Isi kata sandi Wi-Fi, atau pilih “Tanpa sandi”.",
    "qr-err-wifi-pass-wpa": "Sandi WPA harus 8–63 karakter.",
    "qr-err-wifi-pass-wep": "Sandi WEP harus 5 atau 13 karakter, atau 10 atau 26 digit hex.",
    "qr-err-contact-name-empty": "Isi nama kontak.",
    "qr-err-contact-need-one": "Isi nomor telepon atau email.",
    "qr-err-contact-phone": "Nomor telepon ini tidak terlihat valid.",
    "qr-err-contact-email": "Alamat email ini tidak terlihat valid.",
    "ocr-hint": "Pilih foto lalu baca teks di dalamnya. Pengenalan teks berjalan di perangkatmu dan foto tidak pernah diunggah.",
    "ocr-lang": "Bahasa",
    "ocr-lang-both": "Indonesia + Inggris",
    "ocr-lang-en": "Inggris",
    "ocr-lang-id": "Indonesia",
    "ocr-run": "Pindai teks",
    "ocr-rescan": "Pindai ulang",
    "ocr-st-load": "Memuat mesin OCR…",
    "ocr-st-data": "Memuat data bahasa…",
    "ocr-st-read": "Membaca teks…",
    "ocr-result": "Teks hasil pindai",
    "ocr-ph": "Teks muncul di sini. Kamu bisa mengeditnya.",
    "ocr-empty": "Tidak ada teks terdeteksi",
    "ocr-empty-d": "Coba foto yang lebih tajam dan terang dengan tulisan menghadap kamera, atau pilih bahasa lain.",
    "ocr-stats": "{words} kata · {chars} karakter · akurasi {conf}%",
    "ocr-cancelled": "Pemindaian dibatalkan.",
    "ocr-unsupported": "Mesin browser di perangkat ini tidak bisa menjalankan OCR (WebAssembly atau Worker tidak ada).",
    "json-hint": "Tempel JSON, lalu format, minify, atau validasi. Angka dan string tetap persis seperti aslinya.",
    "json-input": "Input JSON",
    "json-input-ph": "Tempel atau ketik JSON di sini…",
    "json-indent": "Indentasi",
    "json-indent-tab": "Tab",
    "json-format": "Format JSON",
    "json-minify": "Minify",
    "json-validate": "Validate",
    "json-sample": "Sample",
    "json-output": "Hasil",
    "json-valid": "JSON valid",
    "json-valid-d": "{type}{size}",
    "json-t-object": "objek",
    "json-t-array": "array",
    "json-t-string": "string",
    "json-t-number": "angka",
    "json-t-true": "boolean",
    "json-t-false": "boolean",
    "json-t-null": "null",
    "json-keys": " · {n} kunci",
    "json-items": " · {n} item",
    "json-invalid": "JSON tidak valid",
    "json-at": "Baris {line}, kolom {col}",
    "json-err-empty": "Input masih kosong.",
    "json-err-unexpected-end": "JSON berakhir terlalu cepat. Ada bagian yang belum ditutup.",
    "json-err-unexpected-char": "Karakter “{ch}” tidak diharapkan di sini.",
    "json-err-expected-key": "Di sini seharusnya ada nama properti dalam tanda kutip ganda (ditemukan “{ch}”).",
    "json-err-expected-colon": "Setelah nama properti seharusnya ada titik dua “:”.",
    "json-err-expected-comma-or-end": "Di sini seharusnya ada koma atau “{close}” (ditemukan “{ch}”).",
    "json-err-bad-string": "String ini tidak valid.",
    "json-err-unterminated-string": "String ini belum ditutup dengan tanda kutip.",
    "json-err-bad-escape": "Ada escape sequence yang tidak valid di dalam string.",
    "json-err-ctrl-char": "Baris baru atau karakter kontrol mentah tidak boleh ada di dalam string. Pakai \\n.",
    "json-err-bad-number": "Angka ini bukan format JSON yang valid.",
    "json-err-trailing": "Ada isi tambahan setelah nilai JSON (“{ch}”).",
    "json-err-too-deep": "Struktur JSON terlalu dalam.",
    "color-hint": "Pilih foto, lalu ketuk atau geser di atasnya untuk membaca warna di bawah jarimu.",
    "color-tap": "Ketuk gambar untuk memilih warna",
    "color-none": "Belum ada warna dipilih",
    "color-history": "Riwayat",
    "color-clear-history": "Hapus riwayat",
    "color-empty-history": "Warna yang kamu ambil muncul di sini.",
    "color-transparent": "Piksel ini transparan",
    "color-hex": "HEX",
    "color-rgb": "RGB",
    "color-hsl": "HSL",
    "color-pos": "Piksel {x}, {y}",
  },
};

/* Cards shown on the Tools menu: [id, title, icon path, desc key, extra search words] */
const P = {
  conv: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
  qr: "M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm2 2h2v2h-2zm-4 0h2v2h-2zm2-6h2v2h-2zm2 2h2v2h-2z",
  ocr: "M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z",
  json: "M4 7v2c0 .55-.45 1-1 1H2v2h1c.55 0 1 .45 1 1v2c0 1.65 1.35 3 3 3h3v-2H7c-.55 0-1-.45-1-1v-2c0-1.3-.84-2.42-2-2.83v-.34C5.16 11.42 6 10.3 6 9V7c0-.55.45-1 1-1h3V4H7C5.35 4 4 5.35 4 7zm17 3c-.55 0-1-.45-1-1V7c0-1.65-1.35-3-3-3h-3v2h3c.55 0 1 .45 1 1v2c0 1.3.84 2.42 2 2.83v.34c-1.16.41-2 1.52-2 2.83v2c0 .55-.45 1-1 1h-3v2h3c1.65 0 3-1.35 3-3v-2c0-.55.45-1 1-1h1v-2h-1z",
  color: "M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  search: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 12 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 12 14 9.5 14z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  img: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
};
export const NEW_TOOL_CARDS = [
  ["imgconv", "Image Converter", P.conv, "ic-desc", "jpg jpeg png webp format convert gambar foto"],
  ["qrgen", "QR Code Generator", P.qr, "qr-desc", "qr code barcode wifi wi-fi url link teks kontak vcard"],
  ["ocr", "OCR Text Scanner", P.ocr, "ocr-desc", "ocr scan teks tulisan text foto salin"],
  ["jsonfmt", "JSON Formatter", P.json, "json-desc", "json format minify validate validasi rapikan"],
  ["colorpick", "Color Picker", P.color, "color-desc", "color warna hex rgb hsl pipet eyedropper kode"],
];
export const SEARCH_ICONS = { search: P.search, close: P.close };

/* ---------------------------------------------------------------- helpers */
const $ = (id) => document.getElementById(id);
const hide = (el) => el.classList.add("hidden");
const show = (el) => el.classList.remove("hidden");
const isNative = () => !!window.Capacitor?.isNativePlatform?.();
let T = (k) => k;
const tt = (k, v) => T(k, v);

const svg = (d, s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;

const field = (id, extra = "") => `id="${id}" class="nt-field" autocomplete="off" autocapitalize="off" spellcheck="false" ${extra}`;

const setStatusBox = (el, html, kind = "busy") => {
  el.className = `tool-status ${kind}`;
  el.innerHTML = html;
};
const spin = '<span class="tool-spin"></span>';
const errBox = (el, msg, sub = "") => setStatusBox(el, `<strong>${esc(msg)}</strong>${sub ? `<small>${sub}</small>` : ""}`, "error");

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function copyToClipboard(text) {
  try {
    const cb = window.Capacitor?.Plugins?.Clipboard;
    if (cb?.write) await cb.write({ string: text });
    else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) throw new Error("copy");
    }
    showToast(tt("nt-copied"));
    return true;
  } catch (_) {
    showToast(tt("nt-copy-fail"));
    return false;
  }
}

/** Shares a file (native share sheet on Android, Web Share elsewhere, download as a last resort). */
async function shareBytes(bytes, name, mime) {
  const plugins = window.Capacitor?.Plugins;
  if (isNative() && plugins?.Share && plugins?.Filesystem) {
    const path = `share/${name}`;
    await plugins.Filesystem.writeFile({ path, data: bytesToBase64(bytes), directory: "CACHE", recursive: true });
    const { uri } = await plugins.Filesystem.getUri({ path, directory: "CACHE" });
    await plugins.Share.share({ title: name, files: [uri] });
    return;
  }
  const file = new File([bytes], name, { type: mime });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
    } catch (e) {
      if (e?.name !== "AbortError") throw e;
    }
    return;
  }
  await saveToSkarp(bytes, name); // no share support: fall back to a download
}

async function shareText(text) {
  const share = window.Capacitor?.Plugins?.Share;
  if (isNative() && share) {
    await share.share({ text });
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch (e) {
      if (e?.name !== "AbortError") throw e;
    }
    return;
  }
  await copyToClipboard(text);
}

function savedLine(saved) {
  const msg = saved.native ? tt("nt-saved-line", { path: saved.path }) : tt("nt-downloaded-line", { path: saved.path });
  return `<div class="tool-saved">${svg(P.check, 18)}<span>${esc(msg)}</span></div>`;
}

/** Save bytes and report only after the write really succeeded. */
async function saveWithReport(bytes, name, box) {
  try {
    const saved = await saveToSkarp(bytes, name);
    box.innerHTML = savedLine(saved) + (saved.native ? `<div class="tool-actions nt-center"><button type="button" class="tool-btn-sec" data-open-folder>${esc(tt("open-folder"))}</button></div>` : "");
    box.querySelector("[data-open-folder]")?.addEventListener("click", () => openSaveFolder());
    showToast(saved.native ? tt("nt-saved-line", { path: saved.path }) : tt("nt-downloaded-line", { path: saved.path }));
    return true;
  } catch (e) {
    box.innerHTML = `<div class="tool-status error"><strong>${esc(tt("failed", { msg: e?.message || e }))}</strong></div>`;
    return false;
  }
}

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), type, quality);
    } catch (e) {
      reject(e);
    }
  });

/** Decode an image honouring EXIF orientation. Returns { src, width, height, close() }. */
async function loadImage(file) {
  let bmp = null;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (_) {
    bmp = null;
  }
  if (bmp) return { src: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close?.() };
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    if (!img.naturalWidth) throw new Error("empty");
    return { src: img, width: img.naturalWidth, height: img.naturalHeight, close() {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error(tt("nt-too-big"));
  return { c, ctx };
}

const releaseCanvas = (c) => {
  c.width = 0;
  c.height = 0;
};

function bindSegLocal(el, onChange) {
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b || b.classList.contains("active")) return;
    el.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
    onChange?.(b.dataset.v);
  });
  return () => el.querySelector("button.active")?.dataset.v;
}

/** An <input type=file> wrapped so the tool gets (file) or null. */
function bindPicker({ input, info, onFile }) {
  input.addEventListener("change", () => {
    const file = input.files?.[0] || null;
    info.textContent = file ? `${file.name} · ${formatBytes(file.size)}` : "";
    onFile(file);
  });
}

/* ---------------------------------------------------------------- markup */
const segHtml = (id, items, active = 0, cls = "") =>
  `<div class="tool-seg ${cls}" id="${id}">${items
    .map(([v, key, raw], i) => `<button type="button" data-v="${v}" class="${i === active ? "active" : ""}"${key ? ` data-tt="${key}"` : ""}>${raw || ""}</button>`)
    .join("")}</div>`;

const optRow = (labelKey, body, stack = false) =>
  `<div class="tool-opt${stack ? " tool-opt-stack" : ""}"><span class="tool-opt-label" data-tt="${labelKey}"></span>${body}</div>`;

const dropHtml = (id, accept = "image/*") => `
  <label class="tool-drop" id="${id}Drop">
    <input type="file" accept="${accept}" id="${id}File" hidden />
    <span class="tool-drop-icon">${svg(P.img, 30)}</span>
    <span class="tool-drop-text" data-tt="nt-pick-image"></span>
    <small class="tool-drop-info" id="${id}Info"></small>
  </label>`;

export function newToolPages(subHeader) {
  return `
<!-- ============ Image Converter ============ -->
<section class="tool-sub-page hidden" id="tool-imgconv">
  ${subHeader("Image Converter")}
  <p class="tool-hint" data-tt="icv-hint"></p>
  ${dropHtml("icv", "image/jpeg,image/png,image/webp,image/*")}
  <img class="tool-preview hidden" id="icvPreview" alt="" />
  ${optRow("icv-format", segHtml("icvFormat", [["jpeg", "", "JPG"], ["png", "", "PNG"], ["webp", "", "WebP"]]))}
  <div class="nt-block" id="icvQualityBox">
    <div class="nt-row"><span class="tool-opt-label" data-tt="icv-quality"></span><b id="icvQualityVal">85%</b></div>
    <input type="range" class="nt-range" id="icvQuality" min="40" max="100" step="1" value="85" />
  </div>
  <p class="nt-note hidden" id="icvLossless" data-tt="icv-lossless"></p>
  ${optRow("icv-size", segHtml("icvSize", [["orig", "icv-orig"], ["75", "", "75%"], ["50", "", "50%"], ["25", "", "25%"], ["max", "icv-custom"]], 0, "tool-seg-wrap"), true)}
  <div class="nt-block hidden" id="icvCustomBox"><input ${field("icvCustom", 'type="text" inputmode="numeric" data-tt-ph="icv-custom-ph"')} /></div>
  <button class="tool-btn" id="icvRun" disabled data-tt="icv-run"></button>
  <div class="tool-status hidden" id="icvStatus"></div>
  <div class="tool-result hidden" id="icvResult"></div>
</section>

<!-- ============ QR Code Generator ============ -->
<section class="tool-sub-page hidden" id="tool-qrgen">
  ${subHeader("QR Code Generator")}
  <p class="tool-hint" data-tt="qr-hint"></p>
  ${segHtml("qrType", [["text", "qr-type-text"], ["url", "qr-type-url"], ["wifi", "qr-type-wifi"], ["contact", "qr-type-contact"]], 0, "tool-seg-wrap nt-seg-gap")}
  <div class="nt-panel" data-qr-panel="text"><textarea ${field("qrText", 'rows="4" data-tt-ph="qr-text-ph"')}></textarea></div>
  <div class="nt-panel hidden" data-qr-panel="url"><input ${field("qrUrl", 'type="text" inputmode="url" data-tt-ph="qr-url-ph"')} /></div>
  <div class="nt-panel hidden" data-qr-panel="wifi">
    <label class="nt-label" for="qrSsid" data-tt="qr-ssid"></label>
    <input ${field("qrSsid", 'type="text" maxlength="64"')} />
    <div id="qrPassWrap">
      <label class="nt-label" for="qrPass" data-tt="qr-pass"></label>
      <div class="tool-input nt-passrow"><input ${field("qrPass", 'type="password" maxlength="80"')} /><button type="button" class="tool-input-btn" id="qrPassToggle" aria-label="Show password">${svg("M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z", 20)}</button></div>
    </div>
    ${optRow("qr-security", segHtml("qrSec", [["WPA", "qr-sec-wpa"], ["WEP", "qr-sec-wep"], ["nopass", "qr-sec-none"]], 0, "tool-seg-wrap"), true)}
    <label class="nt-check"><input type="checkbox" id="qrHidden" /><span data-tt="qr-hidden"></span></label>
  </div>
  <div class="nt-panel hidden" data-qr-panel="contact">
    <label class="nt-label" for="qrCName" data-tt="qr-c-name"></label><input ${field("qrCName", 'type="text" autocapitalize="words"')} />
    <label class="nt-label" for="qrCPhone" data-tt="qr-c-phone"></label><input ${field("qrCPhone", 'type="text" inputmode="tel"')} />
    <label class="nt-label" for="qrCEmail" data-tt="qr-c-email"></label><input ${field("qrCEmail", 'type="text" inputmode="email"')} />
    <label class="nt-label" for="qrCOrg" data-tt="qr-c-org"></label><input ${field("qrCOrg", 'type="text" autocapitalize="words"')} />
    <label class="nt-label" for="qrCUrl" data-tt="qr-c-url"></label><input ${field("qrCUrl", 'type="text" inputmode="url"')} />
  </div>
  <div class="nt-colors">
    <label class="nt-color"><span data-tt="qr-fg"></span><input type="color" id="qrFg" value="#111111" /></label>
    <label class="nt-color"><span data-tt="qr-bg"></span><input type="color" id="qrBg" value="#ffffff" /></label>
    <button type="button" class="tool-btn-sec" id="qrResetColors" data-tt="qr-reset"></button>
  </div>
  <div class="tool-status hidden" id="qrStatus"></div>
  <div class="nt-qr-box"><canvas id="qrCanvas" class="hidden" aria-label="QR Code"></canvas><p class="nt-qr-empty" id="qrEmpty" data-tt="qr-preview-empty"></p></div>
  <div class="tool-actions nt-actions-2">
    <button class="tool-btn" id="qrSave" data-tt="qr-save"></button>
    <button class="tool-btn-sec nt-big" id="qrShare" data-tt="nt-share"></button>
  </div>
  <div id="qrSaved"></div>
</section>

<!-- ============ OCR Text Scanner ============ -->
<section class="tool-sub-page hidden" id="tool-ocr">
  ${subHeader("OCR Text Scanner")}
  <p class="tool-hint" data-tt="ocr-hint"></p>
  ${dropHtml("ocr")}
  <img class="tool-preview hidden" id="ocrPreview" alt="" />
  ${optRow("ocr-lang", segHtml("ocrLang", [["ind+eng", "ocr-lang-both"], ["eng", "ocr-lang-en"], ["ind", "ocr-lang-id"]], 0, "tool-seg-wrap"), true)}
  <button class="tool-btn" id="ocrRun" disabled data-tt="ocr-run"></button>
  <div class="tool-status hidden" id="ocrStatus"></div>
  <div class="tool-result hidden" id="ocrResult">
    <div class="nt-row"><span class="tool-opt-label" data-tt="ocr-result"></span><small id="ocrStats" class="nt-dim"></small></div>
    <textarea ${field("ocrText", 'rows="10" data-tt-ph="ocr-ph"')}></textarea>
    <div class="nt-empty hidden" id="ocrEmpty"><b data-tt="ocr-empty"></b><small data-tt="ocr-empty-d"></small></div>
    <div class="tool-actions nt-actions-3">
      <button class="tool-btn-sec" id="ocrCopy" data-tt="nt-copy-all"></button>
      <button class="tool-btn-sec" id="ocrShare" data-tt="nt-share"></button>
      <button class="tool-btn-sec" id="ocrRescan" data-tt="ocr-rescan"></button>
    </div>
  </div>
</section>

<!-- ============ JSON Formatter ============ -->
<section class="tool-sub-page hidden" id="tool-jsonfmt">
  ${subHeader("JSON Formatter")}
  <p class="tool-hint" data-tt="json-hint"></p>
  <label class="nt-label" for="jsonIn" data-tt="json-input"></label>
  <textarea ${field("jsonIn", 'rows="9" wrap="off" data-tt-ph="json-input-ph" class="nt-mono"')}></textarea>
  ${optRow("json-indent", segHtml("jsonIndent", [["2", "", "2"], ["4", "", "4"], ["\t", "json-indent-tab"]]))}
  <div class="tool-actions nt-actions-2">
    <button class="tool-btn" id="jsonFormat" data-tt="json-format"></button>
    <button class="tool-btn-sec nt-big" id="jsonMinify" data-tt="json-minify"></button>
  </div>
  <div class="tool-actions nt-actions-4">
    <button class="tool-btn-sec" id="jsonValidate" data-tt="json-validate"></button>
    <button class="tool-btn-sec" id="jsonSample" data-tt="json-sample"></button>
    <button class="tool-btn-sec" id="jsonCopy" data-tt="nt-copy"></button>
    <button class="tool-btn-sec" id="jsonClear" data-tt="nt-clear"></button>
  </div>
  <div class="tool-status hidden" id="jsonStatus"></div>
  <div class="nt-outwrap hidden" id="jsonOutWrap">
    <div class="nt-row"><span class="tool-opt-label" data-tt="json-output"></span><small class="nt-dim" id="jsonOutInfo"></small></div>
    <pre class="nt-out" id="jsonOut" tabindex="0"></pre>
  </div>
</section>

<!-- ============ Color Picker ============ -->
<section class="tool-sub-page hidden" id="tool-colorpick">
  ${subHeader("Color Picker")}
  <p class="tool-hint" data-tt="color-hint"></p>
  ${dropHtml("cp")}
  <div class="tool-status hidden" id="cpStatus"></div>
  <div class="nt-stage hidden" id="cpStage"><div class="nt-stage-inner" id="cpWrap"><canvas id="cpCanvas"></canvas><span class="nt-marker hidden" id="cpMarker"></span></div><p class="nt-note nt-center" data-tt="color-tap"></p></div>
  <div class="tool-card-static nt-colorcard" id="cpCard">
    <div class="nt-swatch" id="cpSwatch"></div>
    <div class="nt-codes">
      <div class="nt-code"><span data-tt="color-hex"></span><b id="cpHex">—</b><button type="button" class="tool-btn-sec" data-cp-copy="hex" data-tt="nt-copy"></button></div>
      <div class="nt-code"><span data-tt="color-rgb"></span><b id="cpRgb">—</b><button type="button" class="tool-btn-sec" data-cp-copy="rgb" data-tt="nt-copy"></button></div>
      <div class="nt-code"><span data-tt="color-hsl"></span><b id="cpHsl">—</b><button type="button" class="tool-btn-sec" data-cp-copy="hsl" data-tt="nt-copy"></button></div>
    </div>
    <small class="nt-dim" id="cpPixel" data-tt="color-none"></small>
  </div>
  <div class="tool-card-static">
    <div class="nt-row"><h4 class="nt-h" data-tt="color-history"></h4><button type="button" class="tool-btn-sec" id="cpClear" data-tt="color-clear-history"></button></div>
    <div class="nt-history" id="cpHistory"></div>
  </div>
</section>`;
}

/* ============================================================ Image Converter */
function mountImageConverter() {
  const file$ = $("icvFile");
  const info = $("icvInfo");
  const preview = $("icvPreview");
  const runBtn = $("icvRun");
  const status = $("icvStatus");
  const result = $("icvResult");
  const qualityEl = $("icvQuality");
  const customEl = $("icvCustom");
  let file = null;
  let previewUrl = null;
  let dims = null;
  let token = 0;
  let busy = false;
  let resultUrl = null;

  const webpOk = (() => {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      return c.toDataURL("image/webp").startsWith("data:image/webp");
    } catch (_) {
      return false;
    }
  })();
  if (!webpOk) {
    const b = $("icvFormat").querySelector('[data-v="webp"]');
    b.disabled = true;
    b.title = tt("icv-no-webp");
    b.classList.add("nt-disabled");
  }

  const format = bindSegLocal($("icvFormat"), () => syncOptions());
  const sizeMode = bindSegLocal($("icvSize"), (v) => {
    $("icvCustomBox").classList.toggle("hidden", v !== "max");
  });

  function syncOptions() {
    const lossless = format() === "png";
    $("icvQualityBox").classList.toggle("hidden", lossless);
    $("icvLossless").classList.toggle("hidden", !lossless);
  }
  syncOptions();
  qualityEl.addEventListener("input", () => ($("icvQualityVal").textContent = `${qualityEl.value}%`));

  function reset() {
    token++;
    hide(result);
    hide(status);
    result.innerHTML = "";
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }

  bindPicker({
    input: file$,
    info,
    onFile: async (f) => {
      reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      file = f;
      dims = null;
      if (!f) {
        hide(preview);
        runBtn.disabled = true;
        return;
      }
      const my = token;
      previewUrl = URL.createObjectURL(f);
      preview.src = previewUrl;
      show(preview);
      runBtn.disabled = true;
      try {
        const img = await loadImage(f);
        if (my !== token) return img.close();
        dims = { width: img.width, height: img.height };
        img.close();
        info.textContent = `${f.name} · ${formatBytes(f.size)} · ${dims.width}×${dims.height}`;
        runBtn.disabled = false;
      } catch (_) {
        if (my !== token) return;
        hide(preview);
        errBox(status, tt("nt-load-fail"));
      }
    },
  });

  runBtn.addEventListener("click", async () => {
    if (busy) return;
    if (!file || !dims) return errBox(status, tt("nt-no-image"));
    const fmt = format();
    let mode = "orig";
    let value = 100;
    const sz = sizeMode();
    if (sz === "75" || sz === "50" || sz === "25") {
      mode = "pct";
      value = Number(sz);
    } else if (sz === "max") {
      const n = Number(String(customEl.value).trim());
      if (!Number.isFinite(n) || n < 16 || n > 16000) return errBox(status, tt("icv-bad-custom"));
      mode = "max";
      value = Math.round(n);
    }
    const my = ++token;
    busy = true;
    runBtn.disabled = true;
    hide(result);
    setStatusBox(status, `${spin}<span>${esc(tt("icv-working"))}</span>`);
    await nextFrame();
    let canvas = null;
    let img = null;
    try {
      img = await loadImage(file);
      const { width, height, capped } = targetSize(img.width, img.height, mode, value);
      const made = makeCanvas(width, height);
      canvas = made.c;
      if (fmt === "jpeg") {
        made.ctx.fillStyle = "#ffffff"; // JPEG has no alpha
        made.ctx.fillRect(0, 0, width, height);
      }
      made.ctx.imageSmoothingEnabled = true;
      made.ctx.imageSmoothingQuality = "high";
      made.ctx.drawImage(img.src, 0, 0, width, height);
      img.close();
      img = null;
      const mime = `image/${fmt}`;
      const blob = await canvasToBlob(canvas, mime, fmt === "png" ? undefined : Number(qualityEl.value) / 100);
      if (blob.type !== mime) throw new Error(tt("icv-fmt-fail", { fmt: fmt === "jpeg" ? "JPG" : fmt.toUpperCase() }));
      if (my !== token) return; // user picked another image meanwhile
      hide(status);
      await renderResult({ blob, fmt, width, height, capped });
    } catch (e) {
      if (my !== token) return;
      console.warn("[tools/imgconv]", e);
      errBox(status, tt("failed", { msg: e?.message || e }));
    } finally {
      img?.close();
      if (canvas) releaseCanvas(canvas);
      busy = false;
      runBtn.disabled = !file;
    }
  });

  async function renderResult({ blob, fmt, width, height, capped }) {
    const ext = fmt === "jpeg" ? "jpg" : fmt;
    const name = stampName("Convert", ext);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(blob);
    const diff = blob.size - file.size;
    const pct = Math.round((Math.abs(diff) / file.size) * 100);
    const delta = diff === 0 ? "" : diff < 0 ? tt("icv-smaller", { pct }) : tt("icv-larger", { pct });
    result.innerHTML = `
      <div class="tool-card-static">
        <h4 class="nt-h">${esc(tt("icv-result"))} · ${esc(ext.toUpperCase())}</h4>
        <div class="nt-checker"><img class="nt-result-img" src="${resultUrl}" alt="" /></div>
        <div class="pdf-sizes nt-sizes">
          <div><b>${esc(formatBytes(file.size))}</b><span>${dims.width}×${dims.height}</span></div>
          <div class="pdf-arrow">→</div>
          <div><b>${esc(formatBytes(blob.size))}</b><span>${width}×${height}</span></div>
        </div>
        ${delta ? `<div class="pdf-pct${diff > 0 ? " nt-worse" : ""}">${esc(delta)}</div>` : ""}
        ${capped ? `<p class="nt-note nt-center">${esc(tt("icv-capped"))}</p>` : ""}
        <div class="tool-actions nt-actions-2">
          <button class="tool-btn" data-act="save">${esc(tt("nt-save"))}</button>
          <button class="tool-btn-sec nt-big" data-act="share">${esc(tt("nt-share"))}</button>
        </div>
        <div class="nt-saved" data-saved></div>
      </div>`;
    show(result);
    const saved = result.querySelector("[data-saved]");
    const bytes = async () => new Uint8Array(await blob.arrayBuffer());
    result.querySelector('[data-act="save"]').addEventListener("click", async () => saveWithReport(await bytes(), name, saved));
    result.querySelector('[data-act="share"]').addEventListener("click", async () => {
      try {
        await shareBytes(await bytes(), name, blob.type);
      } catch (e) {
        showToast(tt("nt-share-fail"));
      }
    });
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ============================================================ QR Code Generator */
let qrLib = null;
async function getQr() {
  if (!qrLib) {
    const mod = await import("../vendor/qrcode.mjs");
    qrLib = mod.default;
    // The library ships a Latin-1 encoder; scanners expect UTF-8 for non-ASCII text.
    qrLib.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));
  }
  return qrLib;
}

function mountQr() {
  const canvas = $("qrCanvas");
  const empty = $("qrEmpty");
  const status = $("qrStatus");
  const fgEl = $("qrFg");
  const bgEl = $("qrBg");
  let type = "text";
  let payload = null; // last valid payload
  let timer = 0;
  let seq = 0;

  const typePick = bindSegLocal($("qrType"), (v) => {
    type = v;
    document.querySelectorAll("#tool-qrgen [data-qr-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.qrPanel !== v));
    refresh(false);
  });
  const sec = bindSegLocal($("qrSec"), () => {
    syncWifiUi();
    refresh(false);
  });
  const passEl = $("qrPass");
  function syncWifiUi() {
    $("qrPassWrap").classList.toggle("hidden", sec() === "nopass");
  }
  syncWifiUi();
  $("qrPassToggle").addEventListener("click", () => {
    const showing = passEl.type === "text";
    passEl.type = showing ? "password" : "text";
    $("qrPassToggle").setAttribute("aria-label", tt(showing ? "qr-show-pass" : "qr-hide-pass"));
  });

  const val = (id) => $(id).value;
  function build() {
    switch (type) {
      case "text":
        return buildText(val("qrText"));
      case "url":
        return normalizeUrl(val("qrUrl"));
      case "wifi":
        return buildWifi({ ssid: val("qrSsid"), password: passEl.value, security: sec(), hidden: $("qrHidden").checked });
      default:
        return buildVCard({ name: val("qrCName"), phone: val("qrCPhone"), email: val("qrCEmail"), org: val("qrCOrg"), url: val("qrCUrl") });
    }
  }
  const isBlank = () => {
    const ids = { text: ["qrText"], url: ["qrUrl"], wifi: ["qrSsid", "qrPass"], contact: ["qrCName", "qrCPhone", "qrCEmail", "qrCOrg", "qrCUrl"] }[type];
    return ids.every((id) => !val(id).trim());
  };

  function clearPreview() {
    payload = null;
    hide(canvas);
    show(empty);
  }

  /** Validate + render. `strict` also reports empty input as an error (Save/Share). Returns true when a QR is ready. */
  async function refresh(strict) {
    const my = ++seq;
    const fg = parseHex(fgEl.value);
    const bg = parseHex(bgEl.value);
    let text;
    try {
      text = build();
    } catch (e) {
      if (!(e instanceof InputError)) throw e;
      clearPreview();
      // an untouched form stays quiet; Save/Share (strict) and partly filled forms report the problem
      if (strict || !isBlank()) errBox(status, tt(`qr-err-${e.code}`));
      else hide(status);
      return false;
    }
    const ratio = contrastRatio(fg, bg);
    if (ratio < 3) {
      clearPreview();
      errBox(status, tt("qr-low-contrast"));
      return false;
    }
    let qr;
    try {
      const Q = await getQr();
      if (my !== seq) return false;
      for (const level of ["M", "L"]) {
        try {
          qr = Q(0, level);
          qr.addData(text, "Byte");
          qr.make();
          break;
        } catch (e) {
          qr = null;
        }
      }
    } catch (e) {
      console.warn("[tools/qr]", e);
      clearPreview();
      errBox(status, tt("failed", { msg: e?.message || e }));
      return false;
    }
    if (!qr) {
      clearPreview();
      errBox(status, tt("qr-too-long"));
      return false;
    }
    drawQr(qr, fg, bg);
    payload = text;
    if (luminance(fg) > luminance(bg)) setStatusBox(status, `<span>${esc(tt("qr-inverted"))}</span>`, "busy");
    else hide(status);
    hide(empty);
    show(canvas);
    return true;
  }

  function drawQr(qr, fg, bg) {
    const n = qr.getModuleCount();
    const quiet = 4;
    const cell = Math.max(2, Math.floor(1024 / (n + quiet * 2)));
    const size = cell * (n + quiet * 2);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = toHex(bg);
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = toHex(fg);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
      }
    }
  }

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => refresh(false), 180);
  };
  document.querySelectorAll("#tool-qrgen input, #tool-qrgen textarea").forEach((el) => {
    if (el.type === "file") return;
    el.addEventListener("input", schedule);
    el.addEventListener("change", schedule);
  });
  $("qrResetColors").addEventListener("click", () => {
    fgEl.value = "#111111";
    bgEl.value = "#ffffff";
    refresh(false);
  });

  const pngBytes = async () => new Uint8Array(await (await canvasToBlob(canvas, "image/png")).arrayBuffer());
  $("qrSave").addEventListener("click", async () => {
    if (!(await refresh(true))) return;
    try {
      await saveWithReport(await pngBytes(), stampName("QR", "png"), $("qrSaved"));
    } catch (e) {
      errBox(status, tt("failed", { msg: e?.message || e }));
    }
  });
  $("qrShare").addEventListener("click", async () => {
    if (!(await refresh(true))) return;
    try {
      await shareBytes(await pngBytes(), stampName("QR", "png"), "image/png");
    } catch (e) {
      showToast(tt("nt-share-fail"));
    }
  });
}

/* ============================================================ OCR */
const OCR_BASE = new URL("../vendor/ocr/", import.meta.url).href;
const SIMD_PROBE = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);

function mountOcr() {
  const file$ = $("ocrFile");
  const info = $("ocrInfo");
  const preview = $("ocrPreview");
  const runBtn = $("ocrRun");
  const status = $("ocrStatus");
  const result = $("ocrResult");
  const textEl = $("ocrText");
  const lang = bindSegLocal($("ocrLang"));
  let file = null;
  let previewUrl = null;
  let worker = null;
  let busy = false;
  let cancelled = false;

  bindPicker({
    input: file$,
    info,
    onFile: (f) => {
      cancelWork();
      file = f;
      hide(result);
      hide(status);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      if (!f) {
        hide(preview);
        runBtn.disabled = true;
        return;
      }
      previewUrl = URL.createObjectURL(f);
      preview.src = previewUrl;
      show(preview);
      runBtn.disabled = false;
    },
  });
  preview.addEventListener("error", () => {
    hide(preview);
    errBox(status, tt("nt-load-fail"));
    runBtn.disabled = true;
    file = null;
  });

  function cancelWork() {
    if (worker) {
      cancelled = true;
      worker.terminate();
      worker = null;
    }
  }

  const stageText = { load: "ocr-st-load", data: "ocr-st-data", recognize: "ocr-st-read" };
  function paintStatus(stage, progress) {
    const pct = Math.round(progress * 100);
    setStatusBox(
      status,
      `${spin}<span class="nt-grow">${esc(tt(stageText[stage] || "ocr-st-load"))} ${stage === "recognize" ? pct + "%" : ""}</span><button type="button" class="tool-btn-sec" id="ocrCancel">${esc(tt("nt-cancel"))}</button>`,
    );
    $("ocrCancel").addEventListener("click", () => {
      cancelWork();
      hide(status);
      busy = false;
      runBtn.disabled = !file;
      showToast(tt("ocr-cancelled"));
    });
  }

  /** Decode, fix orientation and scale to a size Tesseract reads well; returns PNG bytes. */
  async function prepareImage() {
    const img = await loadImage(file);
    let canvas;
    try {
      if (img.width * img.height > 150e6) throw new Error(tt("nt-too-big"));
      // Tesseract does best with text ~20-30px tall: shrink huge photos, enlarge small ones.
      let w = img.width;
      let h = img.height;
      const longest = Math.max(w, h);
      if (longest > 2600) ({ width: w, height: h } = fitWithin(w, h, 2600));
      else if (longest < 1000) {
        const k = Math.min(2, 1400 / longest);
        w = Math.round(w * k);
        h = Math.round(h * k);
      }
      const made = makeCanvas(w, h);
      canvas = made.c;
      made.ctx.fillStyle = "#fff";
      made.ctx.fillRect(0, 0, w, h);
      made.ctx.imageSmoothingQuality = "high";
      made.ctx.drawImage(img.src, 0, 0, w, h);
      const blob = await canvasToBlob(canvas, "image/png");
      return await blob.arrayBuffer();
    } finally {
      img.close();
      if (canvas) releaseCanvas(canvas);
    }
  }

  function runWorker(langs, image) {
    return new Promise((resolve, reject) => {
      if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") return reject(new Error(tt("ocr-unsupported")));
      const w = new Worker(OCR_BASE + "ocr-worker.js");
      worker = w;
      let nid = 0;
      const pending = new Map();
      const call = (msg, transfer) =>
        new Promise((res, rej) => {
          const id = ++nid;
          pending.set(id, { res, rej });
          w.postMessage({ id, ...msg }, transfer || []);
        });
      w.onmessage = ({ data }) => {
        if (data.id == null) {
          if (!cancelled) paintStatus(data.stage, data.progress);
          return;
        }
        const p = pending.get(data.id);
        pending.delete(data.id);
        if (p) data.ok ? p.res(data) : p.rej(new Error(data.error));
      };
      w.onerror = (e) => {
        const err = new Error(e.message || "OCR worker failed");
        pending.forEach((p) => p.rej(err));
        pending.clear();
        reject(err);
      };
      (async () => {
        const simd = WebAssembly.validate(SIMD_PROBE);
        await call({
          type: "init",
          coreUrl: OCR_BASE + (simd ? "tesseract-core-simd-lstm.wasm.js" : "tesseract-core-lstm.wasm.js"),
          langs: langs.map((code) => ({ code, url: `${OCR_BASE}${code}.traineddata` })),
        });
        const out = await call({ type: "recognize", image }, [image]);
        return { text: out.text, confidence: out.confidence };
      })()
        .then(resolve, reject)
        .finally(() => {
          w.terminate();
          if (worker === w) worker = null;
        });
    });
  }

  async function scan() {
    if (busy) return;
    if (!file) return errBox(status, tt("nt-no-image"));
    busy = true;
    cancelled = false;
    runBtn.disabled = true;
    hide(result);
    paintStatus("load", 0.02);
    try {
      const image = await prepareImage();
      const out = await runWorker(lang().split("+"), image);
      if (cancelled) return;
      hide(status);
      showResult(out);
    } catch (e) {
      if (cancelled) return;
      console.warn("[tools/ocr]", e);
      errBox(status, tt("failed", { msg: e?.message || e }));
    } finally {
      if (!cancelled) {
        busy = false;
        runBtn.disabled = !file;
      }
    }
  }

  function updateStats(conf) {
    const text = textEl.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    $("ocrStats").textContent = tt("ocr-stats", { words, chars: text.length, conf: conf ?? "–" });
  }
  let lastConf = null;
  function showResult({ text, confidence }) {
    textEl.value = text.replace(/\s+$/g, "");
    lastConf = Math.round(confidence);
    show(result);
    const none = !textEl.value.trim();
    $("ocrEmpty").classList.toggle("hidden", !none);
    textEl.classList.toggle("hidden", none);
    $("ocrStats").textContent = "";
    if (!none) updateStats(lastConf);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  textEl.addEventListener("input", () => updateStats(lastConf));

  runBtn.addEventListener("click", scan);
  $("ocrRescan").addEventListener("click", scan);
  $("ocrCopy").addEventListener("click", () => {
    const v = textEl.value;
    if (!v.trim()) return showToast(tt("nt-nothing-copy"));
    copyToClipboard(v);
  });
  $("ocrShare").addEventListener("click", async () => {
    const v = textEl.value;
    if (!v.trim()) return showToast(tt("nt-nothing-copy"));
    try {
      await shareText(v);
    } catch (_) {
      showToast(tt("nt-share-fail"));
    }
  });
}

/* ============================================================ JSON Formatter */
function mountJson() {
  const input = $("jsonIn");
  const status = $("jsonStatus");
  const outWrap = $("jsonOutWrap");
  const out = $("jsonOut");
  const indent = bindSegLocal($("jsonIndent"));
  let output = "";

  const indentVal = () => {
    const v = indent();
    return v === "\t" ? "\t" : Number(v) || 2;
  };

  function jsonErrorHtml(e) {
    const msg = tt(`json-err-${e.code}`, { ch: e.extra?.ch ?? "", close: e.extra?.close ?? "" });
    const where = e.code === "empty" ? "" : `<small>${esc(tt("json-at", { line: e.line, col: e.col }))}</small>`;
    let snippet = "";
    if (e.lineText) {
      const col = Math.max(1, e.col);
      const start = Math.max(0, col - 41);
      const line = e.lineText.slice(start, start + 80).replace(/\t/g, " ");
      snippet = `<pre class="nt-snippet">${esc(line)}\n${" ".repeat(Math.max(0, col - 1 - start))}^</pre>`;
    }
    return `<strong>${esc(tt("json-invalid"))}</strong><span>${esc(msg)}</span>${where}${snippet}`;
  }

  function showError(e) {
    output = "";
    hide(outWrap);
    setStatusBox(status, jsonErrorHtml(e), "error");
  }

  function run(mode) {
    let node;
    try {
      node = parseJson(input.value);
    } catch (e) {
      if (!(e instanceof JsonError)) throw e;
      return showError(e);
    }
    const d = describeJson(node);
    const size = d.size == null ? "" : tt(d.type === "object" ? "json-keys" : "json-items", { n: d.size });
    const info = tt("json-valid-d", { type: tt(`json-t-${d.type}`), size });
    setStatusBox(status, `<div class="nt-ok">${svg(P.check, 18)}<strong>${esc(tt("json-valid"))}</strong><span>${esc(info)}</span></div>`, "ok");
    if (mode === "validate") return;
    output = stringifyJson(node, mode === "minify" ? 0 : indentVal());
    out.textContent = output;
    $("jsonOutInfo").textContent = `${formatBytes(new Blob([output]).size)}`;
    show(outWrap);
    out.scrollTop = 0;
    out.scrollLeft = 0;
  }

  $("jsonFormat").addEventListener("click", () => run("format"));
  $("jsonMinify").addEventListener("click", () => run("minify"));
  $("jsonValidate").addEventListener("click", () => run("validate"));
  $("jsonSample").addEventListener("click", () => {
    input.value = JSON_SAMPLE;
    run("format");
  });
  $("jsonCopy").addEventListener("click", () => {
    if (!output) return showToast(tt("nt-nothing-copy"));
    copyToClipboard(output);
  });
  $("jsonClear").addEventListener("click", () => {
    input.value = "";
    output = "";
    out.textContent = "";
    hide(outWrap);
    hide(status);
    input.focus();
  });
}

/* ============================================================ Color Picker */
const HISTORY_KEY = "skarp_color_history";
const readHistory = () => {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(v) ? v.filter((h) => parseHex(h)).slice(0, 30) : [];
  } catch (_) {
    return [];
  }
};
const writeHistory = (list) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (_) {}
};

function mountColor() {
  const file$ = $("cpFile");
  const pixelInfo = $("cpPixel");
  const status = $("cpStatus");
  const stage = $("cpStage");
  const canvas = $("cpCanvas");
  const wrap = $("cpWrap");
  const marker = $("cpMarker");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let hasImage = false;
  let current = null; // {r,g,b,a,x,y}
  let history = readHistory();
  let dragging = false;
  let seq = 0;

  const fmt = (c) => ({
    hex: toHex(c),
    rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
    hsl: (() => {
      const h = rgbToHsl(c);
      return `hsl(${h.h}, ${h.s}%, ${h.l}%)`;
    })(),
  });

  function paintCurrent() {
    if (!current) {
      $("cpSwatch").style.background = "";
      $("cpSwatch").classList.remove("has");
      ["cpHex", "cpRgb", "cpHsl"].forEach((id) => ($(id).textContent = "—"));
      pixelInfo.textContent = tt("color-none");
      return;
    }
    const f = fmt(current);
    const sw = $("cpSwatch");
    sw.style.background = f.hex;
    sw.classList.add("has");
    $("cpHex").textContent = f.hex;
    $("cpRgb").textContent = f.rgb;
    $("cpHsl").textContent = f.hsl;
    pixelInfo.textContent = current.a === 0 ? tt("color-transparent") : current.x != null ? tt("color-pos", { x: current.x, y: current.y }) : "";
  }

  function paintHistory() {
    const box = $("cpHistory");
    if (!history.length) {
      box.innerHTML = `<p class="nt-dim">${esc(tt("color-empty-history"))}</p>`;
      return;
    }
    box.innerHTML = history.map((h) => `<button type="button" class="nt-chip" data-hex="${esc(h)}" aria-label="${esc(h)}"><i style="background:${esc(h)}"></i><span>${esc(h)}</span></button>`).join("");
  }

  function placeMarker() {
    if (!current || current.x == null || !hasImage) return hide(marker);
    const cr = canvas.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    if (!cr.width) return;
    const left = cr.left - wr.left + ((current.x + 0.5) / canvas.width) * cr.width;
    const top = cr.top - wr.top + ((current.y + 0.5) / canvas.height) * cr.height;
    marker.style.left = `${left}px`;
    marker.style.top = `${top}px`;
    show(marker);
  }

  function sample(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    // map CSS pixels to image pixels, whatever scaling the layout applied; clamp to the image
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(((clientX - r.left) / r.width) * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(((clientY - r.top) / r.height) * canvas.height)));
    const d = ctx.getImageData(x, y, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3], x, y };
  }

  function pick(e) {
    if (!hasImage) return;
    const c = sample(e.clientX, e.clientY);
    if (!c) return;
    current = c;
    paintCurrent();
    placeMarker();
  }

  function commit() {
    if (!current || current.a === 0) return;
    const hex = toHex(current);
    history = [hex, ...history.filter((h) => h !== hex)].slice(0, 30);
    writeHistory(history);
    paintHistory();
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!hasImage) return;
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    pick(e);
    e.preventDefault();
  });
  canvas.addEventListener("pointermove", (e) => dragging && pick(e));
  const end = () => {
    if (!dragging) return;
    dragging = false;
    commit();
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(placeMarker).observe(canvas);
  window.addEventListener("resize", placeMarker);

  bindPicker({
    input: file$,
    info: $("cpInfo"),
    onFile: async (f) => {
      const my = ++seq;
      hide(status);
      if (!f) {
        hasImage = false;
        hide(stage);
        return;
      }
      let img;
      try {
        img = await loadImage(f);
        if (my !== seq) return img.close();
        if (img.width * img.height > 150e6) throw new Error(tt("nt-too-big"));
        // work at up to 4096 px on the long side; coordinates are mapped back correctly either way
        const { width, height } = fitWithin(img.width, img.height, 4096);
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img.src, 0, 0, width, height);
        img.close();
        hasImage = true;
        current = null;
        paintCurrent();
        show(stage);
        hide(marker);
      } catch (e) {
        img?.close();
        if (my !== seq) return;
        hasImage = false;
        hide(stage);
        errBox(status, e?.message === tt("nt-too-big") ? e.message : tt("nt-load-fail"));
      }
    },
  });
  $("tool-colorpick").addEventListener("click", (e) => {
    const copy = e.target.closest("[data-cp-copy]");
    if (copy) {
      if (!current) return showToast(hasImage ? tt("color-none") : tt("nt-no-image"));
      return void copyToClipboard(fmt(current)[copy.dataset.cpCopy]);
    }
    const chip = e.target.closest(".nt-chip");
    if (chip) {
      const c = parseHex(chip.dataset.hex);
      if (c) {
        current = { ...c, a: 255, x: null, y: null };
        paintCurrent();
        hide(marker);
      }
    }
  });
  $("cpClear").addEventListener("click", () => {
    history = [];
    writeHistory(history);
    paintHistory();
  });
  paintCurrent();
  paintHistory();
}

/* ============================================================ entry */
export function mountNewTools({ t, root }) {
  T = t;
  mountImageConverter();
  mountQr();
  mountOcr();
  mountJson();
  mountColor();
  // Keep the focused field visible above the on-screen keyboard.
  root.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!el.matches?.("input:not([type=file]):not([type=checkbox]):not([type=color]), textarea")) return;
    setTimeout(() => {
      try {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch (_) {}
    }, 320);
  });
}
