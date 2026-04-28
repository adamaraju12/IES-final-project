export interface SiteData {
  _meta: Meta;
  site: Site;
  site_context: SiteContext;
  load_profile_24h_mw: number[];
  gpu_clusters: GpuCluster[];
  cooling_zones: CoolingZone[];
  proposed_portfolio: ProposedPortfolio;
  alternative_portfolios: AlternativePortfolio[];
  economics: Economics;
  sensitivity_analysis: SensitivityAnalysis;
  live_operations: LiveOperations;
  dispatch_24h: Dispatch24h;
  scenarios: Scenarios;
  insights_30day: Insights30day;
  pathway_comparison: PathwayComparison;
}

export interface Meta {
  description: string;
  last_updated: string;
}

export interface Site {
  name: string;
  facility_reference: string;
  location: string;
  iso: string;
  utility: string;
  tagline: string;
  peak_load_mw: number;
  average_load_mw: number;
  annual_consumption_gwh: number;
  load_factor: number;
  pue: number;
  it_load_mw: number;
  gpu_load_mw: number;
  cooling_overhead_mw: number;
  interconnection_queue_years: number;
  our_time_to_power_months: number;
}

export interface SiteContext {
  grid_operator: { name: string; lmp_avg_per_mwh: number; note: string };
  utility: { name: string; tariff: string; current_constraints: string; emissions_factor_kgco2_per_mwh: number };
  solar_resource: { ghi_kwh_per_m2_per_day: number; peak_sun_hours_per_year: number; note: string };
  site_footprint: {
    rooftop_available_sqft: number;
    rooftop_used_sqft: number;
    rooftop_utilization_pct: number;
    canopy_available_sqft: number;
    canopy_used_sqft: number;
    canopy_utilization_pct: number;
    note: string;
  };
  climate: { heating_degree_days: number; cooling_degree_days: number; free_cooling_months_per_year: number };
}

export interface GpuCluster {
  id: string;
  location: string;
  role: string;
  power_mw: number;
  utilization_pct: number;
  flexibility: string;
  shiftable_pct: number;
  note: string;
}

export interface CoolingZone {
  id: string;
  cooling_capacity_mw: number;
  current_load_mw: number;
  max_curtailment_mw: number;
  curtailment_duration_min: number;
  flexibility: string;
}

export interface ProposedPortfolio {
  pv_rooftop: {
    nameplate_mw_dc: number;
    capex_dollars: number;
    annual_capacity_factor_pct: number;
    footprint_sqft: number;
    footprint_utilization_pct: number;
  };
  pv_canopy: {
    nameplate_mw_dc: number;
    capex_dollars: number;
    annual_capacity_factor_pct: number;
    footprint_sqft: number;
    footprint_utilization_pct: number;
    note: string;
  };
  pv_total: {
    nameplate_mw_dc: number;
    annual_generation_mwh: number;
    annual_generation_gwh: number;
    share_of_load_pct: number;
  };
  bess: {
    energy_capacity_mwh: number;
    power_capacity_mw: number;
    duration_hours: number;
    chemistry: string;
    round_trip_efficiency_pct: number;
    annual_cycles: number;
    capex_dollars: number;
  };
  diesel: {
    capacity_mw: number;
    unit_count: number;
    unit_size_mw: number;
    annual_runtime_hours: number;
    annual_capacity_factor_pct: number;
    annual_generation_mwh: number;
    annual_fuel_cost_dollars: number;
    capex_dollars: number;
    role: string;
    note: string;
  };
  totals: {
    capex_dollars: number;
    capex_millions: number;
  };
}

export interface AlternativePortfolio {
  name: string;
  pv_mw: number;
  bess_mwh: number;
  bess_mw: number;
  diesel_mw: number;
  capex_millions: number;
  lcoe_per_mwh: number | null;
  ride_through_days: number;
  onsite_renewable_pct: number;
  recommended: boolean;
  note?: string;
}

export interface Economics {
  capex_total_millions: number;
  capex_breakdown: {
    pv_rooftop_millions: number;
    pv_canopy_millions: number;
    bess_millions: number;
    diesel_millions: number;
  };
  npv_millions_20yr: number;
  lcoe_per_mwh_optimized: number;
  lcoe_per_mwh_reference: number;
  lcoe_per_mwh_premium: number;
  payback_years: number;
  payback_label: string;
  irr_pct: number | null;
  irr_label: string;
  co2_balance: {
    reference_emissions_tons_per_year: number;
    optimized_emissions_tons_per_year: number;
    net_change_tons_per_year: number;
    pv_displaced_emissions_tons_per_year: number;
    diesel_added_emissions_tons_per_year: number;
  };
  cfe_metrics: {
    onsite_renewable_share_of_load_pct: number;
    onsite_renewable_share_note: string;
    cfe_with_svp_grid_mix_estimate_pct: number;
    industry_24_7_benchmark_pct: string;
  };
  annual_savings_breakdown: {
    energy_charge_savings_thousands: number;
    demand_charge_savings_thousands: number;
    demand_response_revenue_thousands: number;
    fuel_purchase_cost_thousands: number;
    der_maintenance_cost_thousands: number;
    total_opex_savings_thousands: number;
  };
  time_to_power_thesis: {
    svp_queue_months: number;
    btm_deployment_months: number;
    months_saved: number;
    lost_revenue_per_year_millions: number;
    years_saved: number;
    early_revenue_captured_millions: number;
    xendee_npv_year20_millions: number;
    net_value_captured_millions: number;
    headline: string;
  };
  hero_callouts: {
    primary: string;
    secondary: string;
    tertiary: string;
    financial_summary: string;
  };
  resilience: {
    ride_through_days: number;
    ride_through_window_modeled: string;
    resilience_premium_dollars: number;
    resilience_premium_per_kwh_met: number;
    resilience_premium_per_hour: number;
    industry_outage_cost_per_hour_range: string;
    industry_outage_cost_note: string;
    diesel_units: number;
    diesel_total_capacity_mw: number;
  };
}

export interface SensitivityAnalysis {
  discount_rate: { default_pct: number; range_pct: [number, number]; npv_delta_per_pct: number };
  svp_energy_price: { default_per_kwh: number; range_per_kwh: [number, number]; npv_delta_per_dollar: number };
  diesel_fuel_price: { default_per_gallon: number; range_per_gallon: [number, number]; npv_delta_per_dollar: number };
  capacity_payment: { default_per_mw_day: number; range_per_mw_day: [number, number]; npv_delta_per_dollar: number };
  bess_capex: { default_per_kwh: number; range_per_kwh: [number, number]; npv_delta_per_dollar: number };
  early_revenue: { default_millions_per_year: number; range_millions_per_year: [number, number]; thesis_value_per_dollar: number };
}

export interface Recommendation {
  title: string;
  description: string;
  impact: string;
  category: "compute" | "cooling" | "energy";
}

export interface LiveOperations {
  current_total_load_kw: number;
  net_grid_import_kw: number;
  battery_soc_pct: number;
  battery_charging_rate_kw: number;
  co2_intensity_gco2_per_kwh: number;
  cooling_flex_capacity_kw: number;
  recommendations: Recommendation[];
}

export interface Dispatch24h {
  hours: number[];
  load: number[];
  pv: number[];
  bess: number[];
  diesel: number[];
  grid: number[];
}

export interface ScenarioResult {
  name: string;
  total_cost_per_day: number;
  co2_intensity_gco2_per_kwh: number;
  battery_cycles: number;
  gpu_load_shifted_mwh: number;
  cooling_curtailed_mwh: number;
  savings_vs_base_pct?: number;
}

export interface Scenarios {
  base_case: ScenarioResult;
  high_flex: ScenarioResult;
  max_savings: ScenarioResult;
}

export interface Dimension {
  key: string;
  label: string;
  unit: string;
  direction: "lower_is_better" | "higher_is_better" | "neutral";
}

export interface Pathway {
  id: string;
  name: string;
  tagline: string;
  recommended: boolean;
  capex_millions: number | null;
  deployment_months: number | null;
  co2_lifetime_kt: number | null;
  npv_20yr_millions: number | null;
  footprint_sqft: number | null;
  deployment_risk: string | null;
  best_for: string | null;
}

export interface OptimizeForOption {
  key: string;
  label: string;
}

export interface PathwayComparison {
  dimensions: Dimension[];
  pathways: Pathway[];
  optimize_for_options: OptimizeForOption[];
}

export interface Insights30day {
  total_energy_cost_thousands: number;
  cost_savings_thousands: number;
  cost_savings_vs_baseline_pct: number;
  average_pue: number;
  pue_change_vs_last_period: number;
  carbon_avoided_tons_pv_gross: number;
  carbon_added_tons_diesel: number;
  carbon_net_tons: number;
  carbon_equivalent_miles: number;
  solar_contribution_pct: number;
  solar_generated_mwh: number;
  cooling_savings_thousands: number;
  gpu_load_shifted_mwh: number;
  weekly_cost_actual: number[];
  weekly_savings: number[];
  weekly_co2_intensity: number[];
  co2_target: number;
  monthly_onsite_renewable_pct: number[];
}
