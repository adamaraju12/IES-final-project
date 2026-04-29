"use client";

import { useState, useMemo } from "react";
import { getSiteData } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { cn } from "@/lib/utils";
import type { Pathway, Dimension } from "@/lib/types";

type MetricKey =
  | "capex_millions"
  | "deployment_months"
  | "co2_lifetime_kt"
  | "npv_20yr_millions"
  | "footprint_sqft"
  | "deployment_risk"
  | "best_for";

const METRIC_KEYS: MetricKey[] = [
  "capex_millions",
  "deployment_months",
  "co2_lifetime_kt",
  "npv_20yr_millions",
  "footprint_sqft",
  "deployment_risk",
  "best_for",
];

function getVal(pathway: Pathway, key: string): number | string | null {
  if (!METRIC_KEYS.includes(key as MetricKey)) return null;
  return pathway[key as MetricKey] as number | string | null;
}

function isAllNull(pathway: Pathway): boolean {
  return METRIC_KEYS.every((k) => pathway[k] === null);
}

function formatValue(
  pathway: Pathway,
  dim: Dimension
): { display: string; raw: number | string | null } {
  const raw = getVal(pathway, dim.key);
  if (raw === null || raw === undefined) return { display: "TBD", raw: null };
  if (dim.unit === "qualitative") return { display: String(raw), raw };
  if (dim.unit === "$M") return { display: `$${raw}M`, raw: raw as number };
  if (dim.unit === "months") return { display: `${raw} mo`, raw: raw as number };
  if (dim.unit === "kt") return { display: `${raw} kt`, raw: raw as number };
  if (dim.unit === "sqft")
    return { display: `${Number(raw).toLocaleString()} sqft`, raw: raw as number };
  return { display: `${raw} ${dim.unit}`, raw };
}

function getDotColor(rank: number, total: number): "green" | "yellow" | "red" {
  if (rank === 0) return "green";
  if (rank === total - 1) return "red";
  return "yellow";
}

function PerformanceDot({ color }: { color: "green" | "yellow" | "red" }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full flex-shrink-0 mr-1.5",
        color === "green"
          ? "bg-green-400"
          : color === "yellow"
          ? "bg-yellow-400"
          : "bg-red-400"
      )}
    />
  );
}

const CALLOUT_COPY: Record<string, string> = {
  deployment_months:
    "If your priority is Time to Power, the Gas Turbine leads at an estimated 12 months (median of a " +
    "9–15 month range), followed by Fuel Cells at ~15 months and Diesel-Primary at 18 months. " +
    "Gas turbine permitting carries more complexity than diesel, but the overall deployment timeline " +
    "is faster. Diesel-Primary remains the lowest-risk option if schedule certainty matters more " +
    "than schedule speed.",
  co2_lifetime_kt:
    "If your priority is Carbon Footprint, the Gas Turbine achieves a net-negative 20-year CO2 " +
    "position (–23.7 kt vs. grid reference), driven by the combined PV layer offsetting grid " +
    "emissions at scale. Fuel Cells come in at 2.24 kt and Diesel-Primary at 2.5 kt — both net " +
    "positive emitters over 20 years. Note: fuel cell CO2 is illustrative from public benchmarks, " +
    "not a full Xendee run.",
  capex_millions:
    "If your priority is Upfront Cost, the Fuel Cell PPA structure has zero CapEx — equipment is " +
    "owned by the developer and the operator pays a capacity fee. Diesel-Primary at $34.28M and " +
    "Gas Turbine at $36.78M require full capital outlay. The trade-off is that a PPA locks in a " +
    "long-term contract without asset ownership or balance-sheet flexibility.",
  npv_20yr_millions:
    "If your priority is Long-term Economics, the Fuel Cell PPA leads with –$1.56M NPV over 20 " +
    "years, reflecting lower fuel and O&M costs relative to owned generation assets. Gas Turbine " +
    "comes in at –$12.31M and Diesel-Primary at –$19.68M. All three pathways are net-negative NPV " +
    "under current model assumptions — this site's value proposition is speed-to-revenue and " +
    "resilience, not energy cost arbitrage.",
};

export default function PathwayComparisonPage() {
  const data = getSiteData();
  const { pathway_comparison } = data;
  const { dimensions, pathways, optimize_for_options } = pathway_comparison;

  const [selectedKey, setSelectedKey] = useState(optimize_for_options[0].key);
  const selectedOption = optimize_for_options.find((o) => o.key === selectedKey)!;

  // Re-rank columns: pathways with data for selectedKey sorted by performance, then nulls appended
  const rankedPathways = useMemo(() => {
    const dim = dimensions.find((d) => d.key === selectedKey);
    if (!dim || dim.direction === "neutral") return pathways;

    const withData = pathways.filter((p) => getVal(p, selectedKey) !== null);
    const withoutData = pathways.filter((p) => getVal(p, selectedKey) === null);

    const sorted = [...withData].sort((a, b) => {
      const aVal = getVal(a, selectedKey) as number;
      const bVal = getVal(b, selectedKey) as number;
      return dim.direction === "lower_is_better" ? aVal - bVal : bVal - aVal;
    });

    return [...sorted, ...withoutData];
  }, [pathways, dimensions, selectedKey]);

  // Only mark a winner if the first ranked pathway has actual data for the selected dimension
  const firstHasData = useMemo(
    () => rankedPathways.length > 0 && getVal(rankedPathways[0], selectedKey) !== null,
    [rankedPathways, selectedKey]
  );

  // Per-row performance ranks (only computed when 2+ pathways have numeric data for that row)
  const rowRanks = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    for (const dim of dimensions) {
      if (dim.direction === "neutral" || dim.unit === "qualitative") {
        result[dim.key] = {};
        continue;
      }
      const values = pathways
        .map((p) => ({ id: p.id, val: getVal(p, dim.key) }))
        .filter((x): x is { id: string; val: number } => typeof x.val === "number");

      if (values.length < 2) {
        result[dim.key] = {};
        continue;
      }

      const sorted = [...values].sort((a, b) =>
        dim.direction === "lower_is_better" ? a.val - b.val : b.val - a.val
      );
      const ranks: Record<string, number> = {};
      sorted.forEach(({ id }, idx) => {
        ranks[id] = idx;
      });
      result[dim.key] = ranks;
    }
    return result;
  }, [dimensions, pathways]);

  const winnerPathway = rankedPathways[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-16">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Pathway Comparison</h1>
        <p className="text-gray-400 text-sm mt-1">
          Three deployment pathways evaluated against operator priorities.
        </p>
      </div>

      {/* ── Optimize-for selector ── */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Optimize for:
        </p>
        <div className="flex flex-wrap gap-2">
          {optimize_for_options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedKey(opt.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                selectedKey === opt.key
                  ? "bg-accent/15 text-accent border-accent/50"
                  : "bg-navy-card text-gray-400 border-navy-border hover:text-white hover:border-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Comparison matrix ── */}
      <section>
        <SectionHeader
          title="Pathway Comparison Matrix"
          subtitle={`Ranked by ${selectedOption.label} · best performer left`}
        />

        <div className="grid grid-cols-3 gap-4">
          {rankedPathways.map((pathway, colIdx) => {
            const isWinner = colIdx === 0 && firstHasData;
            const isPending = isAllNull(pathway);

            return (
              <div
                key={pathway.id}
                className={cn(
                  "bg-navy-card rounded-lg border p-5 relative",
                  isWinner
                    ? "border-accent/60 shadow-[0_0_24px_rgba(0,212,255,0.08)]"
                    : "border-navy-border"
                )}
              >
                {/* Accent top bar on winner column */}
                {isWinner && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-accent rounded-t-lg" />
                )}

                {/* Column header */}
                <div className="mb-4 pt-1 space-y-1.5">
                  <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                    {isWinner && (
                      <span className="text-xs bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Optimal for {selectedOption.label}
                      </span>
                    )}
                    {isPending && (
                      <span className="text-xs bg-gray-500/15 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Data pending
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      "font-bold text-base",
                      isWinner ? "text-accent" : "text-white"
                    )}
                  >
                    {pathway.name}
                  </p>
                  <p className="text-gray-500 text-xs">{pathway.tagline}</p>
                </div>

                {/* Dimension rows */}
                <div className="space-y-3 border-t border-navy-border pt-3">
                  {dimensions
                    .filter((d) => !d.key.startsWith("_"))
                    .map((dim) => {
                      const { display, raw } = formatValue(pathway, dim);
                      const rank = rowRanks[dim.key]?.[pathway.id];
                      const totalWithData = pathways.filter(
                        (p) => typeof getVal(p, dim.key) === "number"
                      ).length;
                      const showDot =
                        raw !== null &&
                        dim.direction !== "neutral" &&
                        dim.unit !== "qualitative" &&
                        totalWithData >= 2 &&
                        rank !== undefined;

                      return (
                        <div key={dim.key} className="flex flex-col gap-0.5">
                          <span className="text-gray-500 text-xs">{dim.label}</span>
                          <div className="flex items-center">
                            {showDot && (
                              <PerformanceDot color={getDotColor(rank!, totalWithData)} />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium tabular-nums",
                                raw === null
                                  ? "text-gray-600 italic"
                                  : isWinner
                                  ? "text-white"
                                  : "text-gray-300"
                              )}
                            >
                              {display}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Framing note ── */}
      <p className="text-gray-500 text-sm italic">
        Our Business Case analysis explores the diesel-primary pathway in depth as a representative
        case study. Different operators applying this framework will arrive at different
        recommendations based on their priorities.
      </p>

      {/* ── Why this pathway? ── */}
      <section>
        <div className="bg-navy-card rounded-lg border border-accent/30 p-6 shadow-[0_0_24px_rgba(0,212,255,0.05)]">
          <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            Why this pathway?
          </p>
          <p className="text-white font-bold text-lg">{winnerPathway.name}</p>
          <p className="text-gray-400 text-sm mb-4">{winnerPathway.tagline}</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {CALLOUT_COPY[selectedKey] ??
              "Analysis pending — data not yet available for this dimension."}
          </p>
        </div>
      </section>

      {/* ── Methodology footer ── */}
      <section>
        <div className="bg-navy-card rounded-lg border border-navy-border p-4">
          <p className="text-gray-500 text-xs leading-relaxed">
            <span className="text-gray-400 font-medium">Methodology: </span>
            Diesel-Primary figures reflect the Xendee Apr 27 2026 run. Gas Turbine figures reflect
            Jose&apos;s Xendee Apr 29 2026 run (45 MW gas plant + existing PV portfolio). Fuel Cell
            figures are illustrative benchmarks from Bloom Energy PPA disclosures — not a Xendee
            run; treat with caution, especially the 20-year CO2 figure. CO2 values are kt net vs.
            grid reference over 20 years (negative = net carbon reduction). Deployment months are
            midpoints of estimated ranges.
          </p>
        </div>
      </section>

    </div>
  );
}
