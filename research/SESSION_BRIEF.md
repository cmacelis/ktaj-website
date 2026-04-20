# Government Spending → Stock Watchlist — Session Brief

Paste this whole file into a new Claude Code session (or just say "read research/SESSION_BRIEF.md and continue") to pick up where we left off.

## Goal

Identify publicly-traded companies that receive large and/or growing federal government contracts, to build a candidate investment watchlist.

**Thesis edge:** raw "top contractors" is priced in. Look for *change* — accelerating YoY award growth, small/mid-caps where federal $ is a material share of revenue, agency-specific shifts.

## Current status

- Branch: `claude/government-spending-research-rLMTY`
- `.claude/settings.local.json` was written to add `api.usaspending.gov` + `files.usaspending.gov` to the sandbox allowlist, but the **infrastructure-level egress proxy overrides it**. Those hosts still return "Host not in allowlist" (HTTP 403, 21 bytes).
- Before running anything, the managed network policy needs `api.usaspending.gov` and `files.usaspending.gov` added. On a managed Claude Code deployment this is typically in `/etc/claude-code/managed-settings.json` under `sandbox.network.allowedDomains`, or an equivalent egress proxy config. User-level settings won't work.
- First action in the new session: run the connectivity test below. If it still 403s, the allowlist change didn't take effect.

## Connectivity test

```bash
curl -s -o /tmp/ref.json -w "HTTP:%{http_code} SIZE:%{size_download}\n" \
  -H "User-Agent: Mozilla/5.0" \
  "https://api.usaspending.gov/api/v2/references/toptier_agencies/"
head -c 400 /tmp/ref.json
```

Expected good response: HTTP 200, large JSON body starting with `{"results":[...`.
Expected bad response: HTTP 403, body = `Host not in allowlist`.

## Phase 1 plan (run once connectivity works)

**Query A — Top 100 contract recipients, FY2025**
```
POST https://api.usaspending.gov/api/v2/search/spending_by_category/recipient/
{
  "filters": {
    "time_period": [{"start_date": "2024-10-01", "end_date": "2025-09-30"}],
    "award_type_codes": ["A", "B", "C", "D"]
  },
  "category": "recipient",
  "limit": 100,
  "page": 1
}
```

**Query B — Same for FY2024** (for YoY growth)
Same payload, dates `2023-10-01` → `2024-09-30`.

**Query C — Parent recipient lookup** per recipient (rolls subsidiaries up to their public parent — e.g. "Lockheed Martin Aeronautics Co" → "Lockheed Martin Corp" → LMT)
```
GET https://api.usaspending.gov/api/v2/recipient/<recipient_id>/
```

**Query D (optional) — Agency breakdown per recipient**
`/api/v2/search/spending_by_category/awarding_agency/` filtered per recipient. Shows DoD-heavy vs. HHS-heavy etc.

**Output:** `research/phase1_recipients.{json,csv}` with columns:
`recipient_name | parent_name | fy2025_total | fy2024_total | yoy_pct | top_agency`

Approx. runtime: 5-10 minutes (USAspending API is slow — ~2-5s per request, ~102 requests total).

## Phase 2 plan (after Phase 1 data is saved)

1. Match parent recipient names to public tickers (hand-curated pass for top 100 — many are obvious: LMT, RTX, NOC, GD, BA, LDOS, LHX, BAH, SAIC, HII, CACI, etc. Drop private companies.)
2. Pull market cap + recent revenue for each ticker (open question: do we have a finance API that's allowlisted? Yahoo/Finviz are common choices — test connectivity first.)
3. Compute `federal_revenue_pct = fy2025_total / ttm_revenue` — the "how leveraged are they to federal spending" number.
4. Rank by combination of (YoY growth %, federal revenue %, market cap bucket).

## Phase 3 plan

Deliver a short write-up: top 10-15 candidates with thesis, categorized by "known defense prime (well-known, less alpha)", "mid-cap with accelerating gov revenue (more interesting)", and "small-cap high-federal-% (riskiest but highest-upside)".

## Open questions to resolve when we resume

1. Does the allowlist update cover `api.usaspending.gov` AND `files.usaspending.gov`? (Second one only needed if we fall back to bulk CSV downloads.)
2. What finance API is reachable for market-cap/revenue data in Phase 2? (Test: `query1.finance.yahoo.com`, `finviz.com`, `stockanalysis.com`.)
3. Scope: broad (all agencies) or narrow (e.g. defense-only, or AI/tech-focused)? Current default is broad across all agencies, filter later.
4. Include grants (award type 02, 03, 04, 05) or contracts only? Currently contracts only — grants usually go to universities/nonprofits, less investment-relevant.
