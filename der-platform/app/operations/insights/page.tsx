import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";

export default function InsightsPage() {
  const data = getSiteData();
  const { insights_30day } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-gray-400 text-sm mt-1">
          Last 30 days · Performance trends · Carbon & cost analytics
        </p>
      </div>

      {/* KPI row — placeholder with live data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPITile
          label="Energy Cost"
          value={`$${insights_30day.total_energy_cost_thousands}k`}
          context="Last 30 days"
        />
        <KPITile
          label="Cost Savings"
          value={`$${insights_30day.cost_savings_thousands}k`}
          highlight
          context={`vs. baseline (${insights_30day.cost_savings_vs_baseline_pct}%)`}
        />
        <KPITile
          label="Avg PUE"
          value={insights_30day.average_pue}
          context={`${insights_30day.pue_change_vs_last_period > 0 ? "+" : ""}${insights_30day.pue_change_vs_last_period} vs prior period`}
        />
        <KPITile
          label="Carbon Avoided"
          value={insights_30day.carbon_avoided_tons}
          unit="t"
          context={`≈ ${(insights_30day.carbon_equivalent_miles / 1000).toFixed(0)}k miles`}
        />
        <KPITile
          label="Solar Share"
          value={insights_30day.solar_contribution_pct}
          unit="%"
          context={`${insights_30day.solar_generated_mwh.toLocaleString()} MWh generated`}
        />
        <KPITile
          label="Cooling Savings"
          value={`$${insights_30day.cooling_savings_thousands}k`}
          context="Free cooling + curtailment"
        />
        <KPITile
          label="GPU Load Shifted"
          value={insights_30day.gpu_load_shifted_mwh}
          unit="MWh"
          context="Flexible workload dispatch"
          highlight
        />
      </div>

      <div className="bg-navy-card border border-navy-border rounded-lg p-8 text-center">
        <SectionHeader title="Insights" subtitle="Weekly trend charts + 6-month CFE trend — coming after Scenario Studio." />
        <p className="text-gray-500 text-sm">
          This page will show weekly cost & CO₂ bar charts, a 6-month CFE trend line,
          and additional analytics panels.
        </p>
      </div>
    </div>
  );
}
