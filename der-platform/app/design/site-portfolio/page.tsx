"use client";

import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";
import { AssetCard } from "@/components/AssetCard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function LoadTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-1">{`Hour ${label}`}</p>
      <p className="text-accent font-semibold">{payload[0].value} MW</p>
    </div>
  );
}

function flexBadgeColor(flex: string): "green" | "yellow" | "gray" {
  if (flex === "High") return "green";
  if (flex === "Medium") return "yellow";
  return "gray";
}

const GPU_COLUMNS = [
  { key: "id", label: "Cluster ID" },
  { key: "location", label: "Location" },
  { key: "role", label: "Role" },
  { key: "power", label: "Power (MW)" },
  { key: "utilization", label: "Utilization %" },
  { key: "flexibility", label: "Flexibility" },
];

export default function SitePortfolioPage() {
  const data = getSiteData();
  const { site, site_context, load_profile_24h_mw, gpu_clusters, cooling_zones, proposed_portfolio, alternative_portfolios } = data;

  // Build chart data
  const loadChartData = load_profile_24h_mw.map((mw, i) => ({ hour: i, mw }));

  // Build GPU table rows
  const gpuRows = gpu_clusters.map((c) => ({
    id: <span className="font-semibold text-white text-sm">{c.id}</span>,
    location: <span className="text-gray-300 text-xs">{c.location}</span>,
    role: c.role,
    power: `${c.power_mw} MW`,
    utilization: (
      <span className={c.utilization_pct >= 85 ? "text-green-400 font-medium" : c.utilization_pct >= 75 ? "text-yellow-400 font-medium" : "text-gray-400 font-medium"}>
        {c.utilization_pct}%
      </span>
    ),
    flexibility: <StatusBadge text={c.flexibility} color={flexBadgeColor(c.flexibility)} />,
  }));

  const pp = proposed_portfolio;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-16">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">{site.name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {site.location} · {site.tagline}
        </p>
      </div>

      {/* ── KPI tiles ── */}
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

      {/* ── Load profile + Site context ── */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Load profile chart (60%) */}
        <div className="xl:col-span-3">
          <SectionHeader title="24-Hour Load Profile" subtitle="Typical weekday facility draw — IT + cooling" />
          <div className="bg-navy-card rounded-lg border border-navy-border p-4 pt-6">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={loadChartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1e3a5f" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#1e3a5f" }}
                  tickFormatter={(v) => `${v}:00`}
                  interval={3}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" MW"
                  domain={[30, 52]}
                  width={52}
                />
                <Tooltip content={<LoadTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mw"
                  stroke="#00d4ff"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#00d4ff", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site context cards (40%) */}
        <div className="xl:col-span-2">
          <SectionHeader title="Site Context" subtitle="Grid, utility, solar, and climate summary" />
          <div className="space-y-3">
            {/* Grid Operator */}
            <div className="bg-navy-card rounded-lg border border-navy-border p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Grid Operator</p>
              <p className="text-white font-semibold text-sm">{site_context.grid_operator.name}</p>
              <p className="text-gray-400 text-xs mt-1">Avg LMP ${site_context.grid_operator.lmp_avg_per_mwh}/MWh</p>
              <p className="text-gray-500 text-xs mt-1">{site_context.grid_operator.note}</p>
            </div>
            {/* Utility */}
            <div className="bg-navy-card rounded-lg border border-navy-border p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Utility</p>
              <p className="text-white font-semibold text-sm">{site_context.utility.name}</p>
              <p className="text-gray-400 text-xs mt-1">Tariff: {site_context.utility.tariff}</p>
              <p className="text-gray-500 text-xs mt-1">{site_context.utility.current_constraints}</p>
            </div>
            {/* Solar Resource */}
            <div className="bg-navy-card rounded-lg border border-navy-border p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Solar Resource</p>
              <p className="text-white font-semibold text-sm">{site_context.solar_resource.ghi_kwh_per_m2_per_day} kWh/m²/day GHI</p>
              <p className="text-gray-400 text-xs mt-1">{site_context.solar_resource.peak_sun_hours_per_year} peak sun hours/year</p>
              <p className="text-gray-500 text-xs mt-1">{site_context.solar_resource.note}</p>
            </div>
            {/* Climate */}
            <div className="bg-navy-card rounded-lg border border-navy-border p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Climate</p>
              <p className="text-white font-semibold text-sm">{site_context.climate.free_cooling_months_per_year} months/yr free cooling</p>
              <p className="text-gray-400 text-xs mt-1">HDD {site_context.climate.heating_degree_days} · CDD {site_context.climate.cooling_degree_days}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compute Load Breakdown ── */}
      <section>
        <SectionHeader
          title="Compute Load Breakdown"
          subtitle={`Five GPU clusters · ${gpu_clusters.reduce((s, c) => s + c.power_mw, 0)} MW total flexible compute load`}
        />
        <DataTable columns={GPU_COLUMNS} rows={gpuRows} />
      </section>

      {/* ── Cooling Zones ── */}
      <section>
        <SectionHeader
          title="Cooling Zones"
          subtitle={`${cooling_zones.reduce((s, z) => s + z.max_curtailment_mw, 0).toFixed(1)} MW total curtailment potential across 3 halls`}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cooling_zones.map((zone) => (
            <AssetCard
              key={zone.id}
              title={zone.id}
              status="good"
              rows={[
                { label: "Cooling Capacity", value: `${zone.cooling_capacity_mw} MW` },
                { label: "Current Load", value: `${zone.current_load_mw} MW` },
                { label: "Max Curtailment", value: `${zone.max_curtailment_mw} MW` },
                { label: "Curtailment Duration", value: `${zone.curtailment_duration_min} min` },
                { label: "Flexibility", value: zone.flexibility },
              ]}
            />
          ))}
        </div>
      </section>

      {/* ── Proposed Portfolio ── */}
      <section>
        <SectionHeader
          title="Proposed DER Portfolio"
          subtitle="Recommended DER mix · Hybrid configuration"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AssetCard
            title="PV Array"
            status="good"
            rows={[
              { label: "Nameplate (DC)", value: `${pp.pv_array.nameplate_mw_dc} MW` },
              { label: "Nameplate (AC)", value: `${pp.pv_array.nameplate_mw_ac} MW` },
              { label: "Annual Generation", value: `${pp.pv_array.annual_generation_gwh} GWh` },
              { label: "Land Required", value: `${pp.pv_array.land_acres} acres` },
              { label: "Capacity Factor", value: `${pp.pv_array.capacity_factor_pct}%` },
              { label: "Siting", value: pp.pv_array.siting_note },
            ]}
          />
          <AssetCard
            title="Battery Storage (BESS)"
            status="good"
            rows={[
              { label: "Energy Capacity", value: `${pp.bess.energy_capacity_mwh} MWh` },
              { label: "Power Capacity", value: `${pp.bess.power_capacity_mw} MW` },
              { label: "Duration", value: `${pp.bess.duration_hours} hours` },
              { label: "Chemistry", value: pp.bess.chemistry },
              { label: "Round-Trip Eff.", value: `${pp.bess.round_trip_efficiency_pct}%` },
            ]}
          />
          <AssetCard
            title="Diesel Backup"
            status="good"
            rows={[
              { label: "Capacity", value: `${pp.diesel.capacity_mw} MW` },
              { label: "Type", value: pp.diesel.type },
              { label: "Fuel", value: pp.diesel.fuel },
              { label: "Role", value: pp.diesel.role },
              { label: "Capacity Factor", value: `${pp.diesel.annual_capacity_factor_pct}%` },
              { label: "Runtime / Year", value: `${pp.diesel.runtime_hours_per_year} hrs` },
            ]}
          />
          <AssetCard
            title="Grid Interconnection"
            status="good"
            rows={[
              { label: "Size", value: `${pp.grid_interconnection.size_mw} MW` },
              { label: "Role", value: pp.grid_interconnection.role },
              { label: "PPA Structure", value: pp.grid_interconnection.ppa_structure },
            ]}
          />
        </div>
      </section>

      {/* ── Alternative Portfolios ── */}
      <section>
        <SectionHeader
          title="Alternative Portfolios Considered"
          subtitle="Three configurations evaluated — Hybrid selected as optimal"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alternative_portfolios.map((portfolio) => (
            <div
              key={portfolio.name}
              className={cn(
                "bg-navy-card rounded-lg border p-5 space-y-4 relative",
                portfolio.recommended
                  ? "border-accent/60 shadow-[0_0_24px_rgba(0,212,255,0.08)]"
                  : "border-navy-border"
              )}
            >
              {/* Recommended badge */}
              {portfolio.recommended && (
                <span className="absolute top-4 right-4 text-xs bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Recommended
                </span>
              )}

              <p className={cn(
                "font-bold text-base",
                portfolio.recommended ? "text-accent" : "text-white"
              )}>
                {portfolio.name}
              </p>

              <div className="space-y-2">
                {[
                  { label: "PV", value: `${portfolio.pv_mw} MW` },
                  { label: "BESS", value: `${portfolio.bess_mwh} MWh` },
                  { label: "Diesel", value: portfolio.diesel_mw > 0 ? `${portfolio.diesel_mw} MW` : "None" },
                  { label: "CapEx", value: `$${portfolio.capex_millions}M` },
                  { label: "LCOE", value: `$${portfolio.lcoe_per_mwh}/MWh` },
                  { label: "CFE Match", value: `${portfolio.cfe_match_pct}%` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{row.label}</span>
                    <span className={cn(
                      "text-xs font-medium tabular-nums",
                      portfolio.recommended ? "text-white" : "text-gray-300"
                    )}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
