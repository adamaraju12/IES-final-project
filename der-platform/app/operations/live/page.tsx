"use client";

import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { AssetCard } from "@/components/AssetCard";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MessageCircle } from "lucide-react";

const GPU_COLUMNS = [
  { key: "id", label: "Cluster" },
  { key: "location", label: "Location" },
  { key: "role", label: "Role" },
  { key: "power", label: "Power" },
  { key: "utilization", label: "Util %" },
  { key: "flexibility", label: "Flexibility" },
];

function flexBadgeColor(flex: string): "green" | "yellow" | "red" {
  if (flex === "High") return "green";
  if (flex === "Medium") return "yellow";
  return "red";
}

function DispatchTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-6 py-0.5">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="text-white font-medium tabular-nums">
            {entry.value} MW
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LiveOperationsPage() {
  const data = getSiteData();
  const { live_operations, dispatch_24h, gpu_clusters, cooling_zones } = data;

  // Build chart data — battery clamped to 0 when charging (negative);
  // excess stack above Load line during charging hours is intentional (shows battery absorbing solar)
  const chartData = dispatch_24h.hours.map((hour, i) => ({
    hour: `${String(hour).padStart(2, "00")}:00`,
    Grid: dispatch_24h.grid[i],
    Diesel: dispatch_24h.diesel[i],
    Battery: Math.max(0, dispatch_24h.bess[i]),
    PV: dispatch_24h.pv[i],
    Load: dispatch_24h.load[i],
  }));

  const gpuRows = gpu_clusters.map((c) => ({
    id: (
      <span className="font-semibold text-white text-sm">
        {c.id}
      </span>
    ),
    location: <span className="text-gray-300 text-xs">{c.location}</span>,
    role: c.role,
    power: `${c.power_mw} MW`,
    utilization: (
      <span
        className={
          c.utilization_pct > 85
            ? "text-green-400 font-medium"
            : c.utilization_pct >= 75
              ? "text-yellow-400 font-medium"
              : "text-gray-400 font-medium"
        }
      >
        {c.utilization_pct}%
      </span>
    ),
    flexibility: (
      <StatusBadge
        text={c.flexibility}
        color={flexBadgeColor(c.flexibility)}
      />
    ),
  }));

  const totalCurtailmentMw = cooling_zones
    .reduce((sum, z) => sum + z.max_curtailment_mw, 0)
    .toFixed(1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Live Operations</h1>
        <p className="text-gray-400 text-sm mt-1">
          Real-time dispatch · Optimization recommendations
        </p>
      </div>

      {/* ── Today's Recommendations ── */}
      <section>
        <SectionHeader
          title="Today's Optimization Recommendations"
          subtitle="AI-generated dispatch and scheduling actions — updated every 15 minutes"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {live_operations.recommendations.map((rec, i) => (
            <RecommendationCard key={i} {...rec} />
          ))}
        </div>
      </section>

      {/* ── Live KPI tiles ── */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPITile
          label="Total Load"
          value={(live_operations.current_total_load_kw / 1000).toFixed(1)}
          unit="MW"
          context="Current facility draw"
        />
        <KPITile
          label="Net Grid Import"
          value={(live_operations.net_grid_import_kw / 1000).toFixed(1)}
          unit="MW"
          context="From Silicon Valley Power"
        />
        <KPITile
          label="Battery SoC"
          value={live_operations.battery_soc_pct}
          unit="%"
          context={`Charging at ${(live_operations.battery_charging_rate_kw / 1000).toFixed(1)} MW`}
          highlight
        />
        <KPITile
          label="CO₂ Intensity"
          value={live_operations.co2_intensity_gco2_per_kwh}
          unit="g/kWh"
          context="Current grid carbon"
        />
        <KPITile
          label="Cooling Flex"
          value={(live_operations.cooling_flex_capacity_kw / 1000).toFixed(1)}
          unit="MW"
          context="Available curtailment"
        />
      </section>

      {/* ── 24-Hour Dispatch Chart ── */}
      <section>
        <SectionHeader
          title="24-Hour Dispatch"
          subtitle="Generation mix and load profile — battery charging periods appear as stack above the load line"
        />
        <div className="bg-navy-card rounded-lg border border-navy-border p-4 pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData}
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#1e3a5f" }}
                interval={3}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit=" MW"
                width={52}
              />
              <Tooltip content={<DispatchTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: 16,
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              />
              {/* Stacked areas — bottom to top */}
              <Area
                type="monotone"
                dataKey="Grid"
                stackId="dispatch"
                stroke="#64748b"
                fill="#475569"
                fillOpacity={0.85}
              />
              <Area
                type="monotone"
                dataKey="Diesel"
                stackId="dispatch"
                stroke="#c4b5fd"
                fill="#7c3aed"
                fillOpacity={0.85}
              />
              <Area
                type="monotone"
                dataKey="Battery"
                stackId="dispatch"
                stroke="#22d3ee"
                fill="#0891b2"
                fillOpacity={0.85}
              />
              {/* PV: stroke and fill both use amber-yellow so legend swatch matches area */}
              <Area
                type="monotone"
                dataKey="PV"
                stackId="dispatch"
                stroke="#fbbf24"
                fill="#fbbf24"
                fillOpacity={0.85}
              />
              {/* Load as white line on top */}
              <Line
                type="monotone"
                dataKey="Load"
                stroke="#ffffff"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#fff", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── GPU Cluster Status + Cooling System Status ── */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* GPU Cluster Status */}
        <div className="xl:col-span-3">
          <SectionHeader
            title="GPU Cluster Status"
            subtitle={`${gpu_clusters.length} clusters · ${gpu_clusters.reduce((s, c) => s + c.power_mw, 0)} MW total GPU load`}
          />
          <DataTable columns={GPU_COLUMNS} rows={gpuRows} />
        </div>

        {/* Cooling System Status */}
        <div className="xl:col-span-2">
          <SectionHeader
            title="Cooling System Status"
            subtitle={`${totalCurtailmentMw} MW total curtailment available`}
          />
          <div className="space-y-3">
            {cooling_zones.map((zone) => {
              const loadFactor = zone.current_load_mw / zone.cooling_capacity_mw;
              return (
                <AssetCard
                  key={zone.id}
                  title={zone.id}
                  status={loadFactor > 0.9 ? "warning" : "good"}
                  rows={[
                    {
                      label: "Current Load",
                      value: `${zone.current_load_mw} MW`,
                    },
                    {
                      label: "Capacity",
                      value: `${zone.cooling_capacity_mw} MW`,
                    },
                    {
                      label: "Load Factor",
                      value: `${Math.round(loadFactor * 100)}%`,
                    },
                    {
                      label: "Max Curtailment",
                      value: `${zone.max_curtailment_mw} MW · ${zone.curtailment_duration_min} min`,
                    },
                    { label: "Flexibility", value: zone.flexibility },
                  ]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Floating chat button ── */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-navy shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-40 no-print"
        title="Chat with DER AI (coming soon)"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
