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
}

export interface Meta {
  description: string;
  last_updated: string;
  data_sources: Record<string, string>;
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
  pv_array: {
    nameplate_mw_dc: number;
    nameplate_mw_ac: number;
    annual_generation_gwh: number;
    land_acres: number;
    capacity_factor_pct: number;
    siting_note: string;
  };
  bess: {
    energy_capacity_mwh: number;
    power_capacity_mw: number;
    duration_hours: number;
    chemistry: string;
    round_trip_efficiency_pct: number;
  };
  diesel: {
    capacity_mw: number;
    type: string;
    fuel: string;
    role: string;
    annual_capacity_factor_pct: number;
    runtime_hours_per_year: number;
  };
  grid_interconnection: { size_mw: number; role: string; ppa_structure: string };
}

export interface AlternativePortfolio {
  name: string;
  pv_mw: number;
  bess_mwh: number;
  diesel_mw: number;
  capex_millions: number;
  lcoe_per_mwh: number;
  cfe_match_pct: number;
  recommended: boolean;
}

export interface Economics {
  capex_total_millions: number;
  capex_breakdown: {
    pv_millions: number;
    bess_millions: number;
    diesel_millions: number;
    balance_of_system_millions: number;
  };
  npv_millions_20yr: number;
  lcoe_per_mwh: number;
  payback_years: number;
  irr_pct: number;
  co2_avoided_tons_lifetime: number;
  cfe_match_annual_pct: number;
  cfe_match_hourly_pct: number;
  cfe_match_industry_benchmark_pct: number;
  annual_savings_breakdown: {
    energy_cost_avoided_millions: number;
    demand_charge_reduction_millions: number;
    capacity_market_revenue_millions: number;
    dr_program_revenue_millions: number;
    cfe_premium_millions: number;
    total_annual_millions: number;
  };
  early_deployment_value: {
    lost_revenue_per_year_millions: number;
    years_saved: number;
    total_captured_millions: number;
  };
}

export interface SensitivityAnalysis {
  discount_rate: { default_pct: number; range_pct: [number, number]; npv_delta_per_pct: number };
  ppa_price: { default_per_mwh: number; range_per_mwh: [number, number]; npv_delta_per_dollar: number };
  natural_gas_price: { default_per_mmbtu: number; range_per_mmbtu: [number, number]; npv_delta_per_dollar: number };
  capacity_payment: { default_per_mw_day: number; range_per_mw_day: [number, number]; npv_delta_per_dollar: number };
  bess_capex: { default_per_kwh: number; range_per_kwh: [number, number]; npv_delta_per_dollar: number };
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

export interface Insights30day {
  total_energy_cost_thousands: number;
  cost_savings_thousands: number;
  cost_savings_vs_baseline_pct: number;
  average_pue: number;
  pue_change_vs_last_period: number;
  carbon_avoided_tons: number;
  carbon_equivalent_miles: number;
  solar_contribution_pct: number;
  solar_generated_mwh: number;
  cooling_savings_thousands: number;
  gpu_load_shifted_mwh: number;
  weekly_cost_actual: number[];
  weekly_savings: number[];
  weekly_co2_intensity: number[];
  co2_target: number;
  monthly_cfe_match: number[];
}
