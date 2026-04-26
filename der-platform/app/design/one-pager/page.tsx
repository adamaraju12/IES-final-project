"use client";

import { getSiteData } from "@/lib/data";

export default function OnePagerPage() {
  const data = getSiteData();
  const { site, economics, site_context } = data;
  const queueYears = site.interconnection_queue_years;
  const ourMonths = site.our_time_to_power_months;
  const earlyValue = economics.early_deployment_value;

  const kpiBoxes = [
    { label: "Total CapEx", value: `$${economics.capex_total_millions}M` },
    { label: "20-Year NPV", value: `$${economics.npv_millions_20yr}M` },
    { label: "LCOE", value: `$${economics.lcoe_per_mwh}/MWh` },
    { label: "Payback Period", value: `${economics.payback_years} yrs` },
    { label: "24/7 CFE Match", value: `${economics.cfe_match_annual_pct}%` },
    { label: "CO₂ Avoided", value: `${(economics.co2_avoided_tons_lifetime / 1000).toFixed(0)}kt` },
  ];

  const bullets = [
    `${site.name} faces a ${queueYears}-year grid interconnection queue, delaying operations and costing an estimated $${earlyValue.lost_revenue_per_year_millions}M per year in foregone revenue.`,
    `Our behind-the-meter DER solution delivers power in ${ourMonths} months — ${Math.round(queueYears * 12 - ourMonths)} months faster than the grid path — capturing $${earlyValue.total_captured_millions}M in early revenue.`,
    `The hybrid portfolio (${data.proposed_portfolio.pv_array.nameplate_mw_dc} MW PV · ${data.proposed_portfolio.bess.energy_capacity_mwh} MWh BESS · ${data.proposed_portfolio.diesel.capacity_mw} MW diesel backup) achieves ${economics.cfe_match_annual_pct}% annual clean energy match, beating the ${economics.cfe_match_industry_benchmark_pct}% industry benchmark.`,
    `Powered by ${site_context.utility.name} (${site_context.utility.tariff}) with CAISO dynamic pricing, the system generates $${economics.annual_savings_breakdown.total_annual_millions}M in annual savings and revenue.`,
    `With a $${economics.capex_total_millions}M capital investment and ${economics.irr_pct}% IRR, the project reaches payback in ${economics.payback_years} years and avoids ${(economics.co2_avoided_tons_lifetime / 1000).toFixed(0)}kt CO₂ over its lifetime.`,
  ];

  // Mini timeline milestones
  const gridMilestones = [
    { label: "Queue Entry", pct: 0 },
    { label: "Study Complete", pct: 40 },
    { label: "Agreement Signed", pct: 70 },
    { label: "Energized", pct: 100 },
  ];
  const ourMilestones = [
    { label: "Contract Signed", pct: 0 },
    { label: "Permits", pct: 25 },
    { label: "Energized", pct: (ourMonths / (queueYears * 12)) * 100 },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto pb-16">

      {/* ── Download button (outside print area) ── */}
      <div className="flex justify-end mb-4 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-[#0a1628] text-sm font-bold rounded-lg hover:bg-accent/90 transition-colors"
        >
          ↓ Download PDF
        </button>
      </div>

      {/* ── Printable one-pager ── */}
      <div className="print-page bg-navy-card border border-navy-border rounded-xl overflow-hidden">

        {/* Header bar */}
        <div className="bg-[#0d1e35] border-b border-navy-border px-8 py-5 flex justify-between items-center">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">DER Portfolio Platform · Proposal</p>
            <h1 className="text-white text-xl font-bold">{site.name}</h1>
            <p className="text-gray-400 text-xs mt-0.5">{site.location} · {site_context.utility.name} · {site_context.grid_operator.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">Prepared by</p>
            <p className="text-white text-sm font-semibold">IES Team</p>
            <p className="text-gray-500 text-xs mt-0.5">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* Hero stat line */}
        <div className="bg-[#0a1628] border-b border-navy-border px-8 py-6 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Proposal Summary</p>
          <p className="text-3xl font-bold text-white">
            {ourMonths} months{" "}
            <span className="text-gray-600 font-light mx-2">·</span>
            <span className="text-accent">${economics.npv_millions_20yr}M NPV</span>
            <span className="text-gray-600 font-light mx-2">·</span>
            {economics.cfe_match_annual_pct}% CFE
          </p>
          <p className="text-gray-500 text-xs mt-2">{site.tagline}</p>
        </div>

        {/* Main body: two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-navy-border">

          {/* Left: narrative bullets */}
          <div className="px-8 py-6 space-y-4">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">The Case for Acting Now</p>
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-accent font-bold text-sm mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-gray-300 text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </div>

          {/* Right: KPI grid */}
          <div className="px-8 py-6">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">Key Metrics</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {kpiBoxes.map((k) => (
                <div key={k.label} className="bg-[#0d1e35] rounded-lg p-3 border border-navy-border">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{k.label}</p>
                  <p className="text-white text-lg font-bold tabular-nums">{k.value}</p>
                </div>
              ))}
            </div>

            {/* Mini timeline */}
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">Time-to-Power</p>
            <div className="space-y-5">
              {/* Grid path */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-xs">Traditional Grid Path</span>
                  <span className="text-red-400 text-sm font-semibold">{queueYears} yrs</span>
                </div>
                <div className="relative pb-6">
                  <div className="h-1 bg-red-900/60 rounded-full" />
                  {gridMilestones.map((m) => (
                    <div
                      key={m.label}
                      className="absolute flex flex-col items-center"
                      style={{
                        top: "-5px",
                        left: m.pct === 0 ? "0px" : m.pct === 100 ? "calc(100% - 6px)" : `calc(${m.pct}% - 6px)`,
                        transform: m.pct === 0 ? "none" : m.pct === 100 ? "translateX(-100%)" : "translateX(-50%)",
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200" />
                      <span className="text-red-400 text-[11px] mt-1.5 whitespace-nowrap">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Our path */}
              <div className="mt-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-xs">Our BTM DER Path</span>
                  <span className="text-green-400 text-sm font-semibold">{ourMonths} months</span>
                </div>
                <div className="relative pb-6">
                  <div className="h-1 bg-gray-800 rounded-full" />
                  <div
                    className="absolute top-0 left-0 h-1 bg-green-500 rounded-full"
                    style={{ width: `calc(${(ourMonths / (queueYears * 12)) * 100}%)` }}
                  />
                  {ourMilestones.map((m) => (
                    <div
                      key={m.label}
                      className="absolute flex flex-col items-center"
                      style={{
                        top: "-5px",
                        left: m.pct === 0 ? "8px" : m.pct >= 80 ? `calc(${m.pct}% - 6px)` : `calc(${m.pct}% - 6px)`,
                        transform: m.pct === 0 ? "none" : m.pct >= 80 ? "translateX(-100%)" : "translateX(-50%)",
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200" />
                      <span className="text-green-400 text-[11px] mt-1.5 text-center" style={{ maxWidth: "48px", whiteSpace: "normal", lineHeight: "1.2" }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early value callout — pushed down with mt-4 to clear labels */}
              <div className="mt-6 rounded-lg bg-green-950/40 border border-green-800/40 px-4 py-3">
                <p className="text-green-300 text-xs font-semibold">
                  ⚡ ${earlyValue.total_captured_millions}M captured by deploying {earlyValue.years_saved} years earlier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0d1e35] border-t border-navy-border px-8 py-3 flex justify-between items-center">
          <p className="text-gray-600 text-xs">Confidential · For client review only</p>
          <p className="text-gray-600 text-xs">Data sourced from Xendee simulation · CAISO · Silicon Valley Power</p>
        </div>
      </div>
    </div>
  );
}
