# Client Brief

A branded questionnaire a client fills in before a website revamp. First client: **Esteem Dental**, at `edcform.mhdshazwn.com`.

Subdomains use initials, never the client's name, so the link gives nothing away if it is forwarded: `<initials>form.mhdshazwn.com`.

- `public/index.html`, `public/js/brief.js`, `public/css/brief.css`: the page engine. It saves answers on the visitor's device as they type, mirrors them to a server-side draft so a **resume link** reopens them anywhere, checks the 50 MB upload limit in the browser, and sends.

**The look** is mhdshazwn.com's, on purpose: Zalando Sans over Geist Mono, `#252422` ink on `#fffcf2` paper, `#eb5e28` accent, square corners, the 6px accent square before every label, and the site's sliding-icon button (`btn()` in `brief.js`). The form is laid out like the Myna Snacks contact page: one mono label above every field, outlined fields on bare paper, nothing filled unless it is chosen. Any token can be overridden per client through `BRIEF.theme`.
- `public/js/clients/esteemdental.js`: **all the questions, wording and brand for Esteem.** For a new client, copy this file, change it, and add the client's subdomain in two places: `HOSTS` in `brief.js` and `CLIENTS` in `src/lib.js`.
- `functions/api/`: Cloudflare Pages Functions.
  - `draft`: continue later. `POST` makes a draft id and a token, `PUT` overwrites it, `GET` reads it back, `DELETE` removes it once the brief is sent. The token is the only key, it reaches one draft and nothing else, and it lasts 120 days (`DRAFT_DAYS` in `src/lib.js`).
  - `submit`: saves the answers and returns an upload link that lasts 6 hours.
  - `upload`: takes one file per request. It refuses anything that would take the brief past 50 MB, and refuses any type other than photos, zip, PDF and design files.
  - `done`: marks the brief complete.
  - `admin/*`: your private area.
- `public/admin/`: log in, list briefs, read one as a document, download files, "Copy as text", delete.

Everything is stored in one R2 bucket, `client-briefs`:
- `briefs/<client>/<id>/answers.json` holds the answers.
- `briefs/<client>/<id>/files/...` holds the uploads.
- `drafts/<client>/<id>.json` holds a part-finished brief.

## Continue later

Once there is at least one answer, the browser asks for a draft id and pushes the answers to it about two seconds after every change, and once more on the way out of the page. **Continue later** in the sidebar (or in the Sections sheet on a phone) shows the one link that reopens the brief:

    https://<host>/?r=<draft id>&t=<token>&c=<client>

Opening it fetches the server's copy, which wins over whatever that device had, cleans the query string away and drops the visitor back on the step they left. Uploaded files are never part of a draft, because a browser cannot hold a file between visits; the files step says so and asks for them again. Sending the brief deletes the draft, so the old link stops working.

## Run it locally

There's no Node on this Mac. The session's preview config `client-brief` runs a portable Node plus wrangler from the scratchpad on port 8977, with local storage that imitates R2. It serves a copy, because the Desktop folder is privacy-protected. Secrets for local runs are in `.dev.vars`, which is git-ignored.

## Go live (one time)

1. **Cloudflare, R2:** open R2 and create a bucket named `client-briefs`. Cloudflare may ask for a card to switch R2 on. The first 10 GB are free, which is about 200 full 50 MB briefs.
2. **Cloudflare, Pages:** create a project named `client-brief` and connect it to the R2 bucket:
   - Deploy it with `wrangler pages deploy`, or connect it to a GitHub repo.
   - In Settings > Bindings, add an R2 bucket with variable name `FILES` and bucket `client-briefs`.
3. **Secrets:** go to Settings > Variables and Secrets and add both as encrypted values:
   - `BRIEF_SECRET`: a long random string.
   - `ADMIN_PASS`: your admin password.
4. **Domain:** in the Pages project, open Custom domains and add the client's subdomain, choosing **"My DNS provider"** so the zone stays at Hostinger. Cloudflare shows a CNAME target, normally `client-brief.pages.dev`. Wrangler has no `pages domain` command, so this step is dashboard only.
5. **Hostinger:** go to hPanel > Domains > mhdshazwn.com > DNS records and add the CNAME:
   - Name: `esteemdental`
   - Target: what Cloudflare showed
   - Leave TTL at the default.

   Nothing else moves. The main site stays on GitHub Pages.
6. **Check:** send a test brief, open `/admin/`, then delete the test.

## Not built yet

- **Email or Telegram alert on each new brief.** For now, the thank-you screen asks the client to email you. Your WhatsApp number can go in `contact.whatsapp` in the client file.
- **A BM version of the questions.**
- **Spam protection beyond what's there now.** Current checks: same-site posting, signed upload links, the 50 MB cap per brief, file-type checks, and noindex. If spam ever shows up, add Cloudflare Turnstile.
