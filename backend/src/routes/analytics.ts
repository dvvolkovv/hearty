import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import {
  getSpecialistDashboard,
  getSpecialistEarnings,
  getSpecialistBookingsTimeline,
  getSpecialistRatingsBreakdown,
  getSpecialistPopularTimes,
  getSpecialistClientInsights,
  getPlatformOverview,
  getPlatformRevenue,
  getPlatformGrowthMetrics,
  getSpecialtiesDistribution,
  getLocationsDistribution,
  getQualityMetrics,
  getTimeSlotAnalysis,
  DateRangeFilter
} from '../services/analytics'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ========================================
// Specialist Analytics Endpoints
// ========================================

/**
 * GET /api/analytics/specialist/:id/dashboard
 *
 * Get specialist dashboard overview with key metrics
 *
 * Query Parameters:
 * - from: Start date (ISO string, optional)
 * - to: End date (ISO string, optional)
 *
 * Returns: Dashboard metrics including bookings, sessions, earnings, ratings
 */
router.get('/specialist/:id/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }
    const { from, to } = req.query

    // Permission check: specialist can only view their own dashboard
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const dateRange: DateRangeFilter = {}
    if (from && typeof from === 'string') dateRange.from = new Date(from)
    if (to && typeof to === 'string') dateRange.to = new Date(to)

    const dashboard = await getSpecialistDashboard(id, dateRange)

    res.json({
      data: dashboard
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/specialist/:id/earnings
 *
 * Get specialist earnings breakdown over time
 *
 * Query Parameters:
 * - from: Start date (ISO string, optional)
 * - to: End date (ISO string, optional)
 *
 * Returns: Total earnings, platform fees, withdrawn amount, pending balance, earnings by date
 */
router.get('/specialist/:id/earnings', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }
    const { from, to } = req.query

    // Permission check
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const dateRange: DateRangeFilter = {}
    if (from && typeof from === 'string') dateRange.from = new Date(from)
    if (to && typeof to === 'string') dateRange.to = new Date(to)

    const earnings = await getSpecialistEarnings(id, dateRange)

    res.json({
      data: earnings
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/specialist/:id/bookings-timeline
 *
 * Get bookings timeline with completion rates
 *
 * Query Parameters:
 * - from: Start date (ISO string, optional)
 * - to: End date (ISO string, optional)
 *
 * Returns: Bookings count by date, status breakdown, completion rates
 */
router.get('/specialist/:id/bookings-timeline', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }
    const { from, to } = req.query

    // Permission check
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const dateRange: DateRangeFilter = {}
    if (from && typeof from === 'string') dateRange.from = new Date(from)
    if (to && typeof to === 'string') dateRange.to = new Date(to)

    const timeline = await getSpecialistBookingsTimeline(id, dateRange)

    res.json({
      data: timeline
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/specialist/:id/ratings-breakdown
 *
 * Get detailed ratings breakdown
 *
 * Returns: Average rating, rating distribution (1-5 stars), category ratings
 */
router.get('/specialist/:id/ratings-breakdown', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }

    // Permission check
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const breakdown = await getSpecialistRatingsBreakdown(id)

    res.json({
      data: breakdown
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/specialist/:id/popular-times
 *
 * Get most popular booking days and hours
 *
 * Returns: Most booked days of week, most booked hours
 */
router.get('/specialist/:id/popular-times', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }

    // Permission check
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const popularTimes = await getSpecialistPopularTimes(id)

    res.json({
      data: popularTimes
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/specialist/:id/client-insights
 *
 * Get client engagement insights
 *
 * Returns: Total clients, repeat clients, average sessions per client, top clients
 */
router.get('/specialist/:id/client-insights', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      throw new AppError('Invalid specialist ID', 400)
    }

    // Permission check
    const user = req.user!
    if (user.role === 'SPECIALIST') {
      const specialist = await req.app.locals.prisma.specialist.findUnique({
        where: { userId: user.id },
        select: { id: true }
      })

      if (specialist?.id !== id) {
        throw new AppError('Forbidden: You can only view your own analytics', 403)
      }
    } else if (user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Only specialists and admins can view specialist analytics', 403)
    }

    const insights = await getSpecialistClientInsights(id)

    res.json({
      data: insights
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Platform Analytics Endpoints (Admin Only)
// ========================================

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError('Forbidden: Admin access required', 403)
  }
  next()
}

/**
 * GET /api/analytics/platform/overview
 *
 * Get platform overview with key KPIs
 *
 * Returns: User counts, booking counts, revenue metrics
 */
router.get('/platform/overview', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const overview = await getPlatformOverview()

    res.json({
      data: overview
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/revenue
 *
 * Get platform revenue metrics over time
 *
 * Query Parameters:
 * - from: Start date (ISO string, optional)
 * - to: End date (ISO string, optional)
 *
 * Returns: Total revenue, platform fees, specialist payouts, revenue by date
 */
router.get('/platform/revenue', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query

    const dateRange: DateRangeFilter = {}
    if (from && typeof from === 'string') dateRange.from = new Date(from)
    if (to && typeof to === 'string') dateRange.to = new Date(to)

    const revenue = await getPlatformRevenue(dateRange)

    res.json({
      data: revenue
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/growth-metrics
 *
 * Get platform growth metrics
 *
 * Query Parameters:
 * - from: Start date (ISO string, optional)
 * - to: End date (ISO string, optional)
 *
 * Returns: New users, new specialists, signup trends over time
 */
router.get('/platform/growth-metrics', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query

    const dateRange: DateRangeFilter = {}
    if (from && typeof from === 'string') dateRange.from = new Date(from)
    if (to && typeof to === 'string') dateRange.to = new Date(to)

    const growth = await getPlatformGrowthMetrics(dateRange)

    res.json({
      data: growth
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/specialties-distribution
 *
 * Get distribution of specialists by specialty
 *
 * Returns: Count of specialists per specialty
 */
router.get('/platform/specialties-distribution', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const distribution = await getSpecialtiesDistribution()

    res.json({
      data: distribution
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/locations-distribution
 *
 * Get distribution of specialists by location
 *
 * Returns: Count of specialists per location
 */
router.get('/platform/locations-distribution', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const distribution = await getLocationsDistribution()

    res.json({
      data: distribution
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/quality-metrics
 *
 * Get platform quality metrics
 *
 * Returns: No-show rate, cancellation rate, average rating, specialist approval rate
 */
router.get('/platform/quality-metrics', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const metrics = await getQualityMetrics()

    res.json({
      data: metrics
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/platform/time-slot-analysis
 *
 * Get time slot utilization analysis
 *
 * Returns: Total slots, booked slots, utilization rate, most popular hours/days
 */
router.get('/platform/time-slot-analysis', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const analysis = await getTimeSlotAnalysis()

    res.json({
      data: analysis
    })
  } catch (error) {
    next(error)
  }
})

export default router
