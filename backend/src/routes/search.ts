import { Router } from 'express'
import {
  searchSpecialists,
  getSuggestions,
  getPopularTags,
  getSpecialties,
  getLocations,
  SearchFilters
} from '../services/search'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// ========================================
// Main Search Endpoint
// ========================================

/**
 * GET /api/search
 *
 * Full-text search with filters and pagination
 *
 * Query Parameters:
 * - q: Search query (text)
 * - specialty: Filter by specialty
 * - tags: Filter by tags (comma-separated)
 * - format: Filter by format (comma-separated: "Онлайн,Лично")
 * - location: Filter by location
 * - minPrice: Minimum price (in kopecks)
 * - maxPrice: Maximum price (in kopecks)
 * - minRating: Minimum rating (0-5)
 * - minReviews: Minimum number of reviews
 * - minExperience: Minimum years of experience
 * - hasAvailability: Only show specialists with available slots (true/false)
 * - availableFrom: Available from date (ISO string)
 * - availableTo: Available to date (ISO string)
 * - sortBy: Sort field (relevance|rating|price|experience|reviews)
 * - sortOrder: Sort order (asc|desc)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 12, max: 50)
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      specialty,
      tags,
      format,
      location,
      minPrice,
      maxPrice,
      minRating,
      minReviews,
      minExperience,
      hasAvailability,
      availableFrom,
      availableTo,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query

    // Parse filters
    const filters: SearchFilters = {}

    if (q) filters.query = q as string
    if (specialty) filters.specialty = specialty as string
    if (tags) filters.tags = (tags as string).split(',').map(t => t.trim())
    if (format) filters.format = (format as string).split(',').map(f => f.trim())
    if (location) filters.location = location as string

    if (minPrice) filters.minPrice = parseInt(minPrice as string, 10)
    if (maxPrice) filters.maxPrice = parseInt(maxPrice as string, 10)
    if (minRating) filters.minRating = parseFloat(minRating as string)
    if (minReviews) filters.minReviews = parseInt(minReviews as string, 10)
    if (minExperience) filters.minExperience = parseInt(minExperience as string, 10)

    if (hasAvailability === 'true') filters.hasAvailability = true
    if (availableFrom) filters.availableFrom = new Date(availableFrom as string)
    if (availableTo) filters.availableTo = new Date(availableTo as string)

    if (sortBy) {
      const validSortFields = ['relevance', 'rating', 'price', 'experience', 'reviews']
      if (validSortFields.includes(sortBy as string)) {
        filters.sortBy = sortBy as any
      }
    }

    if (sortOrder) {
      if (sortOrder === 'asc' || sortOrder === 'desc') {
        filters.sortOrder = sortOrder
      }
    }

    if (page) filters.page = parseInt(page as string, 10)
    if (limit) {
      const limitNum = parseInt(limit as string, 10)
      filters.limit = Math.min(limitNum, 50) // Max 50 results per page
    }

    // Execute search
    const result = await searchSpecialists(filters)

    res.json(result)
  } catch (error) {
    next(error)
  }
})

// ========================================
// Autocomplete / Suggestions
// ========================================

/**
 * GET /api/search/suggestions
 *
 * Get search suggestions for autocomplete
 *
 * Query Parameters:
 * - q: Query string (required, min 2 chars)
 * - limit: Max suggestions (default: 10, max: 20)
 */
router.get('/suggestions', async (req, res, next) => {
  try {
    const { q, limit } = req.query

    if (!q || (q as string).length < 2) {
      throw new AppError('Query must be at least 2 characters', 400)
    }

    const limitNum = limit
      ? Math.min(parseInt(limit as string, 10), 20)
      : 10

    const suggestions = await getSuggestions(q as string, limitNum)

    res.json({
      data: suggestions
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Popular Tags
// ========================================

/**
 * GET /api/search/tags
 *
 * Get most popular tags
 *
 * Query Parameters:
 * - limit: Max tags (default: 20, max: 50)
 */
router.get('/tags', async (req, res, next) => {
  try {
    const { limit } = req.query

    const limitNum = limit
      ? Math.min(parseInt(limit as string, 10), 50)
      : 20

    const tags = await getPopularTags(limitNum)

    res.json({
      data: tags
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Specialties
// ========================================

/**
 * GET /api/search/specialties
 *
 * Get list of all unique specialties
 */
router.get('/specialties', async (req, res, next) => {
  try {
    const specialties = await getSpecialties()

    res.json({
      data: specialties
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Locations
// ========================================

/**
 * GET /api/search/locations
 *
 * Get list of all unique locations
 */
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await getLocations()

    res.json({
      data: locations
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Search Stats
// ========================================

/**
 * GET /api/search/stats
 *
 * Get search statistics and metadata
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [tags, specialties, locations] = await Promise.all([
      getPopularTags(10),
      getSpecialties(),
      getLocations()
    ])

    res.json({
      data: {
        popularTags: tags,
        totalSpecialties: specialties.length,
        totalLocations: locations.length,
        availableFormats: ['Онлайн', 'Лично']
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
