"use client";

import { useState } from "react";
import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { KPITile } from "@/components/KPITile";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

// ── Tooltip helpers ──────────────────────────────────────────────────────────

function DispatchTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-2">{`${label}:00`}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-semibold tabular-nums">{p.value} MW</span>
        </div>
      ))}
    </div>
  );
}

function SavingsTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-accent font-semibold">${payload[0].value}M / yr</p>
    </div>
  );
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-card border border-navy-border rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-accent">${payload[0].value}M</p>
    </div>
  );
}

// ── Sensitivity slider ────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  prefix?: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, prefix = "", onChange }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs uppercase tracking-wider">{label}</span>
        <span className="text-white text-sm font-semibold tabular-nums">
          {prefix}{value}{unit}
        </span>
      </div>
      <div className="relative h-1.5 bg-navy-border rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-gray-600 text-xs">
        <span>{prefix}{min}{unit}</span>
        <span>{prefix}{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BusinessCasePage() {
  const data = getSiteData();
  const { economics, sensitivity_analysis, dispatch_24h, site } = data;
  const sa = sensitivity_analysis;

  // Sensitivity slider state
  const [discountRate, setDiscountRate] = useState(sa.discount_rate.default_pct);
  const [ppaPrice, setPpaPrice] = useState(sa.ppa_price.default_per_mwh);
  const [gasPrice, setGasPrice] = useState(sa.natural_gas_price.default_per_mmbtu);
  const [capacityPayment, setCapacityPayment] = useState(sa.capacity_payment.default_per_mw_day);
  const [bessCapex, setBessCapex] = useState(sa.bess_capex.default_per_kwh);

  // Live NPV calculation from slider deltas
  const baseNPV = economics.npv_millions_20yr;
  const liveNPV = +(
    baseNPV +
    (discountRate - sa.discount_rate.default_pct) * sa.discount_rate.npv_delta_per_pct +
    (ppaPrice - sa.ppa_price.default_per_mwh) * sa.ppa_price.npv_delta_per_dollar +
    (gasPrice - sa.natural_gas_price.default_per_mmbtu) * sa.natural_gas_price.npv_delta_per_dollar +
    (capacityPayment - sa.capacity_payment.default_per_mw_day) * sa.capacity_payment.npv_delta_per_dollar +
    (bessCapex - sa.bess_capex.default_per_kwh) * sa.bess_capex.npv_delta_per_dollar
  ).toFixed(1);

  // Payback approximation: inversely scale with NPV delta
  const npvDelta = Number(liveNPV) - baseNPV;
  const livePayback = Math.max(4, Math.min(15, +(economics.payback_years - npvDelta * 0.08).toFixed(1)));
  // LCOE approximation
  const liveLCOE = Math.max(50, Math.min(110, +(economics.lcoe_per_mwh - npvDelta * 0.3).toFixed(0)));

  // Dispatch chart data
  const dispatchData = dispatch_24h.hours.map((h, i) => ({
    hour: h,
    PV: Math.max(0, dispatch_24h.pv[i]),
    Diesel: dispatch_24h.diesel[i],
    Grid: Math.max(0, dispatch_24h.grid[i]),
    Battery: Math.max(0, dispatch_24h.bess[i]),
    Load: dispatch_24h.load[i],
  }));

  // CapEx donut data
  const capexData = [
    { name: "PV Array", value: economics.capex_breakdown.pv_millions },
    { name: "BESS", value: economics.capex_breakdown.bess_millions },
    { name: "Diesel Backup", value: economics.capex_breakdown.diesel_millions },
    { name: "Balance of System", value: economics.capex_breakdown.balance_of_system_millions },
  ];
  const CAPEX_COLORS = ["#00d4ff", "#7c3aed", "#f59e0b", "#10b981"];

  // Annual savings bar data
  const savingsData = [
    { name: "Energy Cost Avoided", value: economics.annual_savings_breakdown.energy_cost_avoided_millions },
    { name: "Demand Charge Reduction", value: economics.annual_savings_breakdown.demand_charge_reduction_millions },
    { name: "Capacity Market Revenue", value: economics.annual_savings_breakdown.capacity_market_revenue_millions },
    { name: "DR Program Revenue", value: economics.annual_savings_breakdown.dr_program_revenue_millions },
    { name: "CFE Premium", value: economics.annual_savings_breakdown.cfe_premium_millions },
  ];

  // Time-to-power timeline data
  const queueYears = site.interconnection_queue_years;
  const ourMonths = site.our_time_to_power_months;
  const earlyValue = economics.early_deployment_value;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-16">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Business Case</h1>
        <p className="text-gray-400 text-sm mt-1">
          20-year financial analysis · Behind-the-meter DER portfolio
        </p>
      </div>

      {/* ── Hero KPI tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile
          label="Total CapEx"
          value={`$${economics.capex_total_millions}M`}
          context="PV + BESS + diesel + BOS"
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

      {/* ── Resilience callout ── */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <div className="text-blue-400 text-lg mt-0.5 flex-shrink-0">🛡</div>
        <div>
          <p className="text-blue-300 font-semibold text-sm">
            Resilience: ~36 hours of islanding capability
          </p>
          <p className="text-blue-400/70 text-xs mt-1">
            12 MW diesel backup (200 hrs/yr) + 100 MWh BESS provides full-load islanding for 24–48 hours; longer under partial load curtailment
          </p>
        </div>
      </div>

      {/* ── Time-to-Power Timeline ── */}
      <section>
        <SectionHeader
          title="Time-to-Power Timeline"
          subtitle="Grid interconnection queue vs. our behind-the-meter path"
        />
        <div className="bg-navy-card rounded-lg border border-navy-border p-6 space-y-5">

          {/* Grid path */}
          <div className="space-y-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">Traditional Grid Path</span>
              <span className="text-xs text-red-400 font-semibold">{queueYears} years ({queueYears * 12} months)</span>
            </div>
            {/* Bar + dots in one relative container */}
            <div className="relative">
              {/* Thin bar */}
              <div className="h-1.5 bg-red-900/60 rounded-full border border-red-700/50 mx-2" />
              {/* Dots sitting on the bar */}
              {[
                { label: "Queue Entry", pct: 0 },
                { label: "Study Complete", pct: 40 },
                { label: "Agreement Signed", pct: 70 },
                { label: "Energized", pct: 100 },
              ].map((m) => (
                <div
                  key={m.label}
                  className="absolute flex flex-col items-center"
                  style={{
                    top: "-7px",
                    left: m.pct === 0 ? "8px" : m.pct === 100 ? "calc(100% - 8px)" : `${m.pct}%`,
                    transform: m.pct === 0 ? "translateX(0)" : m.pct === 100 ? "translateX(-100%)" : "translateX(-50%)",
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-200 shadow-lg shadow-red-900/50" />
                  <span className="text-red-300 text-xs font-medium mt-2 whitespace-nowrap">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer for labels */}
          <div className="h-8" />

          {/* Our path */}
          <div className="space-y-0 mt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">Our BTM DER Path</span>
              <span className="text-xs text-green-400 font-semibold">{ourMonths} months</span>
            </div>
            <div className="relative">
              {/* Background full bar */}
              <div className="h-1.5 bg-gray-800 rounded-full mx-2" />
              {/* Filled portion */}
              <div
                className="absolute top-0 left-2 h-1.5 bg-green-500 rounded-full"
                style={{ width: `calc(${(ourMonths / (queueYears * 12)) * 100}% - 8px)` }}
              />
              {/* Dots + labels */}
              {[
                { label: "Contract Signed", pct: 0 },
                { label: "Permits", pct: 25 },
                { label: "Energized ✓", pct: (ourMonths / (queueYears * 12)) * 100 },
              ].map((m) => (
                <div
                  key={m.label}
                  className="absolute flex flex-col items-center"
                  style={{
                    top: "-7px",
                    left: m.pct === 0 ? "8px" : `calc(${m.pct}% - 0px)`,
                    transform: m.pct === 0 ? "translateX(0)" : m.pct >= 80 ? "translateX(-100%)" : "translateX(-50%)",
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-200 shadow-lg shadow-green-900/50" />
                  <span className="text-green-300 text-xs font-medium mt-2 whitespace-nowrap">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer for labels */}
          <div className="h-8" />

          {/* Early deployment callout */}
          <div className="mt-2 rounded-lg bg-green-950/40 border border-green-800/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <p className="text-green-300 font-semibold text-sm">
                ${earlyValue.total_captured_millions}M revenue captured by deploying {earlyValue.years_saved} years earlier
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                Based on ${earlyValue.lost_revenue_per_year_millions}M/yr in foregone data center revenue during grid wait
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 24-Hour Dispatch Chart ── */}
      <section>
        <SectionHeader
          title="24-Hour Energy Dispatch"
          subtitle="Hour-by-hour generation mix — shows how much is actually clean"
        />
        <div className="bg-navy-card rounded-lg border border-navy-border p-4 pt-6">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dispatchData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.2} />
                </linearGradient>
              </defs>
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
                width={52}
              />
              <Tooltip content={<DispatchTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
                formatter={(value) => <span style={{ color: "#9ca3af" }}>{value}</span>}
              />
              <Area type="monotone" dataKey="Grid" stackId="1" stroke="#6b7280" fill="url(#gridGrad)" name="Grid" />
              <Area type="monotone" dataKey="Diesel" stackId="1" stroke="#7c3aed" fill="url(#fcGrad)" name="Diesel" />
              <Area type="monotone" dataKey="Battery" stackId="1" stroke="#00d4ff" fill="url(#battGrad)" name="Battery" />
              <Area type="monotone" dataKey="PV" stackId="1" stroke="#f59e0b" fill="url(#pvGrad)" name="PV" />
              <Area type="monotone" dataKey="Load" stackId={undefined} stroke="#ffffff" fill="none" strokeWidth={2} strokeDasharray="5 3" name="Load" dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* CFE match pills */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {[
              { label: "Annual PPA Match", value: `${economics.cfe_match_annual_pct}%`, highlight: true },
              { label: "Hourly CFE Match", value: `${economics.cfe_match_hourly_pct}%`, highlight: true },
              { label: "Industry Benchmark", value: `${economics.cfe_match_industry_benchmark_pct}%`, highlight: false },
            ].map((pill) => (
              <div
                key={pill.label}
                className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                  pill.highlight
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-gray-800/50 border-gray-700 text-gray-400"
                }`}
              >
                {pill.label}: <span className="font-bold">{pill.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CapEx Donut + Savings Bar ── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* CapEx Donut */}
        <div>
          <SectionHeader title="CapEx Breakdown" subtitle={`$${economics.capex_total_millions}M total investment`} />
          <div className="bg-navy-card rounded-lg border border-navy-border p-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={capexData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {capexData.map((_, i) => (
                    <Cell key={i} fill={CAPEX_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label overlay */}
            <div className="text-center mt-2 mb-2">
              <p className="text-white text-xl font-bold">${economics.capex_total_millions}M</p>
            </div>
          </div>
        </div>

        {/* Annual Savings Bar */}
        <div>
          <SectionHeader
            title="Annual Savings & Revenue"
            subtitle={`$${economics.annual_savings_breakdown.total_annual_millions}M total per year`}
          />
          <div className="bg-navy-card rounded-lg border border-navy-border p-4 pt-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={savingsData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#1e3a5f" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#1e3a5f" }}
                  tickFormatter={(v) => `$${v}M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip content={<SavingsTooltip />} />
                <Bar dataKey="value" fill="#00d4ff" radius={[0, 4, 4, 0]} name="Annual Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Sensitivity Analysis ── */}
      <section>
        <SectionHeader
          title="Sensitivity Analysis"
          subtitle="Drag sliders to stress-test the proposal — NPV updates live"
        />
        <div className="bg-navy-card rounded-lg border border-navy-border p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* Sliders */}
            <div className="space-y-6">
              <SliderRow
                label="Discount Rate"
                value={discountRate}
                min={sa.discount_rate.range_pct[0]}
                max={sa.discount_rate.range_pct[1]}
                step={0.5}
                unit="%"
                onChange={setDiscountRate}
              />
              <SliderRow
                label="PPA Price"
                value={ppaPrice}
                min={sa.ppa_price.range_per_mwh[0]}
                max={sa.ppa_price.range_per_mwh[1]}
                step={1}
                unit="/MWh"
                prefix="$"
                onChange={setPpaPrice}
              />
              <SliderRow
                label="Natural Gas Price"
                value={gasPrice}
                min={sa.natural_gas_price.range_per_mmbtu[0]}
                max={sa.natural_gas_price.range_per_mmbtu[1]}
                step={0.25}
                unit="/MMBtu"
                prefix="$"
                onChange={setGasPrice}
              />
              <SliderRow
                label="Capacity Payment"
                value={capacityPayment}
                min={sa.capacity_payment.range_per_mw_day[0]}
                max={sa.capacity_payment.range_per_mw_day[1]}
                step={1}
                unit="/MW-day"
                prefix="$"
                onChange={setCapacityPayment}
              />
              <SliderRow
                label="BESS CapEx"
                value={bessCapex}
                min={sa.bess_capex.range_per_kwh[0]}
                max={sa.bess_capex.range_per_kwh[1]}
                step={10}
                unit="/kWh"
                prefix="$"
                onChange={setBessCapex}
              />
            </div>

            {/* Live results */}
            <div className="flex flex-col justify-center space-y-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Live Projection</p>

              {/* NPV */}
              <div className={`rounded-lg p-5 border transition-all ${
                Number(liveNPV) >= baseNPV
                  ? "bg-green-950/30 border-green-800/50"
                  : "bg-red-950/30 border-red-800/50"
              }`}>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">NPV (20 yr)</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold tabular-nums ${
                    Number(liveNPV) >= baseNPV ? "text-green-400" : "text-red-400"
                  }`}>
                    ${liveNPV}M
                  </span>
                  <span className={`text-sm font-semibold ${
                    Number(liveNPV) >= baseNPV ? "text-green-500" : "text-red-500"
                  }`}>
                    {Number(liveNPV) >= baseNPV ? "▲" : "▼"} ${Math.abs(Number(liveNPV) - baseNPV).toFixed(1)}M vs base
                  </span>
                </div>
              </div>

              {/* Payback + LCOE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d1e35] rounded-lg p-4 border border-navy-border">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Payback</p>
                  <p className="text-white text-2xl font-bold tabular-nums">{livePayback}<span className="text-accent text-sm ml-1">yrs</span></p>
                </div>
                <div className="bg-[#0d1e35] rounded-lg p-4 border border-navy-border">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">LCOE</p>
                  <p className="text-white text-2xl font-bold tabular-nums">${liveLCOE}<span className="text-accent text-sm ml-1">/MWh</span></p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDiscountRate(sa.discount_rate.default_pct);
                  setPpaPrice(sa.ppa_price.default_per_mwh);
                  setGasPrice(sa.natural_gas_price.default_per_mmbtu);
                  setCapacityPayment(sa.capacity_payment.default_per_mw_day);
                  setBessCapex(sa.bess_capex.default_per_kwh);
                }}
                className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors self-start"
              >
                Reset to base case
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
