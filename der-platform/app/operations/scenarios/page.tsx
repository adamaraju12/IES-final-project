"use client";

import { useState } from "react";
import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PlayCircle, FlaskConical, ChevronDown, Check } from "lucide-react";

// ── Reusable form primitives ────────────────────────────────────────────────

const labelCls =
  "text-gray-400 text-xs uppercase tracking-wider font-medium block mb-1.5";

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-navy-light border border-navy-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 cursor-pointer group text-left w-full"
    >
      <div
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
          checked
            ? "bg-accent border-accent"
            : "bg-transparent border-navy-border group-hover:border-gray-400"
        )}
      >
        {checked && <Check className="w-2.5 h-2.5 text-navy" strokeWidth={3} />}
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </button>
  );
}

// ── Comparison tooltip ─────────────────────────────────────────────────────

function ComparisonTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-white font-semibold mb-2">{row?.metric}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-6 py-0.5">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="text-white font-medium tabular-nums">
            {entry.name === "Base Case" ? row?.baseActual : row?.scenarioActual}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ScenariosPage() {
  const data = getSiteData();
  const { scenarios } = data;

  const [hasRun, setHasRun] = useState(false);
  const [name, setName] = useState("Custom Scenario");
  const [priceProfile, setPriceProfile] = useState("base");
  const [loadProfile, setLoadProfile] = useState("normal");
  const [pvAvail, setPvAvail] = useState("sunny");
  const [batteryCycling, setBatteryCycling] = useState("medium");
  const [coolingFlex, setCoolingFlex] = useState("medium");
  const [allowGpuShift, setAllowGpuShift] = useState(true);
  const [allowCoolingCurtail, setAllowCoolingCurtail] = useState(true);

  const base = scenarios.base_case;

  // Compute result from form inputs
  const BASE_COST = 173100;
  const BASE_CO2 = 339;
  const BASE_CYCLES = 0;

  let costMult = 1.0;
  let co2Mult = 1.0;
  let cyclesMult = 1.0;

  if (priceProfile === "high") costMult *= 1.25;
  else if (priceProfile === "low") costMult *= 0.85;
  else if (priceProfile === "volatile") { costMult *= 1.10; cyclesMult *= 1.5; }

  if (loadProfile === "peak") costMult *= 1.20;
  else if (loadProfile === "light") costMult *= 0.80;

  if (pvAvail === "sunny") { costMult *= 0.90; co2Mult *= 0.85; }
  else if (pvAvail === "cloudy") { costMult *= 1.10; co2Mult *= 1.10; }

  if (batteryCycling === "conservative") cyclesMult *= 0.7;
  else if (batteryCycling === "aggressive") { cyclesMult *= 1.6; costMult *= 0.92; }

  let coolingMwh = 0;
  if (coolingFlex === "medium") coolingMwh = 4.5;
  else if (coolingFlex === "high") { coolingMwh = 7.0; costMult *= 0.95; }

  if (allowGpuShift) costMult *= 0.90;

  const computedCost = Math.round((BASE_COST * costMult) / 100) * 100;
  const computedCo2 = Math.round(BASE_CO2 * co2Mult);
  const computedCycles = Math.round(BASE_CYCLES * cyclesMult * 10) / 10;
  const computedSavingsPct = parseFloat(((BASE_COST - computedCost) / BASE_COST * 100).toFixed(1));

  const result = {
    total_cost_per_day: computedCost,
    co2_intensity_gco2_per_kwh: computedCo2,
    battery_cycles: computedCycles,
    gpu_load_shifted_mwh: allowGpuShift ? 28 : 0,
    cooling_curtailed_mwh: allowCoolingCurtail ? coolingMwh : 0,
    savings_vs_base_pct: computedSavingsPct,
  };

  // Normalize each metric to 0-100 so mixed-unit metrics are visually comparable;
  // actual values are stored in *Actual fields for tooltip display.
  const comparisonData = [
    {
      metric: "Daily Cost",
      "Base Case": Math.round((base.total_cost_per_day / 20000) * 100),
      Scenario: Math.round((result.total_cost_per_day / 20000) * 100),
      baseActual: `$${(base.total_cost_per_day / 1000).toFixed(1)}K`,
      scenarioActual: `$${(result.total_cost_per_day / 1000).toFixed(1)}K`,
    },
    {
      metric: "CO₂ Intensity",
      "Base Case": Math.round((base.co2_intensity_gco2_per_kwh / 350) * 100),
      Scenario: Math.round((result.co2_intensity_gco2_per_kwh / 350) * 100),
      baseActual: `${base.co2_intensity_gco2_per_kwh} g/kWh`,
      scenarioActual: `${result.co2_intensity_gco2_per_kwh} g/kWh`,
    },
    {
      metric: "Battery Cycles",
      "Base Case": Math.round((base.battery_cycles / 2.5) * 100),
      Scenario: Math.round((result.battery_cycles / 2.5) * 100),
      baseActual: `${base.battery_cycles}×`,
      scenarioActual: `${result.battery_cycles}×`,
    },
    {
      metric: "GPU Shifted",
      "Base Case": 0,
      Scenario: Math.round((result.gpu_load_shifted_mwh / 35) * 100),
      baseActual: "0 MWh",
      scenarioActual: `${result.gpu_load_shifted_mwh} MWh`,
    },
  ];

  const dailySavings = base.total_cost_per_day - result.total_cost_per_day;
  const co2Reduction = base.co2_intensity_gco2_per_kwh - result.co2_intensity_gco2_per_kwh;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-16">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Scenario Studio</h1>
        <p className="text-gray-400 text-sm mt-1">
          Model operational decisions · Compare dispatch strategies
        </p>
      </div>

      {/* ── Two-column: form left, results right ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

        {/* LEFT: Inputs (2/5 width) */}
        <div className="xl:col-span-2">
          <div className="bg-navy-card rounded-lg border border-navy-border p-5">
            <SectionHeader
              title="Scenario Inputs"
              subtitle="Configure operating conditions and constraints"
            />
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); setHasRun(true); }}
            >
              {/* Scenario name */}
              <div>
                <label className={labelCls}>Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Custom Scenario"
                  className="w-full bg-navy-light border border-navy-border rounded-md px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <SelectField
                label="Electricity Price Profile"
                value={priceProfile}
                onChange={setPriceProfile}
                options={[
                  { value: "base", label: "Base Case" },
                  { value: "high", label: "High Prices" },
                  { value: "low", label: "Low Prices" },
                  { value: "volatile", label: "Volatile / Duck Curve" },
                ]}
              />
              <SelectField
                label="Load Profile"
                value={loadProfile}
                onChange={setLoadProfile}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "peak", label: "Peak Demand" },
                  { value: "light", label: "Light Load" },
                ]}
              />
              <SelectField
                label="PV Availability"
                value={pvAvail}
                onChange={setPvAvail}
                options={[
                  { value: "sunny", label: "Sunny" },
                  { value: "partly", label: "Partly Cloudy" },
                  { value: "cloudy", label: "Cloudy" },
                ]}
              />
              <SelectField
                label="Battery Cycling"
                value={batteryCycling}
                onChange={setBatteryCycling}
                options={[
                  { value: "conservative", label: "Conservative" },
                  { value: "medium", label: "Medium" },
                  { value: "aggressive", label: "Aggressive" },
                ]}
              />
              <SelectField
                label="Cooling Flexibility"
                value={coolingFlex}
                onChange={setCoolingFlex}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                <CheckboxField
                  label="Allow shifting flexible GPU loads"
                  checked={allowGpuShift}
                  onChange={setAllowGpuShift}
                />
                <CheckboxField
                  label="Allow cooling curtailment"
                  checked={allowCoolingCurtail}
                  onChange={setAllowCoolingCurtail}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-navy font-bold py-2.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <PlayCircle className="w-4 h-4" />
                Run Scenario
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Results (3/5 width) */}
        <div className="xl:col-span-3">
          {!hasRun ? (
            /* Placeholder */
            <div className="bg-navy-card rounded-lg border border-navy-border p-12 flex flex-col items-center justify-center text-center min-h-[520px]">
              <div className="bg-navy-light border border-navy-border rounded-full p-5 mb-5">
                <FlaskConical className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-300 font-semibold">No results yet</p>
              <p className="text-gray-500 text-sm mt-2 max-w-xs leading-relaxed">
                Configure the inputs on the left and click{" "}
                <span className="text-accent font-medium">Run Scenario</span> to
                see modeled results here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <SectionHeader
                title={`Scenario Results: ${name || "Custom Scenario"}`}
                subtitle="Modeled outcome for configured operating conditions"
              />

              {/* KPI tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <KPITile
                  label="Total Daily Cost"
                  value={`$${(result.total_cost_per_day / 1000).toFixed(1)}K`}
                  context={`Base: $${(base.total_cost_per_day / 1000).toFixed(1)}K`}
                  highlight
                />
                <KPITile
                  label="CO₂ Intensity"
                  value={result.co2_intensity_gco2_per_kwh}
                  unit="g/kWh"
                  context={`Base: ${base.co2_intensity_gco2_per_kwh} g/kWh`}
                />
                <KPITile
                  label="Battery Cycles"
                  value={result.battery_cycles}
                  unit="×"
                  context={`Base: ${base.battery_cycles}×`}
                />
                <KPITile
                  label="GPU Load Shifted"
                  value={result.gpu_load_shifted_mwh}
                  unit="MWh"
                  context="vs 0 MWh in base case"
                  highlight
                />
                <KPITile
                  label="Cooling Curtailed"
                  value={result.cooling_curtailed_mwh}
                  unit="MWh"
                  context="vs 0 MWh in base case"
                />
              </div>

              {/* Comparison bar chart */}
              <div className="bg-navy-card rounded-lg border border-navy-border p-5">
                <p className="text-accent text-sm font-semibold mb-1">
                  Comparison vs Base Case
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Bars normalized per metric — hover for actual values
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    layout="vertical"
                    data={comparisonData}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    barCategoryGap="28%"
                    barGap={3}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      hide
                    />
                    <YAxis
                      type="category"
                      dataKey="metric"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip content={<ComparisonTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#9ca3af", paddingTop: 8 }}
                    />
                    <Bar dataKey="Base Case" fill="#475569" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="Scenario" fill="#00d4ff" fillOpacity={0.85} radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Green savings callout */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                <div className="text-green-400 text-lg font-bold mt-0.5 flex-shrink-0">✓</div>
                <div>
                  <p className="text-green-300 font-semibold text-sm">
                    {result.savings_vs_base_pct}% savings vs base case
                  </p>
                  <p className="text-green-400/80 text-xs mt-1">
                    ${dailySavings.toLocaleString()} saved per day ·{" "}
                    {co2Reduction} g/kWh CO₂ intensity reduction
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Saved Scenarios (full width) ── */}
      <section>
        <SectionHeader
          title="Saved Scenarios"
          subtitle="Compare alternative operating strategies"
        />
        <div className="bg-navy-card border border-navy-border rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Why scenario savings are modest.</strong>{" "}
            SVP energy rates ($0.17/kWh) are among California{"'"}s lowest. Even aggressive operational
            flexibility — GPU shifting, battery cycling, demand response — yields 2–3% OPEX savings.
            The investment case for behind-the-meter DERs at this site rests on time-to-power and
            resilience, not on energy arbitrage. See the Business Case page for the full thesis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(scenarios).filter(([key]) => !key.startsWith('_')).map(([, scenario]) => {
            const isRecommended = scenario === scenarios.high_flex;
            return (
              <div
                key={scenario.name}
                className={cn(
                  "bg-navy-card rounded-lg border p-5 space-y-4",
                  isRecommended ? "border-accent/60" : "border-navy-border"
                )}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      isRecommended ? "text-accent" : "text-white"
                    )}
                  >
                    {scenario.name}
                  </p>
                  {isRecommended && (
                    <span className="text-xs bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  {[
                    {
                      label: "Daily Cost",
                      value: `$${(scenario.total_cost_per_day / 1000).toFixed(1)}K`,
                    },
                    {
                      label: "CO₂ Intensity",
                      value: `${scenario.co2_intensity_gco2_per_kwh} g/kWh`,
                    },
                    {
                      label: "Battery Cycles",
                      value: `${scenario.battery_cycles}×`,
                    },
                    {
                      label: "GPU Shifted",
                      value: `${scenario.gpu_load_shifted_mwh} MWh`,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-400 text-xs">{row.label}</span>
                      <span className="text-white text-xs font-medium tabular-nums">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Savings vs base (if applicable) */}
                {"savings_vs_base_pct" in scenario &&
                  scenario.savings_vs_base_pct != null && (
                    <div className="pt-2 border-t border-navy-border">
                      <p className="text-green-400 text-xs font-medium">
                        ↓ {scenario.savings_vs_base_pct}% vs base case
                      </p>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
