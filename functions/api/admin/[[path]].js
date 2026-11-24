// /api/admin/*  (only for Shazwan, behind ADMIN_PASS)
//   POST   login {pass}          sets a 30-day cookie
//   POST   logout
//   GET    list                  every brief, newest first
//   GET    brief?c=&id=          one brief with its files
//   GET    file?c=&id=&name=     download one file
//   DELETE brief?c=&id=          delete a brief and its files (for test runs)
import { json, bad, sameOrigin, adminCookie, isAdmin, listAll, CLIENTS, ID } from "../../../src/lib.js";

const COOKIE = "brief_admin";

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
    const rows = await Promise.all(keys.map(async (o) => {
      const r = await (await env.FILES.get(o.key)).json();
      const files = await listAll(env.FILES, o.key.replace("answers.json", "files/"));
      return {
        client: r.client, clientName: (CLIENTS[r.client] || {}).name || r.client, id: r.id,
        createdAt: r.createdAt, status: r.status,
        name: r.answers && r.answers.you_name || "", role: r.answers && r.answers.you_role || "",
        files: files.length, bytes: files.reduce((s, f) => s + f.size, 0)
      };
    }));
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return json({ briefs: rows });
  }

  const c = q.get("c") || "", id = q.get("id") || "";
  if (!CLIENTS[c] || !ID.test(id)) return bad("Unknown brief", 404);
  const base = `briefs/${c}/${id}/`;

  if (path === "brief" && m === "GET") {
    const obj = await env.FILES.get(base + "answers.json");
    if (!obj) return bad("Unknown brief", 404);
    const files = await listAll(env.FILES, base + "files/");
    return json({ brief: await obj.json(), files: files.map((f) => ({ name: f.key.slice((base + "files/").length), size: f.size })) });
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
    return json({ ok: true, deleted: all.length });
  }

  return bad("Not found", 404);
}
