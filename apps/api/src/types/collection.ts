export interface TraitMetrics {
  totalSales: number;
  volume: number;
  price: number;
  change24HourPercent: number | null;
  change7DayPercent: number | null;
  change30DayPercent: number | null;
}

export interface TraitStats {
  traitType: string;
  traitValue: string;
  metrics: TraitMetrics;
}

export interface GetTraitsOptions {
  traitType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "top" | "trending";
}
