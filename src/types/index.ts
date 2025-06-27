export interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
  type?: 'error' | 'event';
  metadata?: any;
}

export interface HourlyData {
  hour: number;
  events: number;
  errors: number;
}

export interface DashboardState {
  hourlyData: HourlyData[];
  errorLogs: ErrorLog[];
  isLive: boolean;
  webhookUrl: string;
  isConnected: boolean;
}

export interface WebhookEvent {
  type: 'webhook_event';
  data: ErrorLog;
}