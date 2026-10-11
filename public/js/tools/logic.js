// tools/logic.js — pure helpers for the Tools tab (no DOM, no network).
// Kept separate from the UI so it can be unit-tested with plain Node.

/* =====================================================================
 * JSON: strict parser that keeps the original text of numbers/strings,
 * so formatting never changes values (big integers, 1.0, 1e5, key order,
 * duplicate keys all survive).
 * ===================================================================== */

export class JsonError extends Error {
  constructor(code, pos, text, extra = {}) {
    super(code);
    this.code = code;
    this.pos = pos;
    this.extra = extra;
    const { line, col } = locate(text, pos);
    this.line = line;
    this.col = col;
    this.lineText = lineAt(text, line);
  }
}

/** 1-based line/column for a character offset. Handles \n, \r\n and lone \r. */
export function locate(text, pos) {
  let line = 1;
  let col = 1;
  const end = Math.min(pos, text.length);
  for (let i = 0; i < end; i++) {
    const c = text.charCodeAt(i);
    if (c === 10) {
      line++;
      col = 1;
    } else if (c === 13) {
      if (text.charCodeAt(i + 1) === 10) continue; // \r\n counts once, at the \n
      line++;
      col = 1;
    } else col++;
  }
  return { line, col };
}

function lineAt(text, line) {
  const lines = text.split(/\r\n|\n|\r/);
  return lines[line - 1] ?? "";
}

const MAX_DEPTH = 1500;
const isWs = (c) => c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d;
const isDigit = (c) => c >= 0x30 && c <= 0x39;
const isHex = (c) => isDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);

/**
 * Parse JSON text into a lossless tree:
 *   { t: "obj", items: [{ key: "<raw quoted>", value }] }
 *   { t: "arr", items: [value] }
 *   { t: "lit", raw: "<raw token>", kind: "string|number|true|false|null" }
 * Throws JsonError (code, line, col) on invalid input.
 */
export function parseJson(input) {
  let text = String(input ?? "");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  let i = 0;
  const n = text.length;

  const ws = () => {
    while (i < n && isWs(text.charCodeAt(i))) i++;
  };
  const show = (pos) => (pos < n ? text[pos] : "");
  const fail = (code, pos = i, extra) => {
    throw new JsonError(code, pos, text, { ch: show(pos), ...extra });
  };

  const parseString = () => {
    const start = i;
    i++; // opening quote
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 0x22) {
        i++;
        return text.slice(start, i);
      }
      if (c < 0x20) fail("ctrl-char", i);
      if (c === 0x5c) {
        const e = text[i + 1];
        if (e === undefined) fail("unterminated-string", start);
        if ('"\\/bfnrt'.includes(e)) i += 2;
        else if (e === "u") {
          for (let k = 2; k <= 5; k++) {
            if (i + k >= n || !isHex(text.charCodeAt(i + k))) fail("bad-escape", i + k < n ? i + k : i);
          }
          i += 6;
        } else fail("bad-escape", i + 1);
      } else i++;
    }
    return fail("unterminated-string", start);
  };

  const parseNumber = () => {
    const start = i;
    if (text[i] === "-") i++;
    if (text[i] === "0") {
      i++;
      if (i < n && isDigit(text.charCodeAt(i))) fail("bad-number", i); // leading zero
    } else if (i < n && text.charCodeAt(i) >= 0x31 && text.charCodeAt(i) <= 0x39) {
      while (i < n && isDigit(text.charCodeAt(i))) i++;
    } else fail("bad-number", i);
    if (text[i] === ".") {
      i++;
      if (!(i < n && isDigit(text.charCodeAt(i)))) fail("bad-number", i);
      while (i < n && isDigit(text.charCodeAt(i))) i++;
    }
    if (text[i] === "e" || text[i] === "E") {
      i++;
      if (text[i] === "+" || text[i] === "-") i++;
      if (!(i < n && isDigit(text.charCodeAt(i)))) fail("bad-number", i);
      while (i < n && isDigit(text.charCodeAt(i))) i++;
    }
    return text.slice(start, i);
  };

  const parseValue = (depth) => {
    if (depth > MAX_DEPTH) fail("too-deep", i);
    ws();
    if (i >= n) fail("unexpected-end", n);
    const c = text[i];
    if (c === "{") {
      const items = [];
      i++;
      ws();
      if (text[i] === "}") {
        i++;
        return { t: "obj", items };
      }
      for (;;) {
        ws();
        if (i >= n) fail("unexpected-end", n);
        if (text[i] !== '"') fail("expected-key", i);
        const key = parseString();
        ws();
        if (i >= n) fail("unexpected-end", n);
        if (text[i] !== ":") fail("expected-colon", i);
        i++;
        const value = parseValue(depth + 1);
        items.push({ key, value });
        ws();
        if (i >= n) fail("unexpected-end", n);
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "}") {
          i++;
          return { t: "obj", items };
        }
        fail("expected-comma-or-end", i, { close: "}" });
      }
    }
    if (c === "[") {
      const items = [];
      i++;
      ws();
      if (text[i] === "]") {
        i++;
        return { t: "arr", items };
      }
      for (;;) {
        items.push(parseValue(depth + 1));
        ws();
        if (i >= n) fail("unexpected-end", n);
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "]") {
          i++;
          return { t: "arr", items };
        }
        fail("expected-comma-or-end", i, { close: "]" });
      }
    }
    if (c === '"') return { t: "lit", kind: "string", raw: parseString() };
    if (c === "-" || isDigit(c.charCodeAt(0))) return { t: "lit", kind: "number", raw: parseNumber() };
    for (const word of ["true", "false", "null"]) {
      if (text.startsWith(word, i)) {
        const after = text.charCodeAt(i + word.length);
        if (!Number.isNaN(after) && /[A-Za-z0-9_]/.test(String.fromCharCode(after))) fail("unexpected-char", i + word.length);
        i += word.length;
        return { t: "lit", kind: word, raw: word };
      }
    }
    return fail("unexpected-char", i);
  };

  ws();
  if (i >= n) fail("empty", 0);
  const value = parseValue(0);
  ws();
  if (i < n) fail("trailing", i);
  return value;
}

/** indent: number of spaces, or "\t". */
export function stringifyJson(node, indent = 2) {
  const unit = indent === "\t" ? "\t" : " ".repeat(Math.max(0, Number(indent) || 0));
  const pretty = unit.length > 0;
  const out = [];
  // iterative to stay safe on deep documents
  const stack = [{ node, state: 0, idx: 0, level: 0 }];
  const nl = (level) => (pretty ? "\n" + unit.repeat(level) : "");
  while (stack.length) {
    const f = stack[stack.length - 1];
    const nd = f.node;
    if (nd.t === "lit") {
      out.push(nd.raw);
      stack.pop();
      continue;
    }
    const isObj = nd.t === "obj";
    const open = isObj ? "{" : "[";
    const close = isObj ? "}" : "]";
    if (f.state === 0) {
      out.push(open);
      f.state = 1;
      if (nd.items.length === 0) {
        out.push(close);
        stack.pop();
        continue;
      }
    }
    if (f.idx >= nd.items.length) {
      out.push(nl(f.level) + close);
      stack.pop();
      continue;
    }
    const item = nd.items[f.idx];
    out.push((f.idx > 0 ? "," : "") + nl(f.level + 1));
    f.idx++;
    if (isObj) {
      out.push(item.key + (pretty ? ": " : ":"));
      stack.push({ node: item.value, state: 0, idx: 0, level: f.level + 1 });
    } else {
      stack.push({ node: item, state: 0, idx: 0, level: f.level + 1 });
    }
  }
  return out.join("");
}

export const formatJson = (text, indent = 2) => stringifyJson(parseJson(text), indent);
export const minifyJson = (text) => stringifyJson(parseJson(text), 0);

/** Short description of the root value, e.g. { type: "object", size: 3 }. */
export function describeJson(node) {
  if (node.t === "obj") return { type: "object", size: node.items.length };
  if (node.t === "arr") return { type: "array", size: node.items.length };
  return { type: node.kind, size: null };
}

export const JSON_SAMPLE = `{
  "app": "SKARP",
  "version": 4.5,
  "tags": ["downloader", "tools", "offline"],
  "author": { "name": "Suika", "active": true, "website": null },
  "stats": { "downloads": 12345678901234567890, "rating": 4.50 }
}`;

/* =====================================================================
 * QR payloads
 * ===================================================================== */

export class InputError extends Error {
  constructor(code, extra = {}) {
    super(code);
    this.code = code;
    this.extra = extra;
  }
}

const utf8Len = (s) => new TextEncoder().encode(s).length;

/** Escape for the WIFI: format (ZXing spec): \ ; , : " */
export const escapeWifi = (s) => String(s).replace(/([\\;,:"])/g, "\\$1");

/**
 * security: "WPA" | "WEP" | "nopass". Returns "WIFI:T:WPA;S:ssid;P:pass;H:true;;"
 */
export function buildWifi({ ssid, password = "", security = "WPA", hidden = false }) {
  const name = String(ssid ?? "");
  if (!name.trim()) throw new InputError("wifi-ssid-empty");
  if (utf8Len(name) > 32) throw new InputError("wifi-ssid-long");
  if (security === "nopass") {
    return `WIFI:T:nopass;S:${escapeWifi(name)};${hidden ? "H:true;" : ""};`;
  }
  const pass = String(password ?? "");
  if (!pass) throw new InputError("wifi-pass-empty");
  if (security === "WPA") {
    if (pass.length < 8 || utf8Len(pass) > 63) throw new InputError("wifi-pass-wpa");
  } else if (security === "WEP") {
    const ok = /^[0-9a-fA-F]{10}$|^[0-9a-fA-F]{26}$/.test(pass) || /^[\x20-\x7e]{5}$|^[\x20-\x7e]{13}$/.test(pass);
    if (!ok) throw new InputError("wifi-pass-wep");
  } else throw new InputError("wifi-security");
  return `WIFI:T:${security};S:${escapeWifi(name)};P:${escapeWifi(pass)};${hidden ? "H:true;" : ""};`;
}

const vEsc = (s) =>
  String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

/** vCard 3.0, accepted by Android/iOS scanners. */
export function buildVCard({ name, phone = "", email = "", org = "", url = "" }) {
  const full = String(name ?? "").trim();
  if (!full) throw new InputError("contact-name-empty");
  const tel = String(phone).trim();
  const mail = String(email).trim();
  if (!tel && !mail) throw new InputError("contact-need-one");
  if (tel && !(/^[+()\-.\s\d]{5,25}$/.test(tel) && (tel.match(/\d/g) || []).length >= 5)) throw new InputError("contact-phone");
  if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) throw new InputError("contact-email");
  let site = String(url).trim();
  if (site) site = normalizeUrl(site);
  const parts = full.split(/\s+/);
  const family = parts.length > 1 ? parts.pop() : "";
  const given = parts.join(" ");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${vEsc(family)};${vEsc(given)};;;`, `FN:${vEsc(full)}`];
  if (org.trim()) lines.push(`ORG:${vEsc(org.trim())}`);
  if (tel) lines.push(`TEL;TYPE=CELL:${tel.replace(/[^\d+]/g, "")}`);
  if (mail) lines.push(`EMAIL:${mail}`);
  if (site) lines.push(`URL:${site}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** Adds https:// when missing and validates. Returns the normalized URL. */
export function normalizeUrl(input) {
  let s = String(input ?? "").trim();
  if (!s) throw new InputError("url-empty");
  if (/\s/.test(s)) throw new InputError("url-invalid");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    if (/^(mailto|tel|sms):/i.test(s)) return s; // not a web URL, but a valid scheme
    s = "https://" + s;
  }
  let u;
  try {
    u = new URL(s);
  } catch (_) {
    throw new InputError("url-invalid");
  }
  if (!/^https?:$/.test(u.protocol)) throw new InputError("url-invalid");
  const host = u.hostname;
  const looksOk = host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[") || /^[^.]+\.[^.]{2,}/.test(host);
  if (!looksOk) throw new InputError("url-invalid");
  return s;
}

export function buildText(input) {
  const s = String(input ?? "");
  if (!s.trim()) throw new InputError("text-empty");
  return s;
}

/* ---- colour helpers (QR contrast + colour picker) ---- */

export function parseHex(hex) {
  let h = String(hex || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export const toHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();

export function rgbToHsl({ r, g, b }) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function luminance({ r, g, b }) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* =====================================================================
 * Image sizing
 * ===================================================================== */

export const MAX_PIXELS = 32e6; // keeps canvas memory ~128 MB at worst

/**
 * mode: "orig" | "pct" (value 1..100) | "max" (value = longest side in px)
 * Never upscales. Returns { width, height, capped } where capped means the
 * result was shrunk further to stay under MAX_PIXELS.
 */
export function targetSize(w, h, mode = "orig", value = 100) {
  let f = 1;
  if (mode === "pct") f = Math.min(1, Math.max(0.01, Number(value) / 100));
  else if (mode === "max") f = Math.min(1, Math.max(1, Number(value)) / Math.max(w, h));
  let tw = Math.max(1, Math.round(w * f));
  let th = Math.max(1, Math.round(h * f));
  let capped = false;
  if (tw * th > MAX_PIXELS) {
    const k = Math.sqrt(MAX_PIXELS / (tw * th));
    tw = Math.max(1, Math.floor(tw * k));
    th = Math.max(1, Math.floor(th * k));
    capped = true;
  }
  return { width: tw, height: th, capped };
}

/** Longest-side fit used for OCR / colour-picker working canvases. */
export function fitWithin(w, h, maxSide) {
  const f = Math.min(1, maxSide / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * f)), height: Math.max(1, Math.round(h * f)) };
}
