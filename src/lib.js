/* Shared by every Pages Function. Storage layout in the R2 bucket (binding FILES):
     briefs/<client>/<id>/answers.json   the answers + status
     briefs/<client>/<id>/files/<name>   uploads (95 MB a file, 500 MB per brief)
     drafts/<client>/<id>.json           a part-finished brief, reopened with a resume link
   Secrets: BRIEF_SECRET signs upload tokens and the admin cookie; ADMIN_PASS opens /admin/. */

export const CLIENTS = {
  esteemdental: { name: "Esteem Dental", hosts: ["edcform.mhdshazwn.com"] }
};
/* Cloudflare refuses a request body over 100 MB on the Free and Pro plans, and every
   file is one PUT, so 95 MB is the most a single file can be. The per-brief total is
   ours to choose: R2 does not care, so it is set wide enough never to be hit. */
export const MAX_FILE = 95 * 1024 * 1024;
export const MAX_TOTAL = 500 * 1024 * 1024;
export const MAX_ANSWERS = 400 * 1024;
export const EXT = /\.(zip|jpe?g|png|webp|heic|heif|gif|svg|pdf|ai|eps|psd|mp4|mov)$/i;
export const ID = /^\d{8}-\d{4}-[a-z0-9]{6}$/;
const TOKEN_HOURS = 6;
const DRAFT_DAYS = 120;   // how long a resume link keeps working

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
export const bad = (msg, status = 400) => json({ error: msg }, status);

/* the live subdomain decides the client; anything else (localhost, *.pages.dev) may name one */
export function clientFor(request, named) {
  const host = new URL(request.url).hostname;
  for (const [slug, c] of Object.entries(CLIENTS)) if (c.hosts.includes(host)) return slug;
  return CLIENTS[named] ? named : null;
}

/* only same-site pages may post (stops other sites using the endpoints from a visitor's browser) */
export function sameOrigin(request) {
  const o = request.headers.get("origin");
  return !o || o === new URL(request.url).origin;
}

export function newId() {
  const d = new Date(Date.now() + 8 * 3600e3); // Malaysia time in the id, easier to read
  const p = (n) => String(n).padStart(2, "0");
  const rnd = [...crypto.getRandomValues(new Uint8Array(6))].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}-${rnd}`;
}

async function hmac(secret, msg) {
  if (!secret) throw new Error("BRIEF_SECRET is not set");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function same(a, b) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

/* upload token: lets the browser that sent the answers add files for a few hours, nothing else */
export async function makeToken(env, client, id) {
  const exp = Date.now() + TOKEN_HOURS * 3600e3;
  return `${exp}.${await hmac(env.BRIEF_SECRET, `up.${client}.${id}.${exp}`)}`;
}
export async function checkToken(env, client, id, token) {
  const [exp, sig] = String(token || "").split(".");
  if (!exp || !sig || +exp < Date.now()) return false;
  return same(sig, await hmac(env.BRIEF_SECRET, `up.${client}.${id}.${exp}`));
}

/* draft token: the key in a resume link. Long lived, so someone can come back next week.
   It only ever reaches one draft, never the sent briefs and never another client's. */
export async function makeDraftToken(env, client, id) {
  const exp = Date.now() + DRAFT_DAYS * 86400e3;
  return `${exp}.${await hmac(env.BRIEF_SECRET, `draft.${client}.${id}.${exp}`)}`;
}
export async function checkDraftToken(env, client, id, token) {
  const [exp, sig] = String(token || "").split(".");
  if (!exp || !sig || +exp < Date.now()) return false;
  return same(sig, await hmac(env.BRIEF_SECRET, `draft.${client}.${id}.${exp}`));
}

/* admin cookie: "<expiry>.<hmac>", 30 days */
export async function adminCookie(env) {
  const exp = Date.now() + 30 * 86400e3;
  return `${exp}.${await hmac(env.BRIEF_SECRET, `admin.${exp}`)}`;
}
export async function isAdmin(request, env) {
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)brief_admin=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || +exp < Date.now()) return false;
  return same(sig, await hmac(env.BRIEF_SECRET, `admin.${exp}`));
}

export function safeName(name) {
  const base = String(name || "file").split(/[\\/]/).pop().normalize("NFKD").replace(/[^\w.\- ()]+/g, "").replace(/\s+/g, " ").trim();
  return (base || "file").slice(-120);
}

export async function listAll(bucket, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 });
    out.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return out;
}
