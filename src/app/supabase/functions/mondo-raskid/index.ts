// Jednostrani raskid ugovora sklopljenog na daljinu (webshop Pool Care).
// Sprema izjavu (evidencija), šalje je Mondo Acqui i potvrdu kupcu (kad je domena verificirana u Resendu).
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("resend"));
const MONDO = Deno.env.get("INQUIRY_EMAIL") || "mondo.acquahr@gmail.com";
const FROM = Deno.env.get("MAIL_FROM") || "Mondo Pool Care <orders@resend.dev>";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda nije dopuštena." }, 405);
  const b = await req.json().catch(() => ({} as any));
  const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  if (str(b.website, 100)) return json({ success: true, id: "R-0", receivedAt: new Date().toISOString() }); // zamka za botove
  const d = {
    name: str(b.name, 120), email: str(b.email, 120), address: str(b.address, 200),
    orderRef: str(b.orderRef, 80), orderDate: str(b.orderDate, 20), receivedDate: str(b.receivedDate, 20),
    items: str(b.items, 1500), note: str(b.note, 1000),
  };
  if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json({ error: "Upišite ime i ispravnu e-mail adresu." }, 400);
  if (!d.orderRef && !d.orderDate) return json({ error: "Upišite broj ili datum narudžbe." }, 400);

  const receivedAt = new Date().toISOString();
  const id = "R-" + receivedAt.slice(0, 10).replace(/-/g, "") + "-" + crypto.randomUUID().slice(0, 6).toUpperCase();
  const kada = new Date(receivedAt).toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" });
  const rows = [
    ["Broj zahtjeva", id], ["Zaprimljeno", kada], ["Ime i prezime", d.name], ["E-mail", d.email], ["Adresa", d.address],
    ["Broj narudžbe", d.orderRef], ["Datum narudžbe", d.orderDate], ["Datum primitka robe", d.receivedDate],
    ["Proizvodi", d.items || "cijela narudžba"], ["Napomena", d.note],
  ].filter(([, v]) => v);
  const table = `<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>`;
  const izjava = `Ovime izjavljujem da jednostrano raskidam ugovor o kupnji navedene robe.`;

  const zapis: Record<string, unknown> = { id, receivedAt, ...d, mondoEmail: false, customerEmail: false };
  try {
    await resend.emails.send({ from: FROM, to: [MONDO], replyTo: d.email, subject: `RASKID UGOVORA ${id}: ${d.name}`,
      html: `<div style="font-family:sans-serif"><h2>Jednostrani raskid ugovora</h2><p>${izjava}</p>${table}<p>Potvrdite kupcu primitak i povrat novca u roku od 14 dana.</p></div>` } as any);
    zapis.mondoEmail = true;
  } catch (e) { console.error("mondo mail", e); }
  try {
    const r: any = await resend.emails.send({ from: FROM, to: [d.email], subject: `Potvrda primitka raskida ugovora ${id} – Mondo Acqua`,
      html: `<div style="font-family:sans-serif"><h2>Zaprimili smo vaš raskid ugovora</h2><p>${izjava}</p>${table}<p>Mondo Acqua d.o.o., Lučinići 17, 51216 Marinići, OIB 23570721801 · info@mondo-acqua.hr · +385 95 208 7321</p></div>` } as any);
    zapis.customerEmail = !r?.error;
  } catch (e) { console.error("customer mail", e); }
  await db.from("kv_store_381f82bd").upsert({ key: `admin:withdrawals:${id}`, value: zapis });
  return json({ success: true, id, receivedAt, customerEmail: zapis.customerEmail });
});
