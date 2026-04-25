import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

export default function ScenariosPage() {
  const data = getSiteData();
  const { scenarios } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Scenario Studio</h1>
        <p className="text-gray-400 text-sm mt-1">
          Model operational decisions · Compare dispatch strategies
        </p>
      </div>

      {/* Preview of base case */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(scenarios).map((scenario) => (
          <div
            key={scenario.name}
            className="bg-navy-card border border-navy-border rounded-lg p-4"
          >
            <p className="text-accent text-sm font-semibold">{scenario.name}</p>
            <p className="text-white text-2xl font-bold mt-1">
              ${scenario.total_cost_per_day.toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs mt-1">Daily cost</p>
          </div>
        ))}
      </div>

      <div className="bg-navy-card border border-navy-border rounded-lg p-8 text-center">
        <SectionHeader title="Scenario Studio" subtitle="Interactive form + results panel — coming after Live Operations." />
        <p className="text-gray-500 text-sm">
          This page will have a scenario configuration form on the left and live-updating
          results with comparison charts on the right, plus saved scenario comparison.
        </p>
      </div>
    </div>
  );
}
