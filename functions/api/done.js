// POST /api/done { id, t }   marks the brief complete once the browser has finished uploading
import { json, bad, clientFor, sameOrigin, checkToken, listAll, ID } from "../../src/lib.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  let body;
  try { body = await request.json(); } catch { return bad("Bad request"); }
  const id = String(body.id || ""), client = clientFor(request, body.client);
  if (!client || !ID.test(id)) return bad("Unknown brief");
  if (!(await checkToken(env, client, id, body.t))) return bad("Expired", 403);

  const key = `briefs/${client}/${id}/answers.json`;
  const obj = await env.FILES.get(key);
  if (!obj) return bad("Unknown brief", 404);
  const record = await obj.json();
  const files = await listAll(env.FILES, `briefs/${client}/${id}/files/`);
  record.status = "complete";
  record.completedAt = new Date().toISOString();
  record.filesReceived = files.map((o) => ({ name: o.key.split("/files/")[1], size: o.size }));
  await env.FILES.put(key, JSON.stringify(record, null, 2), { httpMetadata: { contentType: "application/json" } });
  return json({ ok: true });
}
