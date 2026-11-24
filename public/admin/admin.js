/* Briefs admin: log in, list briefs, read one as a document, download files, copy it all as text.
   Answers are shown with the same question labels as the client's config. */
(function () {
  "use strict";
  var doc = document, root = doc.getElementById("ad");
  var MB = 1024 * 1024;

  function h(tag, a, kids) {
    var e = doc.createElement(tag), k, v;
    if (a) for (k in a) { v = a[k]; if (v == null || v === false) continue;
      if (k === "class") e.className = v; else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v); }
    (kids || []).forEach(function (c) { if (c != null && c !== false) e.appendChild(typeof c === "string" ? doc.createTextNode(c) : c); });
    return e;
  }
  function size(n) { return n >= MB ? (n / MB).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function when(iso) { return new Date(iso).toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }); }
  function api(path, opt) {
    return fetch("/api/admin/" + path, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && path !== "login") { login(); throw new Error("login"); }
        if (!r.ok) throw new Error(j.error || "Error " + r.status);
        return j;
      });
    });
  }
  function toast(t) { var n = h("div", { class: "toast", role: "status", text: t }); doc.body.appendChild(n); setTimeout(function () { n.remove(); }, 2200); }
  function show(node) { root.innerHTML = ""; root.appendChild(node); window.scrollTo(0, 0); }

  function login() {
    var pass = h("input", { class: "in", type: "password", autocomplete: "current-password", "aria-label": "Password", placeholder: "Password" });
    var err = h("p", { class: "ad__err", role: "alert" });
    show(h("div", { class: "ad__login" }, [h("h1", { text: "Briefs" }), h("form", { onsubmit: function (e) {
      e.preventDefault(); err.textContent = "";
      api("login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pass: pass.value }) })
        .then(list).catch(function (x) { err.textContent = x.message; pass.select(); });
    } }, [pass, h("button", { class: "btn btn--pri", type: "submit" }, ["Log in"]), err])]));
    pass.focus();
  }

  function list() {
    api("list").then(function (j) {
      var rows = j.briefs.map(function (b) {
        return h("button", { type: "button", class: "row", onclick: function () { open(b.client, b.id); } }, [
          h("span", { class: "row__t", text: b.clientName + (b.name ? " · " + b.name : "") }),
          h("span", { class: "pill" + (b.status === "complete" ? " pill--ok" : ""), text: b.status === "complete" ? "Complete" : "Files still uploading" }),
          h("span", { class: "row__m", text: when(b.createdAt) + (b.role ? " · " + b.role : "") + " · " + (b.files ? b.files + " files, " + size(b.bytes) : "no files") })
        ]);
      });
      show(h("div", { class: "ad" }, [
        h("div", { class: "ad__top" }, [h("h1", { text: "Briefs" }), h("button", { type: "button", class: "link link--soft", text: "Log out", onclick: function () { api("logout", { method: "POST" }).then(login); } })]),
        rows.length ? h("div", { class: "rows" }, rows) : h("p", { class: "empty", text: "No briefs yet." })
      ]));
      if (history.state) history.replaceState(null, "", location.pathname);
    }).catch(function () {});
  }

  /* load the client's question config (it sets window.BRIEF) */
  var loaded = {};
  function config(client) {
    if (loaded[client]) { window.BRIEF = loaded[client]; return Promise.resolve(loaded[client]); }
    return new Promise(function (ok) {
      var s = doc.createElement("script"); s.src = "/js/clients/" + client + ".js";
      s.onload = function () { loaded[client] = window.BRIEF; ok(window.BRIEF); };
      s.onerror = function () { ok(null); };
      doc.head.appendChild(s);
    });
  }

  /* answers -> [{title, items:[{q, a | sub:[{title, items}]}], skipped:[labels]}] */
  function str(v) { return typeof v === "string" ? v.trim() : ""; }
  function value(f, store) {
    var v = store[f.id];
    switch (f.type) {
      case "chips": return [].concat(Array.isArray(v) ? v : [], str(store[f.id + "_other"]) ? ["Other: " + str(store[f.id + "_other"])] : []).join(", ");
      case "list": return Array.isArray(v) ? v.map(str).filter(Boolean).map(function (x, i) { return i + 1 + ". " + x; }).join("\n") : "";
      case "radio": return v ? v + (str(store[f.id + "_more"]) ? ": " + str(store[f.id + "_more"]) : "") : "";
      case "consent": return v ? "Yes" : "";
      default: return str(v);
    }
  }
  function build(B, rec, files) {
    var a = rec.answers || {};
    var steps = B.steps.concat([{ title: B.review.title, fields: B.review.fields }]);
    return steps.map(function (s) {
      var items = [], skipped = [];
      s.fields.forEach(function (f) {
        var label = f.label || f.item + "s";
        if (f.type === "repeat") {
          var subs = (a[f.id] || []).map(function (it, i) {
            var its = f.fields.map(function (sf) { return { q: sf.label, a: value(sf, it || {}) }; }).filter(function (x) { return x.a; });
            return its.length ? { title: f.item + " " + (i + 1), items: its } : null;
          }).filter(Boolean);
          if (subs.length) items.push({ q: label, sub: subs }); else skipped.push(label);
        } else if (f.type === "cards") {
          var v = a[f.id] || { picked: [], d: {} };
          var subs2 = (v.picked || []).map(function (name) {
            var d = (v.d || {})[name] || {};
            return { title: name, items: f.fields.map(function (sf) { return { q: sf.label, a: value(sf, d) }; }).filter(function (x) { return x.a; }) };
          });
          if (subs2.length) items.push({ q: "Treatment pages (" + subs2.length + ")", sub: subs2 }); else skipped.push(label);
        } else if (f.type === "files") {
          if (files.length) items.push({ q: label, files: files });
          else skipped.push(label);
        } else {
          var val = value(f, a);
          if (val) items.push({ q: label, a: val, url: f.type === "url" }); else skipped.push(label);
        }
      });
      return { title: s.title, items: items, skipped: skipped };
    });
  }
  function asText(B, rec, secs) {
    var out = [B.name + " website brief", "Reference " + rec.id + ", sent " + when(rec.createdAt), ""];
    secs.forEach(function (s) {
      if (!s.items.length) return;
      out.push("## " + s.title, "");
      s.items.forEach(function (it) {
        if (it.sub) { out.push(it.q + ":"); it.sub.forEach(function (sb) { out.push("", "### " + sb.title); sb.items.forEach(function (x) { out.push("- " + x.q + ": " + x.a.replace(/\n/g, "\n  ")); }); }); out.push(""); }
        else if (it.files) out.push(it.q + ": " + it.files.map(function (f) { return f.name; }).join(", "), "");
        else out.push(it.q + ":", it.a, "");
      });
    });
    return out.join("\n");
  }

  function open(client, id, fromHistory) {
    Promise.all([api("brief?c=" + encodeURIComponent(client) + "&id=" + encodeURIComponent(id)), config(client)]).then(function (r) {
      var rec = r[0].brief, files = r[0].files, B = r[1];
      if (!B) { toast("The question file for " + client + " is missing"); return; }
      var a = rec.answers || {}, secs = build(B, rec, files);
      var phone = str(a.you_phone).replace(/\D/g, "");
      var head = h("div", { class: "doc__head" }, [
        h("div", null, [h("h2", { text: B.name + (a.you_name ? " · " + a.you_name : "") }),
          h("p", { class: "doc__meta" }, [
            (a.you_role ? a.you_role + " · " : "") + when(rec.createdAt), h("br"),
            phone ? h("a", { href: "https://wa.me/" + (phone.indexOf("0") === 0 ? "6" + phone : phone), target: "_blank", rel: "noopener", text: "WhatsApp " + a.you_phone }) : null,
            a.you_email ? " · " : null, a.you_email ? h("a", { href: "mailto:" + a.you_email, text: a.you_email }) : null, h("br"),
            "Reference " + rec.id + " · " + (rec.status === "complete" ? "complete" : "files still uploading")
          ])]),
        h("div", { class: "doc__acts" }, [
          h("button", { type: "button", class: "btn btn--pri", onclick: function () {
            navigator.clipboard.writeText(asText(B, rec, secs)).then(function () { toast("Copied as text"); }, function () { toast("Copy failed"); });
          } }, [h("i", { "aria-hidden": "true", text: "↗" }), "Copy as text"]),
          h("button", { type: "button", class: "btn btn--soft", text: "Delete", onclick: function () {
            if (!confirm("Delete this brief and its " + files.length + " files? This cannot be undone.")) return;
            api("brief?c=" + encodeURIComponent(client) + "&id=" + encodeURIComponent(id), { method: "DELETE" }).then(function () { toast("Deleted"); list(); });
          } })
        ])
      ]);
      var body = secs.map(function (s) {
        if (!s.items.length && !s.skipped.length) return null;
        return h("section", { class: "sec" }, [h("h3", { text: s.title })].concat(s.items.map(function (it) {
          if (it.sub) return h("div", { class: "qa" }, [h("span", { class: "qa__q", text: it.q }), h("div", null, it.sub.map(function (sb) {
            return h("div", { class: "sub" }, [h("h4", { text: sb.title })].concat(sb.items.length ? sb.items.map(function (x) {
              return h("div", { class: "qa" }, [h("span", { class: "qa__q", text: x.q }), h("span", { class: "qa__a", text: x.a })]);
            }) : [h("p", { class: "skipped", text: "Ticked, no details yet." })]));
          }))]);
          if (it.files) return h("div", { class: "qa" }, [h("span", { class: "qa__q", text: it.q }), h("div", { class: "qa__a" }, it.files.map(function (f) {
            return h("div", null, [h("a", { href: "/api/admin/file?c=" + encodeURIComponent(client) + "&id=" + encodeURIComponent(id) + "&name=" + encodeURIComponent(f.name), text: f.name }), " (" + size(f.size) + ")"]);
          }))]);
          var ans = it.url && /^https?:\/\//i.test(it.a) ? h("a", { href: it.a, target: "_blank", rel: "noopener noreferrer", text: it.a }) : it.a;
          return h("div", { class: "qa" }, [h("span", { class: "qa__q", text: it.q }), h("span", { class: "qa__a" }, [ans])]);
        })).concat(s.skipped.length ? [h("p", { class: "skipped", text: "Skipped: " + s.skipped.join("; ") })] : []));
      });
      show(h("div", { class: "ad" }, [
        h("div", { class: "ad__top" }, [h("button", { type: "button", class: "btn btn--soft btn--back", onclick: function () { history.back(); } }, [h("i", { "aria-hidden": "true", text: "‹" }), "All briefs"])]),
        h("div", { class: "doc" }, [head].concat(body))
      ]));
      if (!fromHistory) history.pushState({ c: client, id: id }, "", "#" + client + "/" + id);
    }).catch(function (e) { if (e.message !== "login") toast(e.message); });
  }

  window.addEventListener("popstate", function (e) { if (e.state && e.state.id) open(e.state.c, e.state.id, true); else list(); });
  var m = location.hash.match(/^#([a-z0-9-]+)\/([\w-]+)$/);
  if (m) { history.replaceState({ c: m[1], id: m[2] }, "", location.hash); open(m[1], m[2], true); } else list();
})();
