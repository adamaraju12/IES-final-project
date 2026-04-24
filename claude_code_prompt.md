# Claude Code Kickoff Prompt

Copy everything below the divider into Claude Code as your first prompt. Have `site_data.json` ready in the repo before you start so Claude Code can read it.

---

I'm building a web app for a school project. It's a tool a clean energy developer would use to design, pitch, and operate a behind-the-meter DER (distributed energy resource) portfolio for a data center client. Our specific site is a representative 48 MW Santa Clara hyperscale facility modeled on Digital Realty SJC37.

## Stack

Use Next.js 14 with the App Router, TypeScript, Tailwind CSS, shadcn/ui for components, Recharts for all charts, and lucide-react for icons. Deploy target is Vercel. Set up the project so `npm run dev` works immediately and the app deploys cleanly to Vercel.

## Visual style

Dark theme, navy background around #0a1628, card backgrounds around #111d33, cyan accent around #00d4ff for headings, active states, and key numbers. Status colors: green for good, yellow for warning, red for critical. KPI tiles look like this: small uppercase gray label at top, very large white number, small cyan unit next to it, gray context line below. Cards have subtle borders and rounded corners. Match the polished dark dashboard aesthetic of energy operations tools.

## Data model

There is one file at `/public/site_data.json` that contains every number the app displays. Read it once at app load. Never hardcode numbers into pages. The file has these top-level sections: site, site_context, load_profile_24h_mw, gpu_clusters, cooling_zones, proposed_portfolio, alternative_portfolios, economics, sensitivity_analysis, live_operations, dispatch_24h, scenarios, insights_30day.

## App structure

The app has two top-level modes the user toggles between in the main nav: **Design Mode** and **Operations Mode**. Each mode has 3 pages.

### Design Mode (the pitch side)

**Page 1: Site and Portfolio.** Header with site name and location. Row of 4 KPI tiles showing peak load, annual consumption, interconnection queue years, and our time-to-power months. Below that, a 24-hour load profile line chart on the left and 4 small site context cards on the right (grid, utility, solar resource, climate). Then a "Compute Load Breakdown" section with a table of the 5 GPU clusters showing id, role, power MW, and flexibility level. Then a "Cooling Zones" card showing the 3 data halls with capacity and curtailment potential. Then 4 portfolio cards (PV, BESS, Fuel Cell, Grid Interconnection) showing the proposed equipment specs. Finally a 3-column comparison of alternative portfolios with the recommended one highlighted in cyan.

**Page 2: Business Case.** Top row of 6 KPI tiles: CapEx, NPV, LCOE, Payback, CO2 Avoided, 24/7 CFE Match. Then a hero "Time-to-Power Timeline" showing two horizontal bars stacked vertically: one red showing the 3.5-year interconnection queue path with milestone dots, one green showing our 18-month build path with milestones. Below the timeline, a callout box styled with green background showing the dollar value of early deployment ("$37M revenue captured by deploying 2 years earlier"). Then a 24-hour stacked area chart showing dispatch by source (PV, BESS, fuel cell, grid). Below it three pills showing annual PPA match, hourly CFE match, and industry benchmark. Then a CapEx breakdown donut chart side-by-side with an annual savings horizontal bar chart. At the bottom, a "Sensitivity Analysis" panel with 5 sliders (discount rate, PPA price, gas price, capacity payment, BESS capex) on the left and a live-updating NPV/payback/LCOE display on the right. Use the npv_delta_per_unit values from sensitivity_analysis to compute live updates linearly. No need to re-run a real model.

**Page 3: Client One-Pager.** A single print-friendly page that reuses Page 2 data in a condensed format. Header with proposal title and date. A hero callout in the middle with three numbers ("18 months · $28M NPV · 72% CFE"). Left column with 5 narrative bullets. Right column with 6 small KPI boxes in a 2x3 grid. A small time-to-power bar chart. A "Download PDF" button that triggers `window.print()`. Add print-specific CSS so the page prints cleanly to one A4/letter page.

### Operations Mode (the day-to-day running side)

**Page 1: Live Operations.** Top section titled "Today's Optimization Recommendations" showing 5 recommendation cards in a grid (read from live_operations.recommendations). Each card has a title, description, and colored impact line at the bottom. Below that, a row of 5 live KPI tiles showing current total load, net grid import, battery SoC, CO2 intensity, and cooling flex capacity. Below the tiles, a 24-hour stacked area chart showing the past 24 hours of dispatch (use dispatch_24h data). Below the chart, a "GPU Cluster Status" section with a card or table for each of the 5 clusters showing power draw, utilization, role, and flexibility. Next to it, a "Cooling System Status" mini-panel with current cooling load and curtailment availability for each hall. Add a floating chat button in the bottom right corner styled with the cyan accent (no functionality needed for now, just a placeholder UI).

**Page 2: Scenario Studio.** Two-column layout. Left column is a form with: scenario name text input, electricity price profile dropdown (Base / High / Low / Volatile), load profile dropdown (Normal / Peak / Light), PV availability dropdown (Sunny / Cloudy / Rainy), battery cycling dropdown (Conservative / Medium / Aggressive), cooling flexibility dropdown (Low / Medium / High), two checkboxes ("Allow shifting flexible GPU loads", "Allow cooling curtailment"), and a cyan "Run Scenario" button. Right column is the results panel. When the user clicks Run Scenario, populate the right side with KPI tiles showing total daily cost, CO2 intensity, battery cycles, GPU load shifted MWh, and cooling curtailed MWh, plus a comparison bar chart against the base case. Below the form and results, a "Saved Scenarios" section that lets the user save up to 3 scenarios and view them side-by-side.

**Page 3: Insights.** Top row of 6 KPI tiles showing the last 30 days: total energy cost, cost savings, average PUE, carbon avoided, solar contribution, cooling savings. Add a 7th tile showing GPU Load Shifted MWh. Below that, two charts side by side: weekly cost & savings horizontal bars, and weekly CO2 emissions horizontal bars with a target line. Below those, a monthly trend line chart showing the 24/7 CFE match percentage over 6 months.

## Shared components to build first

Build these once, reuse everywhere: KPITile (label, value, unit, context), RecommendationCard (title, description, impact, category icon), AssetCard (title, status dot, list of label/value rows), SectionHeader (title, subtitle), DataTable (columns, rows), StatusBadge (text, color).

## Build order

Start with the project scaffold, navigation, and the shared components above. Then build Live Operations first (most visual payoff, validates the stack). Then Site and Portfolio. Then Business Case (this is the hardest page, allow extra time). Then Scenario Studio. Then Insights. Then Client One-Pager last.

## Important constraints

Every number on every page must come from `site_data.json`. Never hardcode. The JSON file may have its values updated as Xendee outputs become available, and the app should reflect those changes automatically. Keep the code modular so pages can be edited independently. Add brief comments where the logic is non-obvious. The app must be responsive but desktop-first since this is a pitch tool. Make it look polished and impressive, this is for a final school project that will be presented and graded.

Start by scaffolding the project, setting up the layout shell with the two-mode navigation, and building the 6 shared components. Then we'll go page by page.
