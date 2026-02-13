/**
 * Analytics API Client
 * Provides functions to interact with backend analytics endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// TypeScript Interfaces
export interface DateRangeFilter {
  from?: string; // ISO date string
  to?: string;   // ISO date string
}

export interface SpecialistDashboardData {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  pendingBookings: number;
  cancelledBookings: number;
  noShowRate: number;
  repeatClientRate: number;
}

export interface EarningsData {
  period: string; // 'daily' | 'weekly' | 'monthly'
  data: Array<{
    date: string;
    earnings: number;
    bookings: number;
  }>;
  totalEarnings: number;
  averagePerBooking: number;
}

export interface BookingsTimelineData {
  period: string;
  data: Array<{
    date: string;
    completed: number;
    cancelled: number;
    pending: number;
    noShow: number;
  }>;
}

export interface RatingsBreakdownData {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface PopularTimesData {
  dayOfWeek: {
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    Sunday: number;
  };
  hourOfDay: Record<string, number>; // "09:00": 15, "10:00": 22, etc.
  mostPopularDay: string;
  mostPopularHour: string;
}

export interface ClientInsightsData {
  totalClients: number;
  repeatClients: number;
  repeatRate: number;
  topClients: Array<{
    clientId: string;
    clientName: string;
    bookingsCount: number;
    totalSpent: number;
    lastBookingDate: string;
  }>;
  clientRetentionByMonth: Array<{
    month: string;
    newClients: number;
    returningClients: number;
  }>;
}

export interface PlatformOverviewData {
  totalUsers: number;
  totalSpecialists: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  platformFee: number;
  activeSpecialists: number;
  pendingSpecialists: number;
  averagePlatformRating: number;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Make authenticated API request
 */
const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
};

/**
 * Build query string from date range filter
 */
const buildDateRangeQuery = (dateRange?: DateRangeFilter): string => {
  if (!dateRange) return '';

  const params = new URLSearchParams();
  if (dateRange.from) params.append('from', dateRange.from);
  if (dateRange.to) params.append('to', dateRange.to);

  const query = params.toString();
  return query ? `?${query}` : '';
};

// ============ Specialist Analytics Endpoints ============

/**
 * GET /api/analytics/specialist/:id/dashboard
 * Get overview dashboard data for a specialist
 */
export const getSpecialistDashboard = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<SpecialistDashboardData> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest<SpecialistDashboardData>(
    `/analytics/specialist/${specialistId}/dashboard${query}`
  );
};

/**
 * GET /api/analytics/specialist/:id/earnings
 * Get earnings breakdown over time
 */
export const getSpecialistEarnings = async (
  specialistId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  dateRange?: DateRangeFilter
): Promise<EarningsData> => {
  const params = new URLSearchParams({ period });
  if (dateRange?.from) params.append('from', dateRange.from);
  if (dateRange?.to) params.append('to', dateRange.to);

  return apiRequest<EarningsData>(
    `/analytics/specialist/${specialistId}/earnings?${params.toString()}`
  );
};

/**
 * GET /api/analytics/specialist/:id/bookings-timeline
 * Get bookings status over time
 */
export const getSpecialistBookingsTimeline = async (
  specialistId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  dateRange?: DateRangeFilter
): Promise<BookingsTimelineData> => {
  const params = new URLSearchParams({ period });
  if (dateRange?.from) params.append('from', dateRange.from);
  if (dateRange?.to) params.append('to', dateRange.to);

  return apiRequest<BookingsTimelineData>(
    `/analytics/specialist/${specialistId}/bookings-timeline?${params.toString()}`
  );
};

/**
 * GET /api/analytics/specialist/:id/ratings-breakdown
 * Get detailed ratings distribution and recent reviews
 */
export const getSpecialistRatingsBreakdown = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<RatingsBreakdownData> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest<RatingsBreakdownData>(
    `/analytics/specialist/${specialistId}/ratings-breakdown${query}`
  );
};

/**
 * GET /api/analytics/specialist/:id/popular-times
 * Get popular booking times (heatmap data)
 */
export const getSpecialistPopularTimes = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<PopularTimesData> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest<PopularTimesData>(
    `/analytics/specialist/${specialistId}/popular-times${query}`
  );
};

/**
 * GET /api/analytics/specialist/:id/client-insights
 * Get client retention and repeat customer metrics
 */
export const getSpecialistClientInsights = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<ClientInsightsData> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest<ClientInsightsData>(
    `/analytics/specialist/${specialistId}/client-insights${query}`
  );
};

// ============ Platform Analytics Endpoints (Admin Only) ============

/**
 * GET /api/analytics/platform/overview
 * Get platform-wide KPIs
 */
export const getPlatformOverview = async (
  dateRange?: DateRangeFilter
): Promise<PlatformOverviewData> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest<PlatformOverviewData>(
    `/analytics/platform/overview${query}`
  );
};

/**
 * GET /api/analytics/platform/revenue
 * Get revenue breakdown
 */
export const getPlatformRevenue = async (
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  dateRange?: DateRangeFilter
): Promise<{
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    platformFee: number;
    specialistEarnings: number;
  }>;
  totalRevenue: number;
  totalPlatformFee: number;
}> => {
  const params = new URLSearchParams({ period });
  if (dateRange?.from) params.append('from', dateRange.from);
  if (dateRange?.to) params.append('to', dateRange.to);

  return apiRequest(
    `/analytics/platform/revenue?${params.toString()}`
  );
};

/**
 * GET /api/analytics/platform/growth-metrics
 * Get user growth trends
 */
export const getPlatformGrowthMetrics = async (
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  dateRange?: DateRangeFilter
): Promise<{
  period: string;
  data: Array<{
    date: string;
    newUsers: number;
    newSpecialists: number;
    newClients: number;
  }>;
}> => {
  const params = new URLSearchParams({ period });
  if (dateRange?.from) params.append('from', dateRange.from);
  if (dateRange?.to) params.append('to', dateRange.to);

  return apiRequest(
    `/analytics/platform/growth-metrics?${params.toString()}`
  );
};

/**
 * GET /api/analytics/platform/specialties-distribution
 * Get distribution of specialists by specialty
 */
export const getPlatformSpecialtiesDistribution = async (): Promise<{
  specialties: Array<{
    specialty: string;
    count: number;
    percentage: number;
  }>;
}> => {
  return apiRequest(
    `/analytics/platform/specialties-distribution`
  );
};

/**
 * GET /api/analytics/platform/locations-distribution
 * Get distribution of specialists by location
 */
export const getPlatformLocationsDistribution = async (): Promise<{
  locations: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}> => {
  return apiRequest(
    `/analytics/platform/locations-distribution`
  );
};

/**
 * GET /api/analytics/platform/quality-metrics
 * Get quality metrics (no-show rate, cancellations)
 */
export const getPlatformQualityMetrics = async (
  dateRange?: DateRangeFilter
): Promise<{
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageRating: number;
}> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest(
    `/analytics/platform/quality-metrics${query}`
  );
};

/**
 * GET /api/analytics/platform/time-slot-analysis
 * Get time slot utilization analysis
 */
export const getPlatformTimeSlotAnalysis = async (
  dateRange?: DateRangeFilter
): Promise<{
  totalSlots: number;
  bookedSlots: number;
  utilizationRate: number;
  byDayOfWeek: Record<string, { total: number; booked: number; rate: number }>;
  byHourOfDay: Record<string, { total: number; booked: number; rate: number }>;
}> => {
  const query = buildDateRangeQuery(dateRange);
  return apiRequest(
    `/analytics/platform/time-slot-analysis${query}`
  );
};
