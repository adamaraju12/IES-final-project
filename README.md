# IES Final Project: Santa Clara DER Platform

A web tool that helps a clean energy developer design, pitch, and operate a behind-the-meter DER portfolio for a data center.

**Site:** Modeled on Digital Realty SJC37, a 48 MW Santa Clara hyperscale facility currently sitting empty due to grid interconnection constraints.

**Thesis:** Grid interconnection queues block multi-year deployment. Our tool helps developers design, pitch, and operate BTM DER systems that get data centers operational in 18 months instead of waiting 3-5+ years for the utility.

## Repo structure

```
/
├── public/
│   └── site_data.json        ← Single source of truth for all numbers
├── app/                       ← Next.js App Router pages
│   ├── design/                ← Design Mode pages
│   └── operations/            ← Operations Mode pages
├── components/                ← Shared UI components
└── README.md
```

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- shadcn/ui for components
- Recharts for visualizations
- Deployed on Vercel

## Getting started

```bash
git clone <repo-url>
cd <repo-name>
npm install
npm run dev
```

Open http://localhost:3000

## How the data works

Every number displayed in the app reads from `public/site_data.json`. Do not hardcode numbers into pages. As Xendee outputs become available, we update `site_data.json` and the app reflects new numbers automatically.

The JSON has these sections:
- `site` — facility specs, location, load
- `site_context` — grid, utility, solar resource, climate
- `gpu_clusters` — 5 GPU clusters with role and flexibility
- `cooling_zones` — 3 data halls with cooling capacity
- `proposed_portfolio` — Xendee-recommended DER mix
- `alternative_portfolios` — comparison cases
- `economics` — NPV, LCOE, payback, savings breakdown
- `sensitivity_analysis` — pre-computed slider deltas
- `live_operations` — current state and recommendations
- `dispatch_24h` — hourly dispatch by source
- `scenarios` — saved scenario results
- `insights_30day` — long-term analytics

## Pages

**Design Mode** (the pitch side)
1. Site and Portfolio
2. Business Case
3. Client One-Pager

**Operations Mode** (the day-to-day running side)
1. Live Operations
2. Scenario Studio
3. Insights

## Team roles

- **Xendee Lead:** Run simulation, fill in `proposed_portfolio` and `economics` in JSON
- **Design Mode Dev:** Build pages 1-3 of Design Mode
- **Operations Mode Dev:** Build pages 1-3 of Operations Mode
- **Pitch and Report Lead:** Written report, pitch deck, site assumptions documentation

## Important notes

The site is a representative model of a 48 MW Santa Clara facility. The 48 MW capacity and Santa Clara location are public. Internal load profile, GPU cluster configuration, and cooling zones are constructed from public benchmarks (Uptime Institute PUE, NVIDIA rack specs, NREL load shapes) since no data center publishes operational data. CAISO prices, Silicon Valley Power tariffs, and weather data are real.

This framing is documented in the written report's Site Assumptions section.
