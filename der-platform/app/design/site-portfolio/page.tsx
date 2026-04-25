import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";

export default function SitePortfolioPage() {
  const data = getSiteData();
  const { site } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{site.name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {site.location} · {site.tagline}
        </p>
      </div>

      {/* KPI row — placeholder with live data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          label="Peak Load"
          value={site.peak_load_mw}
          unit="MW"
          context="IT + cooling overhead"
        />
        <KPITile
          label="Annual Consumption"
          value={site.annual_consumption_gwh}
          unit="GWh"
          context={`Load factor ${site.load_factor}`}
        />
        <KPITile
          label="Grid Queue Wait"
          value={site.interconnection_queue_years}
          unit="yrs"
          context="Traditional interconnection path"
        />
        <KPITile
          label="Our Time-to-Power"
          value={site.our_time_to_power_months}
          unit="mo"
          context="Behind-the-meter DER path"
          highlight
        />
      </div>

      <div className="bg-navy-card border border-navy-border rounded-lg p-8 text-center">
        <SectionHeader title="Site & Portfolio" subtitle="Full page coming next — data wired up, components ready." />
        <p className="text-gray-500 text-sm">
          This page will show the 24-hour load profile, site context cards, GPU cluster table,
          cooling zones, portfolio asset cards, and alternative portfolio comparison.
        </p>
      </div>
    </div>
  );
}
