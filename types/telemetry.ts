export interface EndpointLatency {
  endpoint: string;
  url: string;
  durationMs: number;
  status: "fast" | "moderate" | "slow" | "error" | "unlinked";
  statusText: string;
  cache: "HIT" | "MISS" | "LIVE";
  timestamp: string;
  payloadSize?: string;
  isConfigured: boolean;
  envKey: string;
}

export interface SpeedComparison {
  parallelMs: number;
  sequentialEstimateMs: number;
  speedupMultiplier: string;
  isCached: boolean;
}

export interface TelemetrySummary {
  ttfb: number;
  avgLatency: number;
  fastestMs: number;
  slowestMs: number;
  lastUpdated: string;
  speedComparison?: SpeedComparison;
  endpoints: Record<string, EndpointLatency>;
}
