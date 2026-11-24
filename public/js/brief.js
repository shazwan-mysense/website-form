/* Client website brief: draws the questions in js/clients/<client>.js, saves answers on this
   device as people type, and sends answers + files to the Pages Functions in /functions/api.
   Nothing typed by a visitor is ever written as HTML. */
(function () {
  "use strict";
  var doc = document, app = doc.getElementById("app");

  /* which client: by subdomain on the live site, ?c= locally */
  /* The subdomain never spells out the client. Pattern: <initials>form.mhdshazwn.com */
  var HOSTS = { "edcform.mhdshazwn.com": "esteemdental" };
  var slug = HOSTS[location.hostname] || new URLSearchParams(location.search).get("c") || "esteemdental";
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) slug = "esteemdental";
  var cfg = doc.createElement("script");
  cfg.src = "/js/clients/" + slug + ".js";
  cfg.onload = start;
  cfg.onerror = function () { app.className = "app"; app.textContent = "This brief could not be loaded. Please refresh the page."; };
  doc.head.appendChild(cfg);

  var B, KEY, state, steps, cur = -1, files = [], saveT, openCards = {}, sending = null;
  var cloudT, cloudBusy = false, cloudOk = null;
  var MB = 1024 * 1024;
  var EXT = /\.(zip|jpe?g|png|webp|heic|heif|gif|svg|pdf|ai|eps|psd|mp4|mov)$/i;
  var ICON = {
    arrow: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12 12 2M5 2h7v7"/></svg>',
    back: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 2 4 7l5 5"/></svg>',
    chev: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 4 4 4 4-4"/></svg>',
    clock: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l2.5 2"/></svg>',
    pen: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 15h3l8.5-8.5-3-3L3 12v3Z"/></svg>',
    save: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m4 9.5 3 3 7-7"/></svg>',
    up: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 14V3M5.5 7.5 10 3l4.5 4.5M3 13v3.5h14V13"/></svg>',
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    go: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.75 3.75 12 9l-5.25 5.25"/></svg>',
    link: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7.5 10.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.25L8.56 5.19M10.5 7.5a3 3 0 0 0-4.24 0L4.14 9.62a3 3 0 0 0 4.24 4.25l1.06-1.06"/></svg>'
  };

  /* the button from mhdshazwn.com: a label block that slides right to uncover the icon */
  function btn(o) {
    var ic = o.icon || ICON.go;
    var kids = [
      h("span", { class: "btn__ic btn__ic--l", "aria-hidden": "true", html: ic }),
      h("span", { class: "btn__c" }, [h("span", { class: "btn__t", text: o.text }), o.sub ? h("span", { class: "btn__s", text: o.sub }) : null]),
      h("span", { class: "btn__ic btn__ic--r", "aria-hidden": "true", html: ic })
    ];
    var a = { class: "btn" + (o.kind ? " btn--" + o.kind : "") };
    if (o.href) { a.href = o.href; if (o.blank) { a.target = "_blank"; a.rel = "noopener"; } }
    else a.type = "button";
    if (o.onclick) a.onclick = o.onclick;
    if (o.label) a["aria-label"] = o.label;
    return h(o.href ? "a" : "button", a, kids);
  }

  /* ------------------------------------------------------------------ helpers */
  function h(tag, a, kids) {
    var e = doc.createElement(tag), k, v;
    if (a) for (k in a) {
      v = a[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) e.appendChild(typeof c === "string" ? doc.createTextNode(c) : c); });
    return e;
  }
  function str(v) { return typeof v === "string" ? v.trim() : ""; }
  /* mono caps suit a short cue like "+60"; a worked example has to read like a sentence */
  function inCls(ph) { return "in" + (ph && String(ph).length > 26 ? " in--ex" : ""); }
  function size(n) { return n >= MB ? (n / MB).toFixed(n >= 10 * MB ? 0 : 1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function total() { return files.reduce(function (s, f) { return s + f.size; }, 0); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  /* ------------------------------------------------------------------ storage (this device only) */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function persist() {
    var ok = true;
    state.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { ok = false; }
    if (!ok) doc.querySelectorAll("[data-saved]").forEach(function (n) {
      n.classList.add("is-off");
      n.textContent = "This browser blocks storage";
    });
  }
  function save() { clearTimeout(saveT); saveT = setTimeout(persist, 300); cloud(); progress(); }
  function fresh() { return { answers: {}, step: null, fileNames: [], sent: state && state.sent || null, draft: null }; }

  /* ---------------------------------------------------------------- continue later
     The answers also go to the server under a draft id, so a resume link reopens them
     on any device. Files are never part of a draft: browsers cannot hold them. */
  function anyAnswer() {
    return Object.keys(state.answers).some(function (k) {
      var v = state.answers[k];
      return typeof v === "string" ? !!v.trim() : Array.isArray(v) ? v.length > 0
        : v && typeof v === "object" ? !!(v.picked && v.picked.length) : !!v;
    });
  }
  function draftQS() {
    return "id=" + encodeURIComponent(state.draft.id) + "&t=" + encodeURIComponent(state.draft.token) + "&c=" + encodeURIComponent(B.client);
  }
  function resumeUrl() {
    if (!state.draft) return "";
    return location.origin + location.pathname + "?r=" + encodeURIComponent(state.draft.id) +
      "&t=" + encodeURIComponent(state.draft.token) + "&c=" + encodeURIComponent(B.client);
  }
  function makeDraft() {
    if (state.draft) return Promise.resolve(state.draft);
    if (cloudBusy) return Promise.resolve(null);
    cloudBusy = true;
    return fetch("/api/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ client: B.client }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.id) { state.draft = { id: j.id, token: j.token }; persist(); } return state.draft || null; })
      .catch(function () { return null; })
      .then(function (d) { cloudBusy = false; return d; });
  }
  function pushDraft(keepalive) {
    if (!state.draft) return Promise.resolve(false);
    var body = JSON.stringify({ v: 1, client: B.client, answers: state.answers, step: state.step, fileNames: state.fileNames || [], savedAt: Date.now() });
    return fetch("/api/draft?" + draftQS(), { method: "PUT", headers: { "content-type": "application/json" }, body: body, keepalive: !!keepalive })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }
  function cloud() {
    clearTimeout(cloudT);
    cloudT = setTimeout(function () {
      if (!anyAnswer()) return;
      makeDraft().then(function (d) { return d ? pushDraft() : false; }).then(badge);
    }, 1800);
  }
  function badge(ok) {
    cloudOk = ok;
    doc.querySelectorAll("[data-saved]").forEach(function (el) {
      el.classList.toggle("is-off", !ok);
      el.textContent = ok ? "Saved. Your link works anywhere" : "Saved on this device only";
    });
  }
  function dropDraft() {
    if (!state.draft) return Promise.resolve();
    var qs = draftQS();
    state.draft = null;
    return fetch("/api/draft?" + qs, { method: "DELETE" }).catch(function () {});
  }

  /* ------------------------------------------------------------------ answered? */
  function filled(f, store) {
    var v = store[f.id];
    switch (f.type) {
      case "chips": return (Array.isArray(v) && v.length > 0) || !!str(store[f.id + "_other"]);
      case "list": return Array.isArray(v) && v.some(function (x) { return !!str(x); });
      case "consent": return v === true;
      case "repeat": return Array.isArray(v) && v.some(function (it) { return f.fields.some(function (sf) { return filled(sf, it || {}); }); });
      case "cards": return !!(v && v.picked && v.picked.length);
      case "files": return files.length > 0;
      case "radio": return !!v;
      default: return !!str(v);
    }
  }
  function stepCount(s) {
    var n = 0, d = 0;
    s.fields.forEach(function (f) { if (f.type === "consent") return; n++; if (filled(f, state.answers)) d++; });
    return { n: n, d: d };
  }
  function progress() {
    var n = 0, d = 0;
    steps.forEach(function (s, i) {
      if (s.review) return;
      var c = stepCount(s); n += c.n; d += c.d;
      var dot = doc.querySelectorAll('[data-dot="' + i + '"]');
      dot.forEach(function (el) { paintDot(el, c); });
    });
    var pct = n ? Math.round(d / n * 100) : 0;
    doc.querySelectorAll("[data-meter]").forEach(function (m) { m.style.width = pct + "%"; });
    doc.querySelectorAll("[data-pct]").forEach(function (m) { m.textContent = pct + "% answered"; });
    doc.querySelectorAll("[data-count]").forEach(function (m) {
      var s = steps[+m.getAttribute("data-count")], c = stepCount(s);
      m.textContent = c.d + " of " + c.n + " answered";
    });
  }
  function paintDot(el, c) {
    var full = c.n && c.d === c.n, part = c.n ? c.d / c.n : 0, L = 2 * Math.PI * 7.5;
    el.classList.toggle("is-full", !!full);
    el.innerHTML = full || !part ? "" : '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.5" stroke-dasharray="' + (part * L).toFixed(1) + " " + L.toFixed(1) + '"/></svg>';
  }

  /* ------------------------------------------------------------------ fields */
  function wrap(f, path, control, opts) {
    opts = opts || {};
    var id = "f-" + path;
    var label = f.label ? h(opts.group ? "p" : "label", { class: "f__label", id: id + "-l", "for": opts.group ? null : id }, [f.label, f.required ? h("em", { text: "Required" }) : null]) : null;
    return h("div", { class: "f" + (f.half ? " is-half" : ""), "data-f": path }, [
      label,
      f.hint ? h("p", { class: "f__hint", id: id + "-h", text: f.hint }) : null,
      f.quote ? h("p", { class: "f__quote", text: f.quote }) : null,
      control,
      h("p", { class: "f__err", role: "alert", text: f.type === "consent" ? "Please tick this to send the brief." : "This one is needed so I can reach you." })
    ]);
  }

  function field(f, store, path) {
    path = path || f.id;
    var id = "f-" + path, t = f.type;
    if (t === "text" || t === "email" || t === "tel" || t === "url") {
      var inp = h("input", { class: inCls(f.placeholder), id: id, type: t === "url" ? "url" : t, value: store[f.id] || "", placeholder: f.placeholder || null,
        autocomplete: f.autocomplete || "off", inputmode: f.inputmode || (t === "url" ? "url" : null), "aria-describedby": f.hint ? id + "-h" : null,
        oninput: function () { store[f.id] = inp.value; unflag(inp); save(); },
        onblur: function () {
          if (t === "url") { var v = str(inp.value); if (v && !/^https?:\/\//i.test(v) && /\.[a-z]{2,}/i.test(v)) { inp.value = "https://" + v; store[f.id] = inp.value; save(); } }
        } });
      return wrap(f, path, inp);
    }
    if (t === "textarea") {
      var ta = h("textarea", { class: "in", id: id, rows: f.rows || 3, placeholder: f.placeholder || null, "aria-describedby": f.hint ? id + "-h" : null,
        oninput: function () { store[f.id] = ta.value; save(); } });
      ta.value = store[f.id] || "";
      return wrap(f, path, ta);
    }
    if (t === "list") {
      var arr = Array.isArray(store[f.id]) ? store[f.id] : (store[f.id] = []);
      var rows = [];
      for (var i = 0; i < (f.count || 3); i++) (function (i) {
        var li = h("input", { class: inCls((f.placeholder || [])[i]), id: i === 0 ? id : id + "-" + i, value: arr[i] || "", placeholder: (f.placeholder || [])[i] || null,
          "aria-label": f.label + ", " + (i + 1), oninput: function () { arr[i] = li.value; save(); } });
        rows.push(h("div", { class: "list__row" }, [h("span", { class: "list__n", "aria-hidden": "true", text: String(i + 1) }), li]));
      })(i);
      return wrap(f, path, h("div", { class: "list" }, rows));
    }
    if (t === "chips") return wrap(f, path, chips(f, store, path), { group: true });
    if (t === "radio") return wrap(f, path, radio(f, store, path), { group: true });
    if (t === "consent") {
      var c = h("button", { type: "button", class: "consent", role: "checkbox", id: id, "aria-checked": store[f.id] ? "true" : "false",
        onclick: function () { store[f.id] = !store[f.id]; c.setAttribute("aria-checked", store[f.id] ? "true" : "false"); unflag(c); save(); } },
        [h("span", { class: "box", "aria-hidden": "true" }), h("span", { text: f.label })]);
      return wrap({ type: "consent", id: f.id, required: f.required, hint: f.hint }, path, c);
    }
    if (t === "repeat") return repeat(f, store, path);
    if (t === "cards") return cards(f, store, path);
    if (t === "files") return filesField(f, path);
    return h("div");
  }

  function chips(f, store, path) {
    var sel = Array.isArray(store[f.id]) ? store[f.id] : (store[f.id] = []);
    var note = h("p", { class: "f__note", hidden: true });
    var box = h("div", { class: "chips", role: "group", "aria-labelledby": "f-" + path + "-l" });
    function paint() {
      box.querySelectorAll(".chip").forEach(function (b) {
        var on = sel.indexOf(b.dataset.v) > -1;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.setAttribute("aria-disabled", !on && f.max && sel.length >= f.max ? "true" : "false");
      });
    }
    f.options.forEach(function (o) {
      box.appendChild(h("button", { type: "button", class: "chip", "data-v": o, onclick: function () {
        var k = sel.indexOf(o);
        if (k > -1) sel.splice(k, 1);
        else if (f.max && sel.length >= f.max) { note.hidden = false; note.className = "f__note is-warn"; note.textContent = "Pick up to " + f.max + ". Untick one first."; return; }
        else sel.push(o);
        note.hidden = true; paint(); save();
      } }, [h("span", { class: "tick", "aria-hidden": "true" }), o]));
    });
    paint();
    var kids = [box, note];
    if (f.other) {
      var oi = h("input", { class: "in in--sm chips__more", value: store[f.id + "_other"] || "", placeholder: f.other + "? Type it here",
        "aria-label": f.other, oninput: function () { store[f.id + "_other"] = oi.value; save(); } });
      kids.push(oi);
    }
    return h("div", null, kids);
  }

  function radio(f, store, path) {
    var box = h("div", { class: "choices" + (f.options.length > 3 || f.options.some(function (o) { return o.label.length > 26; }) ? "" : " choices--row"), role: "radiogroup", "aria-labelledby": "f-" + path + "-l" });
    var mores = {};
    function paint() {
      box.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-checked", store[f.id] === b.dataset.v ? "true" : "false"); });
      Object.keys(mores).forEach(function (k) { mores[k].hidden = store[f.id] !== k; });
    }
    f.options.forEach(function (o) {
      box.appendChild(h("button", { type: "button", role: "radio", class: "chip", "data-v": o.label, onclick: function () {
        store[f.id] = store[f.id] === o.label ? "" : o.label;
        paint(); save();
        if (o.more && store[f.id] === o.label) mores[o.label].querySelector("input").focus();
      } }, [h("span", { class: "tick", "aria-hidden": "true" }), o.label]));
      if (o.more) {
        var mi = h("input", { class: "in in--sm", value: store[f.id + "_more"] || "", placeholder: o.more, "aria-label": o.more,
          oninput: function () { store[f.id + "_more"] = mi.value; save(); } });
        mores[o.label] = h("div", { class: "choice__more" }, [mi]);
        box.appendChild(mores[o.label]);
      }
    });
    paint();
    return box;
  }

  function repeat(f, store, path) {
    var list = Array.isArray(store[f.id]) ? store[f.id] : (store[f.id] = []);
    while (list.length < (f.min || 1)) list.push({});
    var reps = h("div", { class: "reps" });
    function draw(focusLast) {
      reps.innerHTML = "";
      list.forEach(function (it, i) {
        var g = h("div", { class: "fields" }, f.fields.map(function (sf) { return field(sf, it, path + "-" + i + "-" + sf.id); }));
        reps.appendChild(h("div", { class: "rep" + (f.compact ? " rep--compact" : "") }, [
          h("div", { class: "rep__head" }, [
            h("p", { class: "rep__title", text: f.item + " " + (i + 1) }),
            list.length > 1 ? h("button", { type: "button", class: "rep__x", text: "Remove", "aria-label": "Remove " + f.item.toLowerCase() + " " + (i + 1),
              onclick: function () {
                var has = f.fields.some(function (sf) { return filled(sf, it); });
                if (has && !confirm("Remove " + f.item.toLowerCase() + " " + (i + 1) + " and what you typed in it?")) return;
                list.splice(i, 1); save(); draw();
              } }) : null
          ]),
          g
        ]));
      });
      if (list.length < (f.max || 10)) reps.appendChild(h("button", { type: "button", class: "add", onclick: function () { list.push({}); save(); draw(true); } },
        [h("i", { "aria-hidden": "true", text: "+" }), f.add]));
      if (focusLast) { var r = reps.querySelectorAll(".rep"); var inp = r[r.length - 1].querySelector("input, textarea"); if (inp) inp.focus(); }
    }
    draw();
    if (!f.label) return h("div", { "data-f": path }, [reps]);
    return wrap(f, path, reps, { group: true });
  }

  function cards(f, store, path) {
    var v = store[f.id] && store[f.id].picked ? store[f.id] : (store[f.id] = { picked: [], custom: [], d: {} });
    var holder = h("div", { class: "tcards" });
    var groups = h("div", { class: "tgroups" });
    function paint() {
      groups.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-pressed", v.picked.indexOf(b.dataset.v) > -1 ? "true" : "false"); });
    }
    function toggle(name) {
      var k = v.picked.indexOf(name);
      if (k > -1) {
        var d = v.d[name] || {};
        if (f.fields.some(function (sf) { return filled(sf, d); }) && !confirm("Untick " + name + "? Your answers for it stay saved, so you can tick it again later.")) return;
        v.picked.splice(k, 1);
      } else { v.picked.push(name); openCards[name] = true; }
      paint(); draw(); save();
    }
    f.groups.forEach(function (g) {
      groups.appendChild(h("div", { class: "tgroup" }, [h("h3", { text: g.name }),
        h("div", { class: "chips" }, g.items.map(function (it) {
          return h("button", { type: "button", class: "chip", "data-v": it, onclick: function () { toggle(it); } }, [h("span", { class: "tick", "aria-hidden": "true" }), it]);
        }))]));
    });
    var oi = h("input", { class: "in in--sm", placeholder: f.other, "aria-label": f.other,
      onkeydown: function (e) { if (e.key === "Enter") { e.preventDefault(); addOther(); } } });
    function addOther() {
      var n = str(oi.value);
      if (!n) { oi.focus(); return; }
      if (v.custom.indexOf(n) < 0 && !f.groups.some(function (g) { return g.items.indexOf(n) > -1; })) v.custom.push(n);
      if (v.picked.indexOf(n) < 0) v.picked.push(n);
      openCards[n] = true; oi.value = ""; paint(); draw(); save();
    }
    var other = h("div", { class: "tother" }, [oi, h("button", { type: "button", class: "btn btn--soft", text: "Add", onclick: addOther })]);
    function order() {
      var all = [];
      f.groups.forEach(function (g) { g.items.forEach(function (it) { if (v.picked.indexOf(it) > -1) all.push(it); }); });
      v.custom.forEach(function (c) { if (v.picked.indexOf(c) > -1) all.push(c); });
      return all;
    }
    function draw() {
      holder.innerHTML = "";
      var list = order();
      holder.appendChild(h("p", { class: "tcards__title", text: list.length ? "Your treatment pages (" + list.length + ")" : "Your treatment pages" }));
      if (!list.length) { holder.appendChild(h("p", { class: "empty", text: "Tick a treatment above and its questions appear here." })); return; }
      list.forEach(function (name, i) {
        var d = v.d[name] || (v.d[name] = {});
        var count = h("span", { class: "tcard__count" });
        function recount() { var n = f.fields.length, c = f.fields.filter(function (sf) { return filled(sf, d); }).length; count.textContent = c + " of " + n + " answered"; }
        var body = h("div", { class: "tcard__body", id: "tc-" + path + "-" + i }, [
          h("div", { class: "fields" }, f.fields.map(function (sf) { return field(sf, d, path + "-" + i + "-" + sf.id); })),
          v.custom.indexOf(name) > -1 ? h("p", { style: "margin-top:18px" }, [h("button", { type: "button", class: "link link--soft", text: "Remove this treatment", onclick: function () {
            v.picked.splice(v.picked.indexOf(name), 1); v.custom.splice(v.custom.indexOf(name), 1); delete v.d[name]; draw(); save();
          } })]) : null
        ]);
        body.addEventListener("input", recount); body.addEventListener("click", function () { setTimeout(recount); });
        var card = h("div", { class: "tcard" + (openCards[name] ? " is-open" : "") });
        var head = h("button", { type: "button", class: "tcard__h", "aria-expanded": openCards[name] ? "true" : "false", "aria-controls": body.id, onclick: function () {
          openCards[name] = !openCards[name];
          card.classList.toggle("is-open", openCards[name]);
          head.setAttribute("aria-expanded", openCards[name] ? "true" : "false");
        } }, [h("span", { class: "tcard__name", text: name }), count, h("span", { class: "tcard__chev", "aria-hidden": "true", html: ICON.chev })]);
        card.appendChild(head); card.appendChild(body);
        holder.appendChild(card);
        recount();
      });
    }
    paint(); draw();
    return wrap(f, path, h("div", null, [groups, other, holder]), { group: true });
  }

  function filesField(f, path) {
    var max = (B.maxMB || 50) * MB;
    var input = h("input", { type: "file", multiple: true, id: "f-" + path, accept: "image/*,.zip,.pdf,.ai,.eps,.psd,.svg,.heic,.heif,.mp4,.mov", "aria-describedby": "f-" + path + "-h" });
    var drop = h("div", { class: "drop" }, [
      h("span", { class: "drop__ic", "aria-hidden": "true", html: ICON.up }),
      h("span", { class: "drop__t", text: "Drop here" }),
      h("span", { class: "drop__s", text: "Or tap to choose. Photos, PDF, zip, logo files" }),
      input
    ]);
    var bar = h("i"), used = h("span"), left = h("span");
    var meter = h("div", { class: "meter" }, [h("div", { class: "meter__bar" }, [bar]), h("div", { class: "meter__t" }, [used, left])]);
    var list = h("ul", { class: "flist" });
    var alert = h("div", { role: "alert" });
    var lost = state.fileNames && state.fileNames.length && !files.length
      ? h("p", { class: "alert alert--soft", text: "Last time you added " + plural(state.fileNames.length, "file", "files") + ". Files are not kept between visits, so please add them again." }) : null;
    function paint() {
      var t = total();
      bar.style.width = Math.min(100, t / max * 100) + "%";
      meter.classList.toggle("is-full", t > max * .9);
      used.textContent = files.length ? size(t) + " of " + (B.maxMB || 50) + " MB used" : "Nothing added yet";
      left.textContent = files.length ? size(Math.max(0, max - t)) + " left" : (B.maxMB || 50) + " MB in total";
      list.innerHTML = "";
      files.forEach(function (file, i) {
        list.appendChild(h("li", null, [h("span", { class: "flist__n", text: file.name }), h("span", { class: "flist__s", text: size(file.size) }),
          h("button", { type: "button", class: "flist__x", text: "Remove", "aria-label": "Remove " + file.name, onclick: function () { files.splice(i, 1); remember(); paint(); progress(); } })]));
      });
    }
    function remember() { state.fileNames = files.map(function (x) { return x.name; }); save(); }
    function add(fl) {
      var msgs = [], tooBig = false;
      Array.prototype.forEach.call(fl, function (file) {
        if (!EXT.test(file.name)) { msgs.push(file.name + " is not a photo, zip, PDF or design file, so it was left out."); return; }
        if (files.some(function (x) { return x.name === file.name && x.size === file.size; })) return;
        if (total() + file.size > max) { tooBig = true; msgs.push(file.name + " (" + size(file.size) + ") would take you over " + (B.maxMB || 50) + " MB."); return; }
        files.push(file);
      });
      if (lost) { lost.remove(); lost = null; }
      alert.innerHTML = "";
      if (msgs.length) {
        alert.appendChild(h("div", { class: "alert" }, [msgs.join(" "), tooBig ? " Please put the bigger files in Google Drive and paste the link below." : ""]));
        if (tooBig) flash("files_drive");
      }
      remember(); paint(); progress();
    }
    input.addEventListener("change", function () { add(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove("is-over"); }); });
    drop.addEventListener("drop", function (e) { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files); });
    paint();
    return wrap(f, path, h("div", null, [lost, drop, meter, alert, list]));
  }

  function flash(id) {
    var el = doc.getElementById("f-" + id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
  }
  function unflag(el) { var f = el.closest(".f"); if (f) f.classList.remove("is-bad"); }

  /* ------------------------------------------------------------------ required + checks */
  function missing(limit) {
    for (var i = 0; i < steps.length; i++) {
      if (limit != null && i !== limit) continue;
      var s = steps[i];
      for (var j = 0; j < s.fields.length; j++) {
        var f = s.fields[j];
        if (f.required && !filled(f, state.answers)) return { step: i, id: f.id };
        if (f.type === "tel" && f.required && str(state.answers[f.id]).replace(/\D/g, "").length < 8) return { step: i, id: f.id, msg: "Please check this number." };
        if (f.type === "email" && str(state.answers[f.id]) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str(state.answers[f.id]))) return { step: i, id: f.id, msg: "Please check this email address." };
      }
    }
    return null;
  }
  function flag(m) {
    var f = doc.querySelector('[data-f="' + m.id + '"]');
    if (!f) return;
    f.classList.add("is-bad");
    if (m.msg) f.querySelector(".f__err").textContent = m.msg;
    f.scrollIntoView({ behavior: "smooth", block: "center" });
    var c = f.querySelector("input, textarea, button"); if (c) setTimeout(function () { c.focus({ preventScroll: true }); }, 350);
  }

  /* ------------------------------------------------------------------ screens */
  function mark() { return h("span", { class: "mark-wrap", html: B.mark || "" }); }

  function intro() {
    cur = -1;
    var has = Object.keys(state.answers).some(function (k) {
      var v = state.answers[k];
      return typeof v === "string" ? !!v.trim() : Array.isArray(v) ? v.length : v && typeof v === "object" ? (v.picked ? v.picked.length : false) : !!v;
    });
    var last = steps.findIndex(function (s) { return s.id === state.step; });
    var go1 = btn({ text: has ? "Continue" : "Start the brief", sub: has ? "/Where you left off" : "/" + B.name,
      onclick: function () { go(has && last > -1 ? last : 0); } });
    var sent = state.sent ? h("p", { class: "intro__back", text: "You sent a brief on " + new Date(state.sent.at).toLocaleDateString("en-MY", { day: "numeric", month: "long" }) + " (reference " + state.sent.id + "). Anything new can go in another one." }) : null;
    var over = has ? h("button", { type: "button", class: "link link--soft", text: "Start over", onclick: function () {
      if (!confirm("Clear every answer and start again? The resume link you have will stop working.")) return;
      dropDraft().then(function () { state = fresh(); files = []; openCards = {}; persist(); intro(); });
    } }) : null;
    var I = B.intro;
    render(h("main", { class: "intro" }, [h("div", { class: "intro__card step is-in" }, [
      h("div", { class: "intro__top" }, [mark(), h("p", { class: "intro__doc", text: B.doc })]),
      h("h1", { text: I.title }),
      h("p", { class: "intro__lede", text: I.lede }),
      planBlock(),
      I.pages ? h("div", { class: "intro__plan" }, [h("h2", { text: "What the new site could include" }),
        h("ul", { class: "intro__pages" }, I.pages.map(function (p) { return h("li", { text: p }); }))]) : null,
      h("ul", { class: "intro__notes" }, (I.notes || []).map(function (n, i) { return h("li", null, [h("span", { "aria-hidden": "true", html: [ICON.clock, ICON.pen, ICON.save][i % 3] }), h("span", { text: n })]); })),
      h("div", { class: "intro__go" }, [go1, over, has ? h("span", { class: "intro__back", text: "Your answers are saved." }) : null]),
      sent,
      h("p", { class: "intro__by", text: "Prepared by " + B.by })
    ])]));
    doc.title = B.doc + " · " + B.name;
  }

  /* the page plan, with the add-ons beside it, before any question is asked */
  function planBlock() {
    var P = B.plan;
    if (!P) return null;
    return h("section", { class: "plan", "aria-label": P.label || "The plan" }, [
      h("div", { class: "plan__head" }, [
        P.label ? h("span", { class: "lbl" }, [h("i", { class: "sq", "aria-hidden": "true" }), h("span", { class: "plan__kick", text: P.label })]) : null,
        h("h2", { class: "plan__title", text: P.title }),
        P.lede ? h("p", { class: "plan__lede", text: P.lede }) : null
      ]),
      h("div", { class: "plan__grid" + ((P.options || []).length < 2 ? " plan__grid--one" : "") }, (P.options || []).map(planCard)),
      P.foot ? h("p", { class: "plan__foot", text: P.foot }) : null
    ]);
  }

  function planCard(o) {
    return h("article", { class: "plan__opt" + (o.pick ? " is-pick" : "") }, [
      h("div", { class: "plan__top" }, [
        h("span", { class: "plan__name", text: o.name }),
        o.pick ? h("span", { class: "plan__tag", text: o.pick }) : null
      ]),
      h("p", { class: "plan__sub", text: o.sub }),
      h("p", { class: "plan__note", text: o.note }),
      h("ul", { class: "plan__pages" }, (o.pages || []).map(function (pg) {
        var name = typeof pg === "string" ? pg : pg.name;
        var isNew = typeof pg === "object" && pg["new"];
        return h("li", { class: isNew ? "is-new" : null }, [
          h("i", { class: "plan__dot", "aria-hidden": "true" }),
          h("span", { class: "plan__pg" }, [name, isNew && pg.why ? h("em", { text: pg.why }) : null])
        ]);
      })),
      h("p", { class: "plan__count", text: (o.pages || []).length + " pages" })
    ]);
  }

  function navList(onPick) {
    return h("ul", { class: "nav" }, steps.map(function (s, i) {
      return h("li", null, [h("button", { type: "button", "aria-current": i === cur ? "step" : null, onclick: function () { onPick && onPick(); go(i); } },
        [s.review ? h("span", { class: "dot", "aria-hidden": "true", style: "background:transparent" }) : h("span", { class: "dot", "data-dot": i, "aria-hidden": "true" }), s.title])]);
    }));
  }

  function stepScreen(i) {
    var s = steps[i];
    var sheet = h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": "Sections" });
    function closeSheet() { sheet.classList.remove("is-open"); }
    sheet.appendChild(h("div", { class: "sheet__bg", onclick: closeSheet }));
    sheet.appendChild(h("div", { class: "sheet__panel" }, [h("h2", { text: "Sections" }), navList(closeSheet),
      h("div", { style: "margin-top:22px" }, [btn({ text: "Continue later", kind: "muted btn--sm", icon: ICON.link,
        onclick: function () { closeSheet(); keepLater(); } })])]));

    var side = h("aside", { class: "side" }, [
      mark(),
      h("div", null, [h("p", { class: "side__doc", text: B.doc }), h("div", { class: "side__meter", style: "margin-top:16px" }, [h("i", { "data-meter": "" })]), h("p", { class: "side__pct", "data-pct": "" })]),
      h("nav", { "aria-label": "Sections" }, [navList()]),
      h("div", { class: "side__foot" }, [
        btn({ text: "Continue later", kind: "muted btn--sm", icon: ICON.link, onclick: keepLater }),
        h("span", { class: "saved", "data-saved": "", text: cloudOk === null ? "Saved on this device" : cloudOk ? "Saved. Your link works anywhere" : "Saved on this device only" }),
        h("span", { text: "Prepared by " + B.by })
      ])
    ]);
    var top = h("header", { class: "top" }, [
      h("div", { class: "top__in" }, [mark(), h("span", { class: "top__step", text: s.title }),
        h("button", { type: "button", class: "top__btn", onclick: function () { sheet.classList.add("is-open"); var c = sheet.querySelector('[aria-current="step"]'); if (c) c.focus(); } }, ["Sections"])]),
      h("div", { class: "top__bar" }, [h("i", { "data-meter": "" })])
    ]);

    var body = h("div", { class: "fields" }, s.fields.map(function (f) { return field(f, state.answers); }));
    var head = h("div", { class: "step__head" }, [h("h1", { text: s.title, tabindex: "-1" }), s.lede ? h("p", { class: "step__lede", text: s.lede }) : null,
      s.quote ? h("div", { class: "quote" }, [h("span", { text: s.quote.label }), h("q", { text: s.quote.text })]) : null]);

    var kids = [head];
    if (s.review) kids.push(summary());
    kids.push(body);

    var back = btn({ text: "Back", kind: "muted btn--back", onclick: function () { i > 0 ? go(i - 1) : intro(); } });
    var next = s.review
      ? btn({ text: "Confirm and send", sub: "/" + B.name, onclick: send })
      : btn({ text: i === steps.length - 2 ? "Review and send" : "Continue", sub: "/" + (i + 2) + " of " + steps.length, onclick: function () {
          var m = missing(i);
          if (m) { flag(m); return; }
          go(i + 1);
        } });
    var pager = h("div", { class: "pager" }, [back, h("div", { class: "pager__r" }, [!s.review ? h("span", { class: "pager__skip f__note", "data-count": i }) : null, next])]);

    render(h("div", { class: "shell" }, [side, h("div", null, [top, h("main", { class: "main" }, [h("section", { class: "step is-in", "aria-labelledby": "st-h" }, kids), pager])]), sheet]));
    var h1 = app.querySelector(".step__head h1"); h1.id = "st-h";
    doc.title = s.title + " · " + B.doc + " · " + B.name;
    progress();
    persistBadge();
  }
  function persistBadge() { if (cloudOk !== null) badge(cloudOk); }

  /* shows the one link that reopens this brief, wherever they are */
  function keepLater() {
    veil("Saving your place", "One moment.");
    makeDraft().then(function (d) {
      if (!d) return pushFailed();
      return pushDraft().then(function (ok) { return ok ? showLink() : pushFailed(); });
    });
  }
  function pushFailed() {
    veil("Your place is saved on this device",
      "The link could not be made just now, but nothing is lost: this browser remembers your answers. Open the brief again on this device and carry on, or try the link once you are back online.",
      [h("div", { class: "veil__acts" }, [btn({ text: "Try again", kind: "muted", onclick: keepLater }),
        h("button", { type: "button", class: "link link--soft", text: "Close", onclick: unveil })])]);
  }
  function showLink() {
    var url = resumeUrl();
    var box = h("div", { class: "keep__url", text: url, title: url });
    var note = h("span", { class: "keep__ok" });
    var msg = "Here is where I left off with the " + B.name + " website brief: " + url;
    veil("Keep this link", "It reopens your answers on any phone or computer, for the next few months. Send it to yourself now.", [
      h("div", { class: "keep__row" }, [box]),
      h("div", { class: "veil__acts" }, [
        btn({ text: "Copy the link", kind: "muted btn--sm", icon: ICON.link, onclick: function () {
          var done = function () { note.textContent = "Copied"; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, pick);
          else pick();
          function pick() { var r = doc.createRange(); r.selectNodeContents(box); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); note.textContent = "Press copy on the highlighted link"; }
        } }),
        B.contact && B.contact.whatsapp
          ? btn({ text: "Send on WhatsApp", kind: "muted btn--sm", href: "https://wa.me/" + B.contact.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg), blank: true })
          : btn({ text: "Email it to me", kind: "muted btn--sm", href: "mailto:?subject=" + encodeURIComponent(B.name + " website brief") + "&body=" + encodeURIComponent(msg) }),
        note,
        h("button", { type: "button", class: "link link--soft", text: "Back to the brief", onclick: unveil })
      ])
    ]);
  }

  function summary() {
    var rows = steps.slice(0, -1).map(function (s, i) {
      var c = stepCount(s);
      var extra = s.id === "files" ? (files.length ? ", " + plural(files.length, "file", "files") + " (" + size(total()) + ")" : "") + (str(state.answers.files_drive) ? ", Drive link added" : "") : "";
      return h("div", { class: "sum__row" }, [h("span", { class: "dot", "data-dot": i, "aria-hidden": "true" }), h("span", { class: "sum__t", text: s.title }),
        h("span", { class: "sum__c", text: c.d + " of " + c.n + extra }), h("button", { type: "button", class: "link", text: "Edit", "aria-label": "Edit " + s.title, onclick: function () { go(i); } })]);
    });
    return h("div", { class: "sum" }, rows);
  }

  function render(node) {
    app.className = "app";
    app.innerHTML = "";
    app.appendChild(node);
  }

  function go(i) {
    if (i < 0) return intro();
    i = Math.min(i, steps.length - 1);
    cur = i;
    state.step = steps[i].id;
    persist();
    if (location.hash !== "#" + steps[i].id) history.pushState(null, "", "#" + steps[i].id);
    stepScreen(i);
    window.scrollTo(0, 0);
    var h1 = app.querySelector(".step__head h1"); if (h1) h1.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------ send */
  function veil(title, text, kids) {
    if (!sending) { sending = h("div", { class: "veil", role: "dialog", "aria-modal": "true" }); doc.body.appendChild(sending); }
    sending.innerHTML = "";
    sending.appendChild(h("div", { class: "veil__card" }, [h("h2", { text: title }), text ? h("p", { text: text }) : null].concat(kids || [])));
  }
  function unveil() { if (sending) { sending.remove(); sending = null; } }

  function send() {
    var m = missing();
    if (m) {
      if (m.step !== cur) go(m.step);
      setTimeout(function () { flag(m); }, 60);
      return;
    }
    if (state.pending && state.pending.id) return uploadAll(state.pending);
    veil("Sending your answers", "This takes a moment.");
    var payload = { client: B.client, v: 1, answers: state.answers, files: files.map(function (f) { return { name: f.name, size: f.size }; }) };
    fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.id) throw new Error(j.error || "The server said " + r.status); return j; }); })
      .then(function (res) { state.pending = { id: res.id, token: res.token, done: [] }; persist(); return uploadAll(state.pending); })
      .catch(function (e) { fail("Your answers did not send", e.message + ". Nothing was lost: they are still saved on this device. Please try again in a moment.", true); });
  }

  function uploadAll(p) {
    var todo = files.filter(function (f) { return p.done.indexOf(f.name + ":" + f.size) < 0; });
    if (!todo.length) return finish(p);
    var rows = todo.map(function (f) {
      var bar = h("i"), pct = h("span", { text: "Waiting" });
      return { f: f, bar: bar, pct: pct, li: h("li", null, [h("div", { class: "veil__row" }, [h("span", { text: f.name }), pct]), h("div", { class: "meter__bar" }, [bar])]) };
    });
    veil("Uploading your files", "Your answers are in. Keep this page open until the files finish.", [h("ul", { class: "veil__list" }, rows.map(function (r) { return r.li; }))]);
    var failed = [];
    return rows.reduce(function (chain, r) {
      return chain.then(function () {
        return put(r.f, p, function (x) { r.bar.style.width = Math.round(x * 100) + "%"; r.pct.textContent = Math.round(x * 100) + "%"; })
          .then(function () { p.done.push(r.f.name + ":" + r.f.size); r.pct.textContent = "Done"; persist(); })
          .catch(function (e) { failed.push(r.f.name); r.pct.textContent = "Failed"; r.bar.style.width = "0"; r.bar.parentNode.title = e.message; });
      });
    }, Promise.resolve()).then(function () {
      if (!failed.length) return finish(p);
      fail(plural(failed.length, "file did not upload", "files did not upload"),
        "Your answers are in. " + failed.join(", ") + " did not make it. Try again, or finish now and share them through Google Drive.", true,
        btn({ text: "Finish without them", kind: "muted", onclick: function () { finish(p); } }));
    });
  }

  function put(file, p, onProg) {
    return new Promise(function (ok, no) {
      var x = new XMLHttpRequest();
      x.open("PUT", "/api/upload?id=" + encodeURIComponent(p.id) + "&t=" + encodeURIComponent(p.token) + "&name=" + encodeURIComponent(file.name) + "&c=" + encodeURIComponent(B.client));
      x.setRequestHeader("content-type", file.type || "application/octet-stream");
      x.upload.onprogress = function (e) { if (e.lengthComputable) onProg(e.loaded / e.total); };
      x.onload = function () { if (x.status >= 200 && x.status < 300) ok(); else { var m = "upload failed"; try { m = JSON.parse(x.responseText).error || m; } catch (e) {} no(new Error(m)); } };
      x.onerror = function () { no(new Error("connection dropped")); };
      x.send(file);
    });
  }

  function fail(title, text, retry, extra) {
    veil(title, text, [h("div", { class: "veil__acts" }, [
      retry ? btn({ text: "Try again", onclick: send }) : null,
      extra || null,
      h("button", { type: "button", class: "link link--soft", text: "Close", onclick: unveil })
    ])]);
  }

  function finish(p) {
    return fetch("/api/done", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: p.id, t: p.token, client: B.client }) })
      .catch(function () {})
      .then(function () {
        unveil();
        dropDraft();
        state = fresh(); state.sent = { id: p.id, at: Date.now() }; files = []; openCards = {};
        persist();
        history.pushState(null, "", location.pathname + location.search);
        done(p.id);
      });
  }

  function done(id) {
    cur = -1;
    var msg = "Hi Shazwan, we have sent the website brief for " + B.name + ". Reference " + id + ".";
    var acts = [];
    if (B.contact && B.contact.whatsapp) acts.push(btn({ text: "Tell Shazwan", sub: "/WhatsApp", blank: true,
      href: "https://wa.me/" + B.contact.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg) }));
    if (B.contact && B.contact.email) acts.push(btn({ text: "Email Shazwan", sub: "/" + B.contact.email, kind: acts.length ? "muted" : "",
      href: "mailto:" + B.contact.email + "?subject=" + encodeURIComponent(B.name + " website brief sent") + "&body=" + encodeURIComponent(msg) }));
    render(h("main", { class: "done" }, [h("div", { class: "done__card step is-in" }, [
      mark(),
      h("div", { class: "done__tick", "aria-hidden": "true", html: ICON.tick }),
      h("h1", { text: B.done.title }),
      h("p", { class: "done__lede", text: B.done.lede }),
      h("p", { class: "done__ref", text: "Reference " + id }),
      h("div", { class: "done__acts" }, acts)
    ])]));
    doc.title = B.done.title;
  }

  /* ------------------------------------------------------------------ start */
  function start() {
    B = window.BRIEF;
    if (!B) { app.textContent = "This brief could not be loaded."; return; }
    if (B.theme) Object.keys(B.theme).forEach(function (k) { doc.documentElement.style.setProperty(k, B.theme[k]); });
    KEY = "brief:" + B.client + ":v1";
    state = load() || {};
    if (!state.answers) state = fresh();
    steps = B.steps.slice();
    steps.push({ id: "review", title: B.review.title, lede: B.review.lede, fields: B.review.fields, review: true });

    window.addEventListener("popstate", function () {
      var w = location.hash.slice(1), j = steps.findIndex(function (s) { return s.id === w; });
      if (j > -1) { cur = j; stepScreen(j); window.scrollTo(0, 0); } else intro();
    });
    /* a last write on the way out, so nothing typed in the final seconds is lost */
    window.addEventListener("pagehide", function () { persist(); if (state.draft && anyAnswer()) pushDraft(true); });

    var q = new URLSearchParams(location.search);
    var rid = q.get("r"), rt = q.get("t");
    if (rid && rt) return reopen(rid, rt);
    boot();
  }

  /* someone followed their resume link: the server's copy wins over this device's */
  function reopen(id, token) {
    app.className = "app";
    app.innerHTML = "";
    app.appendChild(h("main", { class: "intro" }, [h("div", { class: "intro__card" }, [
      h("p", { class: "intro__doc", style: "text-align:left", text: "Opening your brief" })])]));
    fetch("/api/draft?id=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(token) + "&c=" + encodeURIComponent(B.client))
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "That link did not work"); return j; }); })
      .then(function (d) {
        if (d && d.answers && typeof d.answers === "object") {
          state = fresh();
          state.answers = d.answers;
          state.step = d.step || null;
          state.fileNames = Array.isArray(d.fileNames) ? d.fileNames : [];
        }
        state.draft = { id: id, token: token };
        persist();
        cloudOk = true;
      })
      .catch(function (e) { alertLine = e.message; })
      .then(clean);
    function clean() {
      var keep = new URLSearchParams(location.search).get("c");
      history.replaceState(null, "", location.pathname + (keep ? "?c=" + encodeURIComponent(keep) : ""));
      boot();
    }
  }
  var alertLine = null;

  function boot() {
    var want = location.hash.slice(1), k = steps.findIndex(function (s) { return s.id === want; });
    if (k > -1) go(k);
    else if (state.step && state.draft) { var j = steps.findIndex(function (s) { return s.id === state.step; }); j > -1 ? go(j) : intro(); }
    else intro();
    if (alertLine) { window.alert(alertLine); alertLine = null; }
  }
})();
