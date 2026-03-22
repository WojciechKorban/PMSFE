export type ReportType =
  | 'PROFITABILITY_SUMMARY'
  | 'METER_READINGS_CSV'
  | 'PROFITABILITY_COMPARISON'
  | 'ANNUAL_SUMMARY';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export interface ReportRequest {
  reportRequestId: string;
  status: ReportStatus;
  downloadUrl: string | null;
  errorMessage: string | null;
}

export interface DateRange {
  from: Date;
  to: Date;
}
