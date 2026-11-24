/* A part-finished brief, so nobody has to do it in one sitting.
     POST   /api/draft                      -> { id, token }   a new, empty draft
     PUT    /api/draft?id=&t=&c=  <json>    -> { ok: true }    overwrite that draft
     GET    /api/draft?id=&t=&c=            -> { state }       reopen it
     DELETE /api/draft?id=&t=&c=            -> { ok: true }    after the brief is sent
   The token in the resume link is the only key. It reaches one draft and nothing else. */
import { json, bad, clientFor, sameOrigin, newId, makeDraftToken, checkDraftToken, MAX_ANSWERS, ID } from "../../src/lib.js";

const key = (client, id) => `drafts/${client}/${id}.json`;

/* every verb needs a client; everything except POST needs an id and a good token */
async function open(request, env) {
  const u = new URL(request.url);
  const client = clientFor(request, u.searchParams.get("c"));
  if (!client) return { err: bad("Unknown brief") };
  const id = u.searchParams.get("id") || "";
  if (!ID.test(id)) return { err: bad("That link is not complete", 404) };
  if (!(await checkDraftToken(env, client, id, u.searchParams.get("t")))) {
    return { err: bad("That link has expired. Please start the brief again.", 403) };
  }
  return { client, id };
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  let named = null;
  try { named = (await request.json()).client; } catch { /* a body is optional */ }
  const client = clientFor(request, named);
  if (!client) return bad("Unknown brief");
  const id = newId();
  return json({ id, token: await makeDraftToken(env, client, id) });
}

export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  const o = await open(request, env);
  if (o.err) return o.err;
  const text = await request.text();
  if (text.length > MAX_ANSWERS) return bad("There is too much here to save", 413);
  try { JSON.parse(text); } catch { return bad("The answers could not be read"); }
  await env.FILES.put(key(o.client, o.id), text, { httpMetadata: { contentType: "application/json" } });
  return json({ ok: true, savedAt: Date.now() });
}

export async function onRequestGet({ request, env }) {
  const o = await open(request, env);
  if (o.err) return o.err;
  const obj = await env.FILES.get(key(o.client, o.id));
  if (!obj) return bad("There is nothing saved under that link yet", 404);
  return new Response(obj.body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return bad("Not allowed", 403);
  const o = await open(request, env);
  if (o.err) return o.err;
  await env.FILES.delete(key(o.client, o.id));
  return json({ ok: true });
}
