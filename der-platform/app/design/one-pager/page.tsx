"use client";

import { getSiteData } from "@/lib/data";

export default function OnePagerPage() {
  const data = getSiteData();
  const { site, economics, site_context } = data;
  const queueYears = site.interconnection_queue_years;
  const ourMonths = site.our_time_to_power_months;
  const ttp = economics.time_to_power_thesis;

  const kpiBoxes = [
    { label: "Total CapEx",       value: `$${economics.capex_total_millions}M`,                               muted: false },
    { label: "20-Year NPV",       value: `$${economics.npv_millions_20yr}M`,                                  muted: false },
    { label: "LCOE",              value: `$${economics.lcoe_per_mwh_optimized}/MWh`,                          muted: false },
    { label: "On-Site Renewable", value: `${economics.cfe_metrics.onsite_renewable_share_of_load_pct}%`,      muted: false },
    { label: "Net Value Captured",value: `$${ttp.net_value_captured_millions}M`,                              muted: false },
    { label: "Payback Period",    value: economics.payback_label,                                             muted: true  },
  ];

  const bullets = [
    `${site.name} faces a ${queueYears}-year grid interconnection queue, delaying operations and costing an estimated $${ttp.lost_revenue_per_year_millions}M per year in foregone revenue.`,
    `Our behind-the-meter DER solution delivers power in ${ourMonths} months — ${Math.round(queueYears * 12 - ourMonths)} months faster than the grid path — capturing $${ttp.early_revenue_captured_millions}M in early revenue.`,
    `The optimized portfolio (${data.proposed_portfolio.pv_total.nameplate_mw_dc} MW PV · ${data.proposed_portfolio.bess.energy_capacity_mwh} MWh BESS · ${data.proposed_portfolio.diesel.capacity_mw} MW diesel backup) delivers 3-day grid resilience and a $${economics.resilience.resilience_premium_dollars.toLocaleString()} resilience premium.`,
    `Powered by ${site_context.utility.name} (${site_context.utility.tariff}) with CAISO dynamic pricing, the system generates $${(economics.annual_savings_breakdown.total_opex_savings_thousands / 1000).toFixed(1)}M in annual OPEX savings.`,
    `With a $${economics.capex_total_millions}M investment, Xendee NPV of $${economics.npv_millions_20yr}M, and $${ttp.early_revenue_captured_millions}M early-revenue capture, the net project value is $${ttp.net_value_captured_millions}M — meaning the time-to-power thesis more than offsets the negative energy NPV.`,
  ];

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
    <div className="p-6 max-w-6xl mx-auto pb-16">

      {/* ── Download button (outside print area) ── */}
      <div className="flex justify-end mb-5 no-print">
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
        <div className="bg-[#0d1e35] border-b border-navy-border px-10 py-7 flex justify-between items-center">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-1">DER Portfolio Platform · Proposal</p>
            <h1 className="text-white text-3xl font-bold">{site.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{site.location} · {site_context.utility.name} · {site_context.grid_operator.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Prepared by</p>
            <p className="text-white text-base font-semibold">IES Team</p>
            <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* Hero stat line */}
        <div className="bg-[#0a1628] border-b border-navy-border px-10 py-10 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">Proposal Summary</p>
          <p className="text-5xl font-bold text-white">
            {economics.hero_callouts.primary}{" "}
            <span className="text-gray-600 font-light mx-3">·</span>
            {/* Shortened for one-pager hero — full string lives in hero_callouts.secondary */}
            <span className="text-accent">{economics.hero_callouts.secondary.split(" by ")[0]}</span>
            <span className="text-gray-600 font-light mx-3">·</span>
            {economics.hero_callouts.tertiary}
          </p>
          <p className="text-gray-500 text-sm mt-3">{site.tagline}</p>
        </div>

        {/* Main body: two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-navy-border">

          {/* Left: narrative bullets */}
          <div className="px-10 py-8 space-y-5">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-5">The Case for Acting Now</p>
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-accent font-bold text-base mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-gray-300 text-base leading-relaxed">{b}</p>
              </div>
            ))}
          </div>

          {/* Right: KPI grid */}
          <div className="px-10 py-8">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-5">Key Metrics</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {kpiBoxes.map((k) => (
                <div key={k.label} className={`bg-[#0d1e35] rounded-lg p-4 border border-navy-border${k.muted ? " opacity-50" : ""}`}>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">{k.label}</p>
                  <p className="text-white text-2xl font-bold tabular-nums">{k.value}</p>
                </div>
              ))}
            </div>

            {/* Mini timeline */}
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-5">Time-to-Power</p>
            <div className="space-y-5">
              {/* Grid path */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 text-sm">Traditional Grid Path</span>
                  <span className="text-red-400 text-sm font-semibold">{queueYears} yrs</span>
                </div>
                <div className="relative pb-7">
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
                  <span className="text-gray-500 text-sm">Our BTM DER Path</span>
                  <span className="text-green-400 text-sm font-semibold">{ourMonths} months</span>
                </div>
                <div className="relative pb-7">
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

              {/* Early value callout */}
              <div className="mt-6 rounded-lg bg-green-950/40 border border-green-800/40 px-4 py-3">
                <p className="text-green-300 text-sm font-semibold">
                  ⚡ ${ttp.early_revenue_captured_millions}M captured by deploying {ttp.years_saved} years earlier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0d1e35] border-t border-navy-border px-10 py-4 flex justify-between items-center">
          <p className="text-gray-600 text-xs">Confidential · For client review only</p>
          <p className="text-gray-600 text-xs">Data sourced from Xendee simulation · CAISO · Silicon Valley Power</p>
        </div>
      </div>
    </div>
  );
}
