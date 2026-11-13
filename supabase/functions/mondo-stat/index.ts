import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Mondo stat – brojač posjeta bez kolačića za www.mondo-acqua.hr i poolcare.mondo-acqua.hr.
// Ne sprema IP adresu: posjetitelj se broji preko kratkog otiska koji vrijedi samo jedan dan i ne može se vratiti u IP.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, X-Client-Info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "600",
};
const done = (status = 204) => new Response(null, { status, headers: CORS });

const TABLE = "kv_store_381f82bd";
const db = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|uptime|curl|wget|python|scrapy|httpclient|facebookexternalhit|whatsapp|telegram|gpt|claude|perplexity|bytespider|ahrefs|semrush|yandex|bingbot/i;
const MAX_PER_DAY = 5000;

const sha = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return done();
  const path = new URL(req.url).pathname.replace(/\/+$/, "");
  if (req.method !== "POST" || !path.endsWith("/hit")) return done(404);

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return done();
  const body = await req.json().catch(() => ({} as any));
  const s = String(body.s || "");
  if (!/^(www|poolcare)\.mondo-acqua\.hr$/.test(s)) return done();
  const p = String(body.p || "/").slice(0, 120);
  if (!p.startsWith("/")) return done();
  const r = String(body.r || "").toLowerCase().replace(/[^a-z0-9.\-]/g, "").slice(0, 80);
  const w = body.w === "m" ? "m" : "d";

  try {
    const day = new Date().toISOString().slice(0, 10);
    const { count } = await db().from(TABLE).select("key", { count: "exact", head: true }).like("key", `stat:${day}:%`);
    if ((count || 0) >= MAX_PER_DAY) return done();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const salt = await sha(`${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}:${day}`);
    const v = (await sha(`${salt}:${ip}:${ua}`)).slice(0, 12);
    const c = (req.headers.get("cf-ipcountry") || "").slice(0, 2).toUpperCase();
    await db().from(TABLE).insert({ key: `stat:${day}:${crypto.randomUUID()}`, value: { t: new Date().toISOString(), s, p, r, v, w, c } });
  } catch (err) {
    console.error("stat hit failed", String(err));
  }
  return done();
});
