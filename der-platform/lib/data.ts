import type { SiteData } from "./types";
import rawData from "../public/site_data.json";

export function getSiteData(): SiteData {
  return rawData as unknown as SiteData;
}
