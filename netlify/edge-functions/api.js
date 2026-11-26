// Función de borde de Netlify: API de la formación en /api/*
import { getStore } from "@netlify/blobs";
import { handle } from "../lib/core.js";

// Recuperación puntual: el 23-11-2026 el cambio de almacén se publicó en mitad de la jornada 1 del grupo «curso».
// Copia al almacén nuevo las respuestas de la nube de palabras del día 1 (d1s6) dadas ese día en el almacén anterior.
let recovered = false;
async function recoverCloud(store) {
  if (recovered) return;
  const mark = "s/curso/recuperado-d1s6";
  if (await store.get(mark)) { recovered = true; return; }
  const old = getStore({ name: "formacion", consistency: "strong" });
  const pre = "s/curso/a/d1s6/", from = Date.parse("2026-11-23T00:00:00+01:00");
  const r = await old.list({ prefix: pre });
  const dec = x => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(x.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
  let n = 0;
  for (const b of r.blobs || []) {
    try { const enc = b.key.slice(pre.length).split("/")[1]; const d = dec(enc); if (d.t >= from) { await store.set(b.key, "1"); n++; } } catch (e) {}
  }
  await store.set(mark, String(n)); recovered = true;
}

export default async (request) => {
  const store = getStore({ name: "formacion-g2", consistency: "strong" });
  try {
    try { await recoverCloud(store); } catch (e) { recovered = true; }
    return await handle(request, store, { keys: Netlify.env.get("PRESENTER_KEYS") || Netlify.env.get("PRESENTER_KEY"), pin: Netlify.env.get("PRESENTER_PIN") });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500, headers: { "content-type": "application/json" } });
  }
};

export const config = { path: "/api/*" };
