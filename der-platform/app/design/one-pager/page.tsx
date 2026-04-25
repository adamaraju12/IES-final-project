import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

export default function OnePagerPage() {
  const data = getSiteData();
  const { site, economics } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Client One-Pager</h1>
        <p className="text-gray-400 text-sm mt-1">
          Print-ready proposal summary · A4 / Letter
        </p>
      </div>

      {/* Hero stat preview */}
      <div className="bg-navy-card border border-accent/30 rounded-lg p-6 text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">Proposal Summary</p>
        <p className="text-4xl font-bold text-white">
          {site.our_time_to_power_months} months · ${economics.npv_millions_20yr}M NPV · {economics.cfe_match_annual_pct}% CFE
        </p>
        <p className="text-accent text-sm mt-2">{site.name}</p>
      </div>

      <div className="bg-navy-card border border-navy-border rounded-lg p-8 text-center">
        <SectionHeader title="Client One-Pager" subtitle="Print-friendly one-page layout — coming last in build order." />
        <p className="text-gray-500 text-sm">
          This page will render as a single print page with headline stats, narrative bullets,
          KPI grid, a mini timeline chart, and a Download PDF button.
        </p>
      </div>
    </div>
  );
}
