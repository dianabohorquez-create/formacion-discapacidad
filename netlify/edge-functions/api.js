// Función de borde de Netlify: API de la formación en /api/*
import { getStore } from "@netlify/blobs";
import { handle } from "../lib/core.js";

export default async (request) => {
  const store = getStore({ name: "formacion", consistency: "strong" });
  try {
    return await handle(request, store, Netlify.env.get("PRESENTER_PIN"));
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500, headers: { "content-type": "application/json" } });
  }
};

export const config = { path: "/api/*" };
