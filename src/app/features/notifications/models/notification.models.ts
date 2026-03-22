export interface NotificationPreferences {
  leaseExpiryWarningDays: number;
  meterReadingReminderDayOfMonth: number;
  emailNotificationsEnabled: boolean;
  profitabilityReportEnabled: boolean;
  profitabilityReportDayOfMonth: number;
  language: string;
}

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

export interface NotificationLog {
  id: string;
  recipientEmail: string;
  templateKey: string;
  subject: string;
  status: NotificationStatus;
  sentAt: string | null;
  createdAt: string;
}
