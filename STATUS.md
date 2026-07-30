# CSOAI Dashboard — Status
**Last updated: 2026-07-30**

## Done
- [x] 9 pages all return 200
- [x] TypeScript compiles cleanly
- [x] All pages wired to d1-client with loading/error states
- [x] Verify page uses real SHA-256 chain verification
- [x] CORS whitelist + API key auth
- [x] Schema accepts `queued` coverage status
- [x] Route ordering fixed in ledger.ts
- [x] TimeSlider memory leak fixed
- [x] Mobile hamburger menu
- [x] Accessibility (focus styles, ARIA, skip-to-content)
- [x] Dead code removed
- [x] SpectrumView (8 lenses)
- [x] BranchView (3 branches + Article 14)
- [x] Deployment config (DEPLOY.md, seed.sql, wrangler.toml)
- [x] Language audit passes

## Remaining (needs your input)
- [ ] Deploy to Cloudflare (needs `wrangler d1 create csoai-gspc` → database_id)
- [ ] Wire LiteLLM for real model calls (needs LiteLLM endpoint)
- [ ] Custom domain setup (needs DNS access)

## Can do now (no blockers)
- [ ] Add more mock data / seed entries
- [ ] Improve GapMap with real GeoJSON polygons
- [ ] Add more J-records to mock data
- [ ] Add error boundaries
- [ ] Add more tests
