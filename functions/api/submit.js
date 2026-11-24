// POST /api/submit  { client, v, answers, files:[{name,size}] }  ->  { id, token }
import { json, bad, clientFor, sameOrigin, newId, makeToken, MAX_ANSWERS, MAX_TOTAL } from "../../src/lib.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  const len = +request.headers.get("content-length") || 0;
  if (len > MAX_ANSWERS) return bad("The answers are too long to send", 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_ANSWERS) return bad("The answers are too long to send", 413);
    body = JSON.parse(text);
  } catch {
    return bad("The answers could not be read");
  }
  const client = clientFor(request, body && body.client);
  if (!client) return bad("Unknown brief");
  const a = body.answers;
  if (!a || typeof a !== "object" || Array.isArray(a)) return bad("No answers");
  /* The brief is not asked who is sending it: its subdomain already says which client it is.
     All that is checked is that something was actually answered. */
  if (!Object.keys(a).some((k) => { const v = a[k]; return typeof v === "string" ? v.trim() : Array.isArray(v) ? v.length : v && typeof v === "object" ? !!(v.picked && v.picked.length) : !!v; })) return bad("Nothing has been answered yet");

  const planned = Array.isArray(body.files) ? body.files.slice(0, 200).map((f) => ({ name: String(f.name || "").slice(0, 200), size: +f.size || 0 })) : [];
  if (planned.reduce((s, f) => s + f.size, 0) > MAX_TOTAL) return bad("Files are over 500 MB in total. Please share the bigger ones through Google Drive.", 413);

  const id = newId();
  const record = {
    id, client, v: body.v || 1,
    status: planned.length ? "uploading" : "complete",
    createdAt: new Date().toISOString(),
    country: request.cf && request.cf.country || null,
    filesPlanned: planned,
    answers: a
  };
  await env.FILES.put(`briefs/${client}/${id}/answers.json`, JSON.stringify(record, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
  return json({ id, token: await makeToken(env, client, id) });
}
