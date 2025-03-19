export class ReportingService {
  static async generateMetrics(startDate, endDate) {
    const metrics = {
      overview: await this.getOverviewMetrics(startDate, endDate),
      engagement: await this.getEngagementMetrics(startDate, endDate),
      retention: await this.getRetentionMetrics(startDate, endDate),
      revenue: await this.getRevenueMetrics(startDate, endDate)
    };

    return metrics;
  }

  static async getOverviewMetrics(startDate, endDate) {
    const response = await fetch('/api/admin/analytics/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
  }

  static async getEngagementMetrics(startDate, endDate) {
    const response = await fetch('/api/admin/analytics/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
  }

  static async getRetentionMetrics(startDate, endDate) {
    const response = await fetch('/api/admin/analytics/retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
  }

  static async getRevenueMetrics(startDate, endDate) {
    const response = await fetch('/api/admin/analytics/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
  }

  static calculateGrowthRate(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }
} 