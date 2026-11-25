// /api/admin/*  (only for Shazwan, behind ADMIN_PASS)
//   POST   login {pass}          sets a 30-day cookie
//   POST   logout
//   GET    list                  every brief AND every part-finished draft, newest first
//   GET    brief?c=&id=          one brief with its files, or the draft if it has not been sent
//   GET    file?c=&id=&name=     download one file
//   DELETE brief?c=&id=          delete a brief, its files and its draft (for test runs)
import { json, bad, sameOrigin, adminCookie, isAdmin, listAll, CLIENTS, ID } from "../../../src/lib.js";

const COOKIE = "brief_admin";

/* how many questions carry something, whatever shape the answer takes */
function countAnswers(a) {
  if (!a || typeof a !== "object") return 0;
  return Object.keys(a).filter((k) => {
    const v = a[k];
    if (typeof v === "string") return !!v.trim();
    if (Array.isArray(v)) return v.some((x) => (x && typeof x === "object" ? Object.values(x).some((y) => (typeof y === "string" ? y.trim() : y)) : typeof x === "string" ? x.trim() : !!x));
    if (v && typeof v === "object") return !!(v.picked && v.picked.length);
    return !!v;
  }).length;
}

export async function onRequest({ request, env, params }) {
  const path = (params.path || []).join("/");
  const url = new URL(request.url), q = url.searchParams, m = request.method;
  const secure = url.protocol === "https:" ? "; Secure" : "";

  if (path === "login" && m === "POST") {
    if (!sameOrigin(request)) return bad("Not allowed", 403);
    let pass = "";
    try { pass = String((await request.json()).pass || ""); } catch {}
    if (!env.ADMIN_PASS || !env.BRIEF_SECRET) return bad("ADMIN_PASS and BRIEF_SECRET must be set first", 500);
    if (pass !== env.ADMIN_PASS) {
      await new Promise((r) => setTimeout(r, 800)); // slows down guessing
      return bad("Wrong password", 401);
    }
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=${await adminCookie(env)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}` });
  }
  if (path === "logout" && m === "POST") {
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}` });
  }

  if (!(await isAdmin(request, env))) return bad("Please log in", 401);

  if (path === "list" && m === "GET") {
    const keys = (await listAll(env.FILES, "briefs/")).filter((o) => o.key.endsWith("/answers.json"));
    const sent = await Promise.all(keys.map(async (o) => {
      const r = await (await env.FILES.get(o.key)).json();
      const files = await listAll(env.FILES, o.key.replace("answers.json", "files/"));
      return {
        kind: "sent", client: r.client, clientName: (CLIENTS[r.client] || {}).name || r.client, id: r.id,
        at: r.createdAt, status: r.status,
        answered: countAnswers(r.answers),
        files: files.length, bytes: files.reduce((s, f) => s + f.size, 0)
      };
    }));
    /* A brief nobody has sent yet is still worth seeing: it shows how far they have got.
       The draft is deleted the moment the brief is sent, so nothing appears twice. */
    const dkeys = (await listAll(env.FILES, "drafts/")).filter((o) => o.key.endsWith(".json"));
    const drafts = await Promise.all(dkeys.map(async (o) => {
      const part = o.key.split("/");
      const client = part[1] || "", id = (part[2] || "").replace(/\.json$/, "");
      let d = {};
      try { d = await (await env.FILES.get(o.key)).json(); } catch { /* a half-written draft is still a row */ }
      return {
        kind: "draft", client, clientName: (CLIENTS[client] || {}).name || client, id,
        at: new Date(d.savedAt || o.uploaded).toISOString(), status: "draft",
        answered: countAnswers(d.answers), step: d.step || null, files: 0, bytes: 0
      };
    }));
    const rows = sent.concat(drafts).sort((a, b) => (a.at < b.at ? 1 : -1));
    return json({ briefs: rows });
  }

  const c = q.get("c") || "", id = q.get("id") || "";
  if (!CLIENTS[c] || !ID.test(id)) return bad("Unknown brief", 404);
  const base = `briefs/${c}/${id}/`;

  if (path === "brief" && m === "GET") {
    const obj = await env.FILES.get(base + "answers.json");
    if (obj) {
      const files = await listAll(env.FILES, base + "files/");
      return json({ brief: await obj.json(), files: files.map((f) => ({ name: f.key.slice((base + "files/").length), size: f.size })) });
    }
    const draft = await env.FILES.get(`drafts/${c}/${id}.json`);
    if (!draft) return bad("Unknown brief", 404);
    const d = await draft.json();
    /* read exactly like a sent brief, so the admin page needs no second code path */
    return json({ brief: { id, client: c, kind: "draft", status: "draft", createdAt: new Date(d.savedAt || Date.now()).toISOString(), answers: d.answers || {}, step: d.step || null, filesPlanned: (d.fileNames || []).map((n) => ({ name: n, size: 0 })) }, files: [] });
  }

  if (path === "file" && m === "GET") {
    const name = q.get("name") || "";
    if (!name || name.includes("/") || name.includes("..")) return bad("Bad file name");
    const obj = await env.FILES.get(base + "files/" + name);
    if (!obj) return bad("File not found", 404);
    return new Response(obj.body, {
      headers: {
        "content-type": obj.httpMetadata && obj.httpMetadata.contentType || "application/octet-stream",
        "content-length": String(obj.size),
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        "cache-control": "private, no-store"
      }
    });
  }

  if (path === "brief" && m === "DELETE") {
    if (!sameOrigin(request)) return bad("Not allowed", 403);
    const all = await listAll(env.FILES, base);
    for (const o of all) await env.FILES.delete(o.key);
    await env.FILES.delete(`drafts/${c}/${id}.json`);
    return json({ ok: true, deleted: all.length });
  }

  return bad("Not found", 404);
}
