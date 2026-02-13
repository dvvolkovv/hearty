/**
 * Admin API Client
 * Provides functions to interact with backend admin endpoints
 * All endpoints require ADMIN role
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// TypeScript Interfaces

export interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  firstName: string;
  lastName: string;
  createdAt: string;
  bannedAt: string | null;
  banReason: string | null;
}

export interface Specialist {
  id: string;
  userId: string;
  specialty: string;
  bio: string;
  experience: number;
  hourlyRate: number;
  location: string;
  imageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalReviews: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  specialist: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  client: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  price: number;
  createdAt: string;
  specialist: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  client: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'PAYMENT' | 'WITHDRAWAL' | 'REFUND' | 'PLATFORM_FEE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  booking?: {
    id: string;
  };
  specialist?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalSpecialists: number;
  totalClients: number;
  pendingSpecialists: number;
  totalBookings: number;
  totalRevenue: number;
  pendingReviews: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalPlatformFee: number;
  totalSpecialistEarnings: number;
  totalRefunds: number;
  pendingPayouts: number;
  period: {
    from: string;
    to: string;
  };
  breakdown: Array<{
    date: string;
    revenue: number;
    platformFee: number;
    specialistEarnings: number;
  }>;
}

export interface SpecialistFinancials {
  specialistId: string;
  specialistName: string;
  totalEarnings: number;
  totalSessions: number;
  averagePerSession: number;
  pendingPayout: number;
  transactions: Transaction[];
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
const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
};

// ============ User Management Endpoints ============

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  search?: string;
}): Promise<{ users: User[]; total: number; page: number; limit: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.role) query.append('role', params.role);
  if (params?.search) query.append('search', params.search);

  const queryString = query.toString();
  return apiRequest<{ users: User[]; total: number; page: number; limit: number }>(
    `/admin/users${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * GET /api/admin/users/:id
 * Get user details by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  return apiRequest<User>(`/admin/users/${userId}`);
};

/**
 * PUT /api/admin/users/:id/ban
 * Ban a user
 */
export const banUser = async (
  userId: string,
  reason: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/admin/users/${userId}/ban`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
};

/**
 * PUT /api/admin/users/:id/unban
 * Unban a user
 */
export const unbanUser = async (userId: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/admin/users/${userId}/unban`, {
    method: 'PUT',
  });
};

// ============ Specialist Moderation Endpoints ============

/**
 * GET /api/admin/specialists
 * Get all specialists with filters
 */
export const getSpecialists = async (params?: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}): Promise<{ specialists: Specialist[]; total: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);

  const queryString = query.toString();
  return apiRequest<{ specialists: Specialist[]; total: number }>(
    `/admin/specialists${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * PUT /api/admin/specialists/:id/approve
 * Approve a specialist
 */
export const approveSpecialist = async (
  specialistId: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `/admin/specialists/${specialistId}/approve`,
    { method: 'PUT' }
  );
};

/**
 * PUT /api/admin/specialists/:id/reject
 * Reject a specialist
 */
export const rejectSpecialist = async (
  specialistId: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `/admin/specialists/${specialistId}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }
  );
};

/**
 * PUT /api/admin/specialists/:id/suspend
 * Suspend a specialist
 */
export const suspendSpecialist = async (
  specialistId: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `/admin/specialists/${specialistId}/suspend`,
    {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }
  );
};

// ============ Review Moderation Endpoints ============

/**
 * GET /api/admin/reviews
 * Get all reviews with filters
 */
export const getReviews = async (params?: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}): Promise<{ reviews: Review[]; total: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);

  const queryString = query.toString();
  return apiRequest<{ reviews: Review[]; total: number }>(
    `/admin/reviews${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * PUT /api/admin/reviews/:id/approve
 * Approve a review
 */
export const approveReview = async (
  reviewId: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/admin/reviews/${reviewId}/approve`, {
    method: 'PUT',
  });
};

/**
 * PUT /api/admin/reviews/:id/reject
 * Reject a review
 */
export const rejectReview = async (
  reviewId: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/admin/reviews/${reviewId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
};

// ============ Booking Management Endpoints ============

/**
 * GET /api/admin/bookings
 * Get all bookings with filters
 */
export const getBookings = async (params?: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}): Promise<{ bookings: Booking[]; total: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);

  const queryString = query.toString();
  return apiRequest<{ bookings: Booking[]; total: number }>(
    `/admin/bookings${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * PUT /api/admin/bookings/:id/cancel
 * Cancel a booking with refund
 */
export const cancelBooking = async (
  bookingId: string,
  reason: string,
  refund: boolean = true
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `/admin/bookings/${bookingId}/cancel`,
    {
      method: 'PUT',
      body: JSON.stringify({ reason, refund }),
    }
  );
};

// ============ Financial Reports Endpoints ============

/**
 * GET /api/admin/financials/summary
 * Get detailed financial summary
 */
export const getFinancialSummary = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<FinancialSummary> => {
  const query = new URLSearchParams();
  if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params?.dateTo) query.append('dateTo', params.dateTo);

  const queryString = query.toString();
  return apiRequest<FinancialSummary>(
    `/admin/financials/summary${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * GET /api/admin/financials/specialists/:id
 * Get financial details for specific specialist
 */
export const getSpecialistFinancials = async (
  specialistId: string,
  params?: {
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<SpecialistFinancials> => {
  const query = new URLSearchParams();
  if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params?.dateTo) query.append('dateTo', params.dateTo);

  const queryString = query.toString();
  return apiRequest<SpecialistFinancials>(
    `/admin/financials/specialists/${specialistId}${queryString ? `?${queryString}` : ''}`
  );
};

// ============ Platform Stats Endpoint ============

/**
 * GET /api/admin/stats
 * Get platform statistics overview
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
  return apiRequest<PlatformStats>('/admin/stats');
};

/**
 * GET /api/admin/transactions
 * Get all transactions
 */
export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: 'PAYMENT' | 'WITHDRAWAL' | 'REFUND' | 'PLATFORM_FEE';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}): Promise<{ transactions: Transaction[]; total: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);

  const queryString = query.toString();
  return apiRequest<{ transactions: Transaction[]; total: number }>(
    `/admin/transactions${queryString ? `?${queryString}` : ''}`
  );
};
