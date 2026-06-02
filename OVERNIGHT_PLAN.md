# CSOAI — Overnight Plan & Execution Queue

_Last updated: 2026-06-02 by Claude (agentic session)._

This is the live backlog. Items marked **[AUTO]** run without anyone present.
Items marked **[QUEUED — needs key]** are built and waiting on one credential.

---

## Runs automatically overnight (no human needed)
- **[AUTO] Daily MCP registry sync** — `.github/workflows/sync-mcp-registry.yml`
  - Cron `0 6 * * *` (06:00 UTC). Pulls the CSOAI-ORG org, regenerates
    `client/src/data/mcpRegistry.json`, commits to `deploy` only if it changed,
    which auto-deploys. Keeps the MCP Fleet page current as you ship new MCPs.
- **[AUTO] Production deploys** — every push to `deploy` builds + deploys to
  csoai.org via `vercel-deploy.yml`.

## Done (live now) — 18 of 33 moves
Site live on csoai.org · www redirect · founder = Nicholas Templeman ·
MCP Fleet (302) at /mcp · 302 per-MCP SEO pages · 26 framework pages ·
crosswalk→MCP wiring · sitemap (360 URLs) on csoai.org · robots fixed ·
EU AI Act diagnostic funnel on home/pricing/enterprise/mcp/framework pages ·
Product/Offer + SoftwareApplication schema · OG tags · urgency banners ·
IndexNow submitted (360 URLs → Bing/Yandex, HTTP 200) · Platform-vs-API explainer ·
TS build fixes · deploy↔main synced.

---

## QUEUED — fires the moment you paste the keys

### A. Live revenue (needs rotated `sk_live_…` Stripe key)
1. Add `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` + price IDs to Vercel env (via runner, encrypted).
2. Run the existing `stripeSetup` flow → create **Pro $99/mo** + **Enterprise $499/mo** products.
3. Wire live checkout buttons on /pricing and the MCP page.
4. Connect `api.meok.ai` gateway for **metered per-call billing** (needs `MEOK_API_KEY`).
5. Log every MCP call into `auditLogs` (per-user + per-AI tamper-evident trail).
6. Gate tool access by tier: free = read/browse, Pro = run, Enterprise = API key.
7. Turn on the paid **August Audit** (diagnostic → fixed-fee remediation).

### B. Google indexing (needs Search Console verification token)
8. Add the GSC verification meta tag, verify csoai.org, submit the 360-URL sitemap.
   (Bing/Yandex already done via IndexNow.)

### C. Growth (needs one small choice each)
9. Email welcome sequence — provider? (`RESEND_API_KEY` or SendGrid).
10. Analytics + conversion events — Plausible domain or GA4 ID.
11. Launch post (LinkedIn/X) + 20 cold-outreach emails to compliance leads — needs OK to publish.

---

## No-key items Claude can still execute next session
- Per-MCP "tool catalog" (pull each repo's `server.json` to list actual tools).
- `/compliance` gap-scan lead-magnet form → emails the lead.
- Founding-customer launch pricing block (first 20 at 50% off, urgency).
- OG image generation for /mcp and /crosswalks.

**Bottleneck to revenue = one rotated `sk_live_…` key.** Everything else is built.
