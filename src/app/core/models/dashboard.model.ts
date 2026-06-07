export interface DashboardStats {
  totalFeedbacks: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  complaintCount: number;
  suggestionCount: number;
  complimentCount: number;
  avgResolutionTimeHours: number;
  satisfactionRate: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendData {
  date: string;
  complaints: number;
  suggestions: number;
  compliments: number;
}
