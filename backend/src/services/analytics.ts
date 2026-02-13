import prisma from '../config/database'
import { Prisma } from '@prisma/client'

// ========================================
// Types & Interfaces
// ========================================

export interface DateRangeFilter {
  from?: Date
  to?: Date
}

export interface SpecialistDashboard {
  period: string
  metrics: {
    totalBookings: number
    completedSessions: number
    pendingPayouts: number
    balance: number
    averageRating: number
    totalReviews: number
  }
  trends?: {
    bookingsTrend: number // percentage change
    revenueTrend: number
  }
}

export interface EarningsData {
  period: string
  totalEarnings: number
  platformFees: number
  withdrawn: number
  pending: number
  byDate: Array<{
    date: string
    amount: number
    transactions: number
  }>
}

export interface BookingsTimelineData {
  period: string
  totalBookings: number
  byStatus: Record<string, number>
  byDate: Array<{
    date: string
    count: number
    completionRate: number
  }>
}

export interface RatingsBreakdownData {
  average: number
  totalReviews: number
  distribution: Record<number, number> // 1-5 star counts
  categories?: {
    professionalism?: number
    empathy?: number
    results?: number
  }
}

export interface PopularTimesData {
  mostBookedDays: Array<{
    day: string
    count: number
  }>
  mostBookedHours: Array<{
    hour: number
    count: number
  }>
}

export interface ClientInsightsData {
  totalClients: number
  repeatClients: number
  averageSessionsPerClient: number
  topClients: Array<{
    clientId: string
    sessions: number
  }>
}

export interface PlatformOverviewData {
  users: {
    total: number
    clients: number
    specialists: number
    activeSpecialists: number
  }
  bookings: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
}

export interface PlatformRevenueData {
  period: string
  totalRevenue: number
  platformFees: number
  specialistPayouts: number
  byDate: Array<{
    date: string
    revenue: number
    fees: number
    transactions: number
  }>
}

export interface GrowthMetricsData {
  period: string
  newUsers: number
  newSpecialists: number
  signupTrend: Array<{
    date: string
    users: number
    specialists: number
  }>
}

// ========================================
// Specialist Analytics Functions
// ========================================

/**
 * Get specialist dashboard overview
 */
export const getSpecialistDashboard = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<SpecialistDashboard> => {
  const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 1))
  const to = dateRange?.to || new Date()

  // Get specialist data
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
    select: {
      balance: true,
      rating: true,
      totalReviews: true
    }
  })

  if (!specialist) {
    throw new Error('Specialist not found')
  }

  // Get bookings count
  const totalBookings = await prisma.booking.count({
    where: {
      specialistId,
      createdAt: {
        gte: from,
        lte: to
      }
    }
  })

  // Get completed sessions
  const completedSessions = await prisma.session.count({
    where: {
      specialistId,
      createdAt: {
        gte: from,
        lte: to
      }
    }
  })

  // Get pending payouts (completed transactions not yet withdrawn)
  const pendingPayoutsResult = await prisma.transaction.aggregate({
    where: {
      specialistId,
      type: 'BOOKING_PAYMENT'
    },
    _sum: {
      amount: true,
      platformFee: true
    }
  })

  const withdrawnResult = await prisma.withdrawalRequest.aggregate({
    where: {
      specialistId,
    },
    _sum: {
      amount: true
    }
  })

  const totalEarnings = (pendingPayoutsResult._sum.amount || 0) - (pendingPayoutsResult._sum.platformFee || 0)
  const withdrawn = withdrawnResult._sum.amount || 0
  const pendingPayouts = totalEarnings - withdrawn

  return {
    period: `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`,
    metrics: {
      totalBookings,
      completedSessions,
      pendingPayouts,
      balance: specialist.balance,
      averageRating: specialist.rating,
      totalReviews: specialist.totalReviews
    }
  }
}

/**
 * Get specialist earnings over time
 */
export const getSpecialistEarnings = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<EarningsData> => {
  const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 3))
  const to = dateRange?.to || new Date()

  // Get total earnings
  const earningsResult = await prisma.transaction.aggregate({
    where: {
      specialistId,
      type: 'BOOKING_PAYMENT',
      createdAt: {
        gte: from,
        lte: to
      }
    },
    _sum: {
      amount: true,
      platformFee: true
    }
  })

  const totalRevenue = earningsResult._sum.amount || 0
  const platformFees = earningsResult._sum.platformFee || 0
  const totalEarnings = totalRevenue - platformFees

  // Get withdrawn amount
  const withdrawnResult = await prisma.withdrawalRequest.aggregate({
    where: {
      specialistId,
      createdAt: {
        gte: from,
        lte: to
      }
    },
    _sum: {
      amount: true
    }
  })

  const withdrawn = withdrawnResult._sum.amount || 0
  const pending = totalEarnings - withdrawn

  // Get earnings by date using raw SQL for date grouping
  const byDateRaw: any[] = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      SUM(amount - "platformFee") as amount,
      COUNT(*) as transactions
    FROM "Transaction"
    WHERE "specialistId" = ${specialistId}
      AND status = 'COMPLETED'
      AND type = 'PAYMENT'
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `

  const byDate = byDateRaw.map(row => ({
    date: row.date.toISOString().split('T')[0],
    amount: Number(row.amount),
    transactions: Number(row.transactions)
  }))

  return {
    period: `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`,
    totalEarnings,
    platformFees,
    withdrawn,
    pending,
    byDate
  }
}

/**
 * Get bookings timeline
 */
export const getSpecialistBookingsTimeline = async (
  specialistId: string,
  dateRange?: DateRangeFilter
): Promise<BookingsTimelineData> => {
  const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 3))
  const to = dateRange?.to || new Date()

  // Total bookings
  const totalBookings = await prisma.booking.count({
    where: {
      specialistId,
      createdAt: {
        gte: from,
        lte: to
      }
    }
  })

  // Bookings by status
  const byStatusRaw = await prisma.booking.groupBy({
    by: ['status'],
    where: {
      specialistId,
      createdAt: {
        gte: from,
        lte: to
      }
    },
    _count: true
  })

  const byStatus: Record<string, number> = {}
  byStatusRaw.forEach(row => {
    byStatus[row.status] = row._count
  })

  // Bookings by date
  const byDateRaw: any[] = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as count,
      ROUND(
        100.0 * COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) / NULLIF(COUNT(*), 0),
        2
      ) as completion_rate
    FROM "Booking"
    WHERE "specialistId" = ${specialistId}
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `

  const byDate = byDateRaw.map(row => ({
    date: row.date.toISOString().split('T')[0],
    count: Number(row.count),
    completionRate: Number(row.completion_rate) || 0
  }))

  return {
    period: `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`,
    totalBookings,
    byStatus,
    byDate
  }
}

/**
 * Get ratings breakdown
 */
export const getSpecialistRatingsBreakdown = async (
  specialistId: string
): Promise<RatingsBreakdownData> => {
  // Get all approved reviews
  const reviews = await prisma.review.findMany({
    where: {
      specialistId,
      status: 'APPROVED'
    },
    select: {
      rating: true,
      professionalismRating: true,
      empathyRating: true,
      resultRating: true
    }
  })

  if (reviews.length === 0) {
    return {
      average: 0,
      totalReviews: 0,
      distribution: {}
    }
  }

  // Calculate average
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const average = totalRating / reviews.length

  // Calculate distribution (1-5 stars)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(review => {
    distribution[review.rating]++
  })

  // Calculate category averages
  const professionalismSum = reviews.reduce((sum, r) => sum + (r.professionalismRating || 0), 0)
  const empathySum = reviews.reduce((sum, r) => sum + (r.empathyRating || 0), 0)
  const resultsSum = reviews.reduce((sum, r) => sum + (r.resultRating || 0), 0)

  const categories = {
    professionalism: professionalismSum / reviews.length,
    empathy: empathySum / reviews.length,
    results: resultsSum / reviews.length
  }

  return {
    average,
    totalReviews: reviews.length,
    distribution,
    categories
  }
}

/**
 * Get popular booking times
 */
export const getSpecialistPopularTimes = async (
  specialistId: string
): Promise<PopularTimesData> => {
  // Get bookings with time data
  const bookings = await prisma.booking.findMany({
    where: {
      specialistId,
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    select: {
      date: true,
      time: true
    }
  })

  // Count by day of week
  const dayCount: Record<string, number> = {}
  const hourCount: Record<number, number> = {}

  bookings.forEach(booking => {
    // Day of week
    const dayName = booking.date.toLocaleDateString('en-US', { weekday: 'long' })
    dayCount[dayName] = (dayCount[dayName] || 0) + 1

    // Hour from time string (e.g., "10:00" -> 10)
    const hour = parseInt(booking.time.split(':')[0])
    hourCount[hour] = (hourCount[hour] || 0) + 1
  })

  // Sort and get top days
  const mostBookedDays = Object.entries(dayCount)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)

  // Sort and get top hours
  const mostBookedHours = Object.entries(hourCount)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    mostBookedDays,
    mostBookedHours
  }
}

/**
 * Get client insights (repeat clients, etc.)
 */
export const getSpecialistClientInsights = async (
  specialistId: string
): Promise<ClientInsightsData> => {
  // Get all sessions for this specialist
  const sessions = await prisma.session.findMany({
    where: {
      specialistId,
    },
    select: {
      clientId: true
    }
  })

  // Count sessions per client
  const clientSessionCount: Record<string, number> = {}
  sessions.forEach(session => {
    clientSessionCount[session.clientId] = (clientSessionCount[session.clientId] || 0) + 1
  })

  const totalClients = Object.keys(clientSessionCount).length
  const repeatClients = Object.values(clientSessionCount).filter(count => count > 1).length
  const totalSessions = sessions.length
  const averageSessionsPerClient = totalClients > 0 ? totalSessions / totalClients : 0

  // Get top clients
  const topClients = Object.entries(clientSessionCount)
    .map(([clientId, sessions]) => ({ clientId, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)

  return {
    totalClients,
    repeatClients,
    averageSessionsPerClient: Math.round(averageSessionsPerClient * 100) / 100,
    topClients
  }
}

// ========================================
// Platform Analytics Functions (Admin Only)
// ========================================

/**
 * Get platform overview KPIs
 */
export const getPlatformOverview = async (): Promise<PlatformOverviewData> => {
  const now = new Date()
  const startOfToday = new Date(now.setHours(0, 0, 0, 0))
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Count users
  const [totalUsers, totalClients, totalSpecialists, activeSpecialists] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.client.count(),
    prisma.specialist.count(),
    prisma.specialist.count({ where: { status: 'APPROVED' } })
  ])

  // Count bookings
  const [totalBookings, todayBookings, weekBookings, monthBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } })
  ])

  // Calculate revenue
  const [totalRevenueResult, monthRevenueResult] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { platformFee: true }
    }),
    prisma.transaction.aggregate({
      where: {
        type: 'BOOKING_PAYMENT',
        createdAt: { gte: startOfMonth }
      },
      _sum: { platformFee: true }
    })
  ])

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      specialists: totalSpecialists,
      activeSpecialists
    },
    bookings: {
      total: totalBookings,
      today: todayBookings,
      thisWeek: weekBookings,
      thisMonth: monthBookings
    },
    revenue: {
      total: totalRevenueResult._sum.platformFee || 0,
      thisMonth: monthRevenueResult._sum.platformFee || 0
    }
  }
}

/**
 * Get platform revenue metrics
 */
export const getPlatformRevenue = async (
  dateRange?: DateRangeFilter
): Promise<PlatformRevenueData> => {
  const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 3))
  const to = dateRange?.to || new Date()

  // Get total revenue
  const revenueResult = await prisma.transaction.aggregate({
    where: {
      type: 'BOOKING_PAYMENT',
      createdAt: {
        gte: from,
        lte: to
      }
    },
    _sum: {
      amount: true,
      platformFee: true
    }
  })

  const totalRevenue = revenueResult._sum.amount || 0
  const platformFees = revenueResult._sum.platformFee || 0
  const specialistPayouts = totalRevenue - platformFees

  // Revenue by date
  const byDateRaw: any[] = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      SUM(amount) as revenue,
      SUM("platformFee") as fees,
      COUNT(*) as transactions
    FROM "Transaction"
    WHERE status = 'COMPLETED'
      AND type = 'PAYMENT'
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `

  const byDate = byDateRaw.map(row => ({
    date: row.date.toISOString().split('T')[0],
    revenue: Number(row.revenue),
    fees: Number(row.fees),
    transactions: Number(row.transactions)
  }))

  return {
    period: `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`,
    totalRevenue,
    platformFees,
    specialistPayouts,
    byDate
  }
}

/**
 * Get platform growth metrics
 */
export const getPlatformGrowthMetrics = async (
  dateRange?: DateRangeFilter
): Promise<GrowthMetricsData> => {
  const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 3))
  const to = dateRange?.to || new Date()

  // Count new users and specialists
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: from,
        lte: to
      }
    }
  })

  const newSpecialists = await prisma.specialist.count({
    where: {
      createdAt: {
        gte: from,
        lte: to
      }
    }
  })

  // Signup trends by date
  const usersByDateRaw: any[] = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as users
    FROM "User"
    WHERE "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `

  const specialistsByDateRaw: any[] = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as specialists
    FROM "Specialist"
    WHERE "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `

  // Merge by date
  const dateMap: Record<string, { users: number; specialists: number }> = {}

  usersByDateRaw.forEach(row => {
    const date = row.date.toISOString().split('T')[0]
    dateMap[date] = { users: Number(row.users), specialists: 0 }
  })

  specialistsByDateRaw.forEach(row => {
    const date = row.date.toISOString().split('T')[0]
    if (!dateMap[date]) {
      dateMap[date] = { users: 0, specialists: Number(row.specialists) }
    } else {
      dateMap[date].specialists = Number(row.specialists)
    }
  })

  const signupTrend = Object.entries(dateMap).map(([date, data]) => ({
    date,
    users: data.users,
    specialists: data.specialists
  }))

  return {
    period: `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`,
    newUsers,
    newSpecialists,
    signupTrend
  }
}

/**
 * Get specialties distribution
 */
export const getSpecialtiesDistribution = async () => {
  const distribution = await prisma.specialist.groupBy({
    by: ['specialty'],
    where: {
      status: 'APPROVED'
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })

  return distribution.map(item => ({
    specialty: item.specialty,
    count: item._count.id
  }))
}

/**
 * Get locations distribution
 */
export const getLocationsDistribution = async () => {
  const distribution = await prisma.specialist.groupBy({
    by: ['location'],
    where: {
      status: 'APPROVED',
      location: {
        not: null
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })

  return distribution.map(item => ({
    location: item.location || 'Unknown',
    count: item._count.id
  }))
}

/**
 * Get quality metrics (no-show rate, cancellation rate, etc.)
 */
export const getQualityMetrics = async () => {
  // Get booking status counts
  const bookingStats = await prisma.booking.groupBy({
    by: ['status'],
    _count: true
  })

  const totalBookings = bookingStats.reduce((sum, stat) => sum + stat._count, 0)
  const noShows = bookingStats.find(s => s.status === 'NO_SHOW')?._count || 0
  const cancelled = bookingStats.find(s => s.status === 'CANCELLED')?._count || 0
  const completed = bookingStats.find(s => s.status === 'COMPLETED')?._count || 0

  const noShowRate = totalBookings > 0 ? (noShows / totalBookings) * 100 : 0
  const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0
  const completionRate = totalBookings > 0 ? (completed / totalBookings) * 100 : 0

  // Get average review rating
  const reviewStats = await prisma.review.aggregate({
    where: {
      status: 'APPROVED'
    },
    _avg: {
      rating: true
    },
    _count: true
  })

  // Get specialist approval rate
  const specialistStats = await prisma.specialist.groupBy({
    by: ['status'],
    _count: true
  })

  const totalSpecialists = specialistStats.reduce((sum, stat) => sum + stat._count, 0)
  const approved = specialistStats.find(s => s.status === 'APPROVED')?._count || 0
  const approvalRate = totalSpecialists > 0 ? (approved / totalSpecialists) * 100 : 0

  return {
    bookings: {
      total: totalBookings,
      noShowRate: Math.round(noShowRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100
    },
    reviews: {
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count
    },
    specialists: {
      total: totalSpecialists,
      approvalRate: Math.round(approvalRate * 100) / 100
    }
  }
}

/**
 * Get time slot analysis
 */
export const getTimeSlotAnalysis = async () => {
  // Get all time slots
  const totalSlots = await prisma.timeSlot.count()
  const bookedSlots = await prisma.timeSlot.count({
    where: { isBooked: true }
  })

  const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0

  // Get most booked time slots (aggregated across all specialists)
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    select: {
      time: true,
      date: true
    }
  })

  // Count by hour
  const hourCount: Record<number, number> = {}
  bookings.forEach(booking => {
    const hour = parseInt(booking.time.split(':')[0])
    hourCount[hour] = (hourCount[hour] || 0) + 1
  })

  const mostBookedHours = Object.entries(hourCount)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Count by day of week
  const dayCount: Record<string, number> = {}
  bookings.forEach(booking => {
    const dayName = booking.date.toLocaleDateString('en-US', { weekday: 'long' })
    dayCount[dayName] = (dayCount[dayName] || 0) + 1
  })

  const mostBookedDays = Object.entries(dayCount)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalSlots,
    bookedSlots,
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    mostBookedHours,
    mostBookedDays
  }
}
