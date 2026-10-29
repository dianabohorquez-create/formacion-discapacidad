// Lógica del servidor de la formación (sin datos personales).
// Guarda el estado de cada sesión y las respuestas anónimas en Netlify Blobs.
// Cada respuesta se guarda en la CLAVE del blob (codificada), para leer todas las de una actividad con un solo listado.

const SES = /^[a-z0-9-]{1,40}$/;
const SLIDE = /^d[1-3]s\d{1,3}$/;
const EMO = ["👏", "💡", "❤️", "😮", "🤔"];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
const b64e = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));

function validValue(v) {
  if (Number.isInteger(v)) return v >= 0 && v < 10;
  if (typeof v === "string") return v.trim().length > 0 && v.length <= 140;
  if (Array.isArray(v)) return v.length <= 8 && v.every(x => Number.isInteger(x) && x >= -1 && x < 40);
  return false;
}
function safeEqual(a, b) {
  a = String(a || ""); b = String(b || "");
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
function merge(base, patch) {
  const out = { ...(base || {}) };
  for (const k in patch) {
    const v = patch[k];
    out[k] = v && typeof v === "object" && !Array.isArray(v) ? merge(out[k], v) : v;
  }
  return out;
}
async function listKeys(store, prefix) {
  const r = await store.list({ prefix });
  return (r.blobs || []).map(b => b.key);
}
async function delPrefix(store, prefix) {
  const keys = await listKeys(store, prefix);
  for (let i = 0; i < keys.length; i += 25) await Promise.all(keys.slice(i, i + 25).map(k => store.delete(k)));
  return keys.length;
}
async function readAnswers(store, s, sid) {
  const pre = `s/${s}/a/${sid}/`;
  return (await listKeys(store, pre)).map(key => {
    const [id, enc] = key.slice(pre.length).split("/");
    try { const d = JSON.parse(b64d(enc)); return { id, v: d.v, k: d.k, t: d.t }; } catch (e) { return null; }
  }).filter(Boolean);
}

export async function handle(req, store, PIN, now = Date.now()) {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "");
  let body = {};
  if (req.method === "POST") { try { body = await req.json(); } catch (e) { return json({ error: "JSON no válido" }, 400); } }
  const s = (url.searchParams.get("s") || body.s || "").toLowerCase();
  if (!SES.test(s)) return json({ error: "Código de sesión no válido" }, 400);
  const stateKey = `s/${s}/state`;

  // ---- Público: estado de la sesión (lo consultan los móviles)
  if (route === "state" && req.method === "GET") {
    const st = await store.get(stateKey, { type: "json" });
    return json({ now, state: st || null });
  }
  // ---- Público: enviar una respuesta anónima
  if (route === "answer" && req.method === "POST") {
    const { slide, id, v, k } = body;
    if (!SLIDE.test(slide || "")) return json({ error: "Actividad no válida" }, 400);
    if (!new RegExp(`^${slide}_[a-z0-9]{16}(_[a-z0-9]{1,4})?$`).test(id || "")) return json({ error: "Identificador no válido" }, 400);
    if (!validValue(v) || !Number.isInteger(k) || k < 0 || k > 99) return json({ error: "Respuesta no válida" }, 400);
    const pre = `s/${s}/a/${slide}/${id}/`;
    await delPrefix(store, pre);
    await store.set(pre + b64e(JSON.stringify({ v, k, t: now })), "1");
    return json({ ok: true, now });
  }
  // ---- Público: reacción con emoji
  if (route === "react" && req.method === "POST") {
    const e = EMO.indexOf(body.e);
    if (e < 0) return json({ error: "Reacción no válida" }, 400);
    await store.set(`s/${s}/r/${now}-${Math.random().toString(36).slice(2, 8)}-${e}`, "1");
    return json({ ok: true });
  }

  // ---- Presentadora (requiere PIN)
  if (!PIN) return json({ error: "Falta configurar PRESENTER_PIN en Netlify" }, 503);
  const pin = req.headers.get("x-pin") || "";
  if (!safeEqual(pin, PIN)) return json({ error: "PIN incorrecto" }, 401);

  if (route === "poll" && req.method === "GET") {
    const sids = (url.searchParams.get("sids") || "").split(",").filter(x => SLIDE.test(x)).slice(0, 80);
    const since = +url.searchParams.get("since") || 0;
    const [state, lists, rkeys] = await Promise.all([
      store.get(stateKey, { type: "json" }),
      Promise.all(sids.map(sid => readAnswers(store, s, sid))),
      listKeys(store, `s/${s}/r/`)
    ]);
    const answers = {}; sids.forEach((sid, i) => answers[sid] = lists[i]);
    const reactions = [], old = [];
    rkeys.forEach(key => { const [t, , e] = key.split("/").pop().split("-"); if (+t > since) reactions.push({ t: +t, e: EMO[+e] }); if (now - +t > 60000) old.push(key); });
    if (old.length) await Promise.all(old.slice(0, 50).map(k => store.delete(k)));
    return json({ now, state: state || null, answers, reactions });
  }
  if (route === "admin" && req.method === "POST") {
    if (body.op === "state") {
      const st = (await store.get(stateKey, { type: "json" })) || {};
      const patch = { ...(body.patch || {}) };
      if (patch.timerSecs !== undefined) { patch.timerEnd = patch.timerSecs ? now + patch.timerSecs * 1000 : null; delete patch.timerSecs; }
      if (body.openAtNow && SLIDE.test(body.openAtNow)) patch.openAt = { ...(patch.openAt || {}), [body.openAtNow]: now };
      const next = merge(st, patch); next.updatedAt = now;
      await store.setJSON(stateKey, next);
      return json({ ok: true, now, state: next });
    }
    if (body.op === "reset" && SLIDE.test(body.slide || "")) return json({ ok: true, deleted: await delPrefix(store, `s/${s}/a/${body.slide}/`) });
    if (body.op === "hide" && SLIDE.test(body.slide || "") && typeof body.id === "string") return json({ ok: true, deleted: await delPrefix(store, `s/${s}/a/${body.slide}/${body.id}/`) });
    if (body.op === "clear") {
      let n = 0;
      if (body.day) n = await delPrefix(store, `s/${s}/a/d${+body.day}s`);
      else { n = await delPrefix(store, `s/${s}/`); }
      return json({ ok: true, deleted: n });
    }
    return json({ error: "Operación no válida" }, 400);
  }
  return json({ error: "Ruta no encontrada" }, 404);
}
