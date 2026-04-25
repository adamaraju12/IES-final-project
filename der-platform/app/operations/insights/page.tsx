"use client";

import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  LineChart,
  Line,
} from "recharts";

// Shared dark-themed tooltip shell used by all three charts
function ChartTooltip({
  active,
  label,
  children,
}: {
  active?: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  if (!active) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl min-w-[140px]">
      <p className="text-white font-semibold mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function InsightsPage() {
  const data = getSiteData();
  const { insights_30day } = data;

  // ── Chart datasets ──────────────────────────────────────────────────────────
  const costData = insights_30day.weekly_cost_actual.map((cost, i) => ({
    week: `Week ${i + 1}`,
    cost,
    savings: insights_30day.weekly_savings[i],
  }));

  const co2Data = insights_30day.weekly_co2_intensity.map((intensity, i) => ({
    week: `Week ${i + 1}`,
    intensity,
  }));

  const cfeData = insights_30day.monthly_cfe_match.map((cfe, i) => ({
    month: `Month ${i + 1}`,
    cfe,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-16">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-gray-400 text-sm mt-1">
          30-day performance and sustainability analytics
        </p>
      </div>

      {/* ── Executive Summary KPIs ── */}
      <section>
        <SectionHeader
          title="Executive Summary"
          subtitle="30-day performance metrics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPITile
            label="Total Energy Cost"
            value={`$${insights_30day.total_energy_cost_thousands}K`}
            context="Last 30 days"
          />
          <KPITile
            label="Cost Savings"
            value={`$${insights_30day.cost_savings_thousands}K`}
            context={`${insights_30day.cost_savings_vs_baseline_pct}% vs baseline`}
            highlight
          />
          <KPITile
            label="Average PUE"
            value={insights_30day.average_pue}
            context={`↓ ${Math.abs(insights_30day.pue_change_vs_last_period)} vs last period`}
            highlight
          />
          <KPITile
            label="Carbon Avoided"
            value={insights_30day.carbon_avoided_tons}
            unit="t CO₂"
            context={`Equivalent to ${(insights_30day.carbon_equivalent_miles / 1000).toFixed(0)}K miles`}
          />
          <KPITile
            label="Solar Contribution"
            value={insights_30day.solar_contribution_pct}
            unit="%"
            context={`${insights_30day.solar_generated_mwh.toLocaleString()} MWh generated`}
          />
          <KPITile
            label="Cooling Savings"
            value={`$${insights_30day.cooling_savings_thousands}K`}
            context="Last 30 days"
          />
          <KPITile
            label="GPU Load Shifted"
            value={insights_30day.gpu_load_shifted_mwh}
            unit="MWh"
            context="Moved to off-peak/solar hours"
            highlight
          />
        </div>
      </section>

      {/* ── Side-by-side bar charts ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cost & Savings */}
        <div>
          <SectionHeader
            title="Cost & Savings Over Time"
            subtitle="Weekly energy cost with savings captured"
          />
          <div className="bg-navy-card rounded-lg border border-navy-border p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={costData}
                margin={{ top: 4, right: 108, left: 0, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                />
                <YAxis
                  type="category"
                  dataKey="week"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  content={(props: any) => {
                    const row = costData.find((d) => d.week === props.label);
                    return (
                      <ChartTooltip active={props.active} label={props.label}>
                        <p style={{ color: "#00d4ff" }}>
                          Cost: ${((row?.cost ?? 0) / 1000).toFixed(0)}K
                        </p>
                        <p style={{ color: "#4ade80" }}>
                          Saved: ${((row?.savings ?? 0) / 1000).toFixed(0)}K
                        </p>
                      </ChartTooltip>
                    );
                  }}
                />
                <Bar
                  dataKey="cost"
                  fill="#00d4ff"
                  fillOpacity={0.75}
                  radius={[0, 4, 4, 0]}
                >
                  {/* "Saved $XK" label to the right of each bar */}
                  <LabelList
                    dataKey="savings"
                    content={(props: any) => {
                      const x = Number(props.x) || 0;
                      const y = Number(props.y) || 0;
                      const width = Number(props.width) || 0;
                      const height = Number(props.height) || 0;
                      const value = Number(props.value) || 0;
                      return (
                        <text
                          x={x + width + 8}
                          y={y + height / 2}
                          fill="#4ade80"
                          fontSize={11}
                          fontWeight={500}
                          dominantBaseline="middle"
                        >
                          Saved ${(value / 1000).toFixed(0)}K
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CO2 Emissions */}
        <div>
          <SectionHeader
            title="CO₂ Emissions Over Time"
            subtitle={`Weekly grid carbon intensity — target ${insights_30day.co2_target} g/kWh`}
          />
          <div className="bg-navy-card rounded-lg border border-navy-border p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={co2Data}
                margin={{ top: 4, right: 112, left: 0, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 360]}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="week"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  content={(props: any) => (
                    <ChartTooltip active={props.active} label={props.label}>
                      <p style={{ color: "#4ade80" }}>
                        {props.payload?.[0]?.value} g CO₂/kWh
                      </p>
                      <p style={{ color: "#6b7280" }}>
                        Target: {insights_30day.co2_target} g/kWh
                      </p>
                    </ChartTooltip>
                  )}
                />
                {/* Dashed vertical reference line at target */}
                <ReferenceLine
                  x={insights_30day.co2_target}
                  stroke="#6b7280"
                  strokeDasharray="4 3"
                  label={{
                    value: `${insights_30day.co2_target}`,
                    position: "top",
                    fill: "#9ca3af",
                    fontSize: 10,
                  }}
                />
                <Bar
                  dataKey="intensity"
                  fill="#4ade80"
                  fillOpacity={0.75}
                  radius={[0, 4, 4, 0]}
                >
                  {/* "✓ Below target" label to the right of each bar */}
                  <LabelList
                    dataKey="intensity"
                    content={(props: any) => {
                      const x = Number(props.x) || 0;
                      const y = Number(props.y) || 0;
                      const width = Number(props.width) || 0;
                      const height = Number(props.height) || 0;
                      return (
                        <text
                          x={x + width + 8}
                          y={y + height / 2}
                          fill="#4ade80"
                          fontSize={11}
                          fontWeight={500}
                          dominantBaseline="middle"
                        >
                          ✓ Below target
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── 24/7 CFE Match Trend (full width) ── */}
      <section>
        <SectionHeader
          title="24/7 CFE Match Trend"
          subtitle="Monthly clean energy matching percentage — 6-month rolling window"
        />
        <div className="bg-navy-card rounded-lg border border-navy-border p-4 pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={cfeData}
              margin={{ top: 8, right: 80, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#1e3a5f" }}
              />
              <YAxis
                domain={[55, 85]}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
                width={42}
              />
              <Tooltip
                content={(props: any) => (
                  <ChartTooltip active={props.active} label={props.label}>
                    <p style={{ color: "#00d4ff" }}>
                      CFE Match: {props.payload?.[0]?.value}%
                    </p>
                  </ChartTooltip>
                )}
              />
              {/* Dashed reference line at 80% target */}
              <ReferenceLine
                y={80}
                stroke="#6b7280"
                strokeDasharray="5 3"
                label={{
                  value: "Target 80%",
                  position: "right",
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="cfe"
                stroke="#00d4ff"
                strokeWidth={2.5}
                dot={{ fill: "#00d4ff", r: 5, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#00d4ff", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
