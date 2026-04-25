import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";

export default function BusinessCasePage() {
  const data = getSiteData();
  const { economics } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Case</h1>
        <p className="text-gray-400 text-sm mt-1">
          20-year financial analysis · Behind-the-meter DER portfolio
        </p>
      </div>

      {/* Hero KPIs — placeholder with live data */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile
          label="Total CapEx"
          value={`$${economics.capex_total_millions}M`}
          context="PV + BESS + fuel cell + BOS"
        />
        <KPITile
          label="NPV (20 yr)"
          value={`$${economics.npv_millions_20yr}M`}
          highlight
          context={`IRR ${economics.irr_pct}%`}
        />
        <KPITile
          label="LCOE"
          value={`$${economics.lcoe_per_mwh}`}
          unit="/MWh"
          context="Blended cost of energy"
        />
        <KPITile
          label="Payback"
          value={economics.payback_years}
          unit="yrs"
          context="Simple payback period"
        />
        <KPITile
          label="CO₂ Avoided"
          value={(economics.co2_avoided_tons_lifetime / 1000).toFixed(0)}
          unit="kt"
          context="Lifetime tons avoided"
        />
        <KPITile
          label="CFE Match"
          value={economics.cfe_match_annual_pct}
          unit="%"
          context="Annual 24/7 CFE score"
          highlight
        />
      </div>

      <div className="bg-navy-card border border-navy-border rounded-lg p-8 text-center">
        <SectionHeader title="Business Case" subtitle="Full page coming next — charts, timeline, sensitivity analysis." />
        <p className="text-gray-500 text-sm">
          This page will show the time-to-power timeline, dispatch chart, CapEx donut,
          savings bar chart, and interactive sensitivity sliders.
        </p>
      </div>
    </div>
  );
}
