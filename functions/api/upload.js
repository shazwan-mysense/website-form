// PUT /api/upload?id=&t=&name=   body = the file   (one file per request, 95 MB a file, 500 MB per brief)
import { json, bad, clientFor, sameOrigin, checkToken, safeName, listAll, EXT, ID, MAX_FILE, MAX_TOTAL } from "../../src/lib.js";

export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  const q = new URL(request.url).searchParams;
  const id = q.get("id") || "", token = q.get("t") || "", client = clientFor(request, q.get("c"));
  if (!client || !ID.test(id)) return bad("Unknown brief");
  if (!(await checkToken(env, client, id, token))) return bad("This upload link has expired. Please send the brief again.", 403);

  const name = safeName(q.get("name"));
  if (!EXT.test(name)) return bad("Only photos, zip, PDF and design files can be uploaded");
  const size = +request.headers.get("content-length");
  if (!size || !request.body) return bad("Empty file");
  if (size > MAX_FILE) return bad("This file is over 95 MB, which is more than the upload can take. Please share it through Google Drive.", 413);

  const prefix = `briefs/${client}/${id}/files/`;
  const have = await listAll(env.FILES, prefix);
  const used = have.reduce((s, o) => s + o.size, 0);
  if (used + size > MAX_TOTAL) return bad("That would take this brief over 500 MB. Please share the rest through Google Drive.", 413);

  let key = prefix + name, n = 1;
  const taken = new Set(have.map((o) => o.key));
  while (taken.has(key)) key = prefix + name.replace(/(\.[^.]+)?$/, ` (${++n})$1`);

  await env.FILES.put(key, request.body, {
    httpMetadata: { contentType: request.headers.get("content-type") || "application/octet-stream" }
  });
  return json({ ok: true, name: key.slice(prefix.length), size });
}
