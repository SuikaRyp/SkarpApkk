/* SKARP OCR worker — runs Tesseract (tesseract.js-core, Apache-2.0) fully on-device.
 *
 * Minimal re-implementation of the parts of the tesseract.js worker protocol
 * we need (load core, load traineddata, recognize text), so the app can ship
 * without the tesseract.js JS bundle or any CDN. The WASM core and the
 * traineddata files are bundled next to this file.
 *
 * Messages in : { id, type: "init", coreUrl, langs: [{ code, url }] }
 *               { id, type: "recognize", image: ArrayBuffer (PNG/JPEG) }
 *               { id, type: "end" }
 * Messages out: { id, ok: true, ... } | { id, ok: false, error }
 *               { progress: 0..1, stage }  (unsolicited)
 */
/* global TesseractCore, importScripts */
let tess = null;
let api = null;
let currentStage = "load";

const post = (m) => self.postMessage(m);

async function init({ coreUrl, langs }) {
  post({ progress: 0.02, stage: "load" });
  importScripts(coreUrl);
  if (typeof TesseractCore === "undefined") throw new Error("OCR core failed to load");
  tess = await TesseractCore({
    TesseractProgress(percent) {
      // Tesseract reports 0-100 while recognising; the first 30% is layout analysis
      if (currentStage === "recognize") post({ progress: Math.max(0, Math.min(1, percent / 100)), stage: "recognize" });
    },
  });
  post({ progress: 0.2, stage: "data" });
  let done = 0;
  for (const l of langs) {
    const res = await fetch(l.url);
    if (!res.ok) throw new Error(`Language data ${l.code} not found (HTTP ${res.status})`);
    tess.FS.writeFile(`./${l.code}.traineddata`, new Uint8Array(await res.arrayBuffer()));
    done++;
    post({ progress: 0.2 + 0.2 * (done / langs.length), stage: "data" });
  }
  api = new tess.TessBaseAPI();
  // OEM 1 = LSTM only (the bundled core is the LSTM build)
  const status = api.Init(null, langs.map((l) => l.code).join("+"), 1, undefined);
  if (status === -1) throw new Error("OCR engine initialisation failed");
  return {};
}

function recognize({ image }) {
  currentStage = "recognize";
  post({ progress: 0, stage: "recognize" });
  tess.FS.writeFile("/input", new Uint8Array(image));
  if (api.SetImageFile(1, 0) === 1) throw new Error("Unreadable image");
  api.Recognize(null);
  const text = api.GetUTF8Text();
  const confidence = api.MeanTextConf();
  tess.FS.unlink("/input");
  return { text, confidence };
}

self.onmessage = async ({ data }) => {
  const { id, type } = data;
  try {
    let out = {};
    if (type === "init") out = await init(data);
    else if (type === "recognize") out = recognize(data);
    else if (type === "end") {
      if (api) api.End();
      api = null;
    }
    post({ id, ok: true, ...out });
  } catch (e) {
    post({ id, ok: false, error: String(e && e.message ? e.message : e) });
  }
};
