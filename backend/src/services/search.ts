import prisma from '../config/database'
import { Prisma } from '@prisma/client'

// ========================================
// Search Filters Interface
// ========================================

export interface SearchFilters {
  // Text search
  query?: string

  // Category filters
  specialty?: string
  tags?: string[]
  format?: string[]  // ["Онлайн", "Лично"]
  location?: string

  // Price filters
  minPrice?: number
  maxPrice?: number

  // Quality filters
  minRating?: number
  minReviews?: number
  minExperience?: number

  // Availability filters
  hasAvailability?: boolean
  availableFrom?: Date
  availableTo?: Date

  // Sorting
  sortBy?: 'relevance' | 'rating' | 'price' | 'experience' | 'reviews'
  sortOrder?: 'asc' | 'desc'

  // Pagination
  page?: number
  limit?: number
}

// ========================================
// Full-Text Search
// ========================================

/**
 * Search specialists using PostgreSQL full-text search
 */
export const searchSpecialists = async (filters: SearchFilters) => {
  const {
    query,
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
    sortBy = 'relevance',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = filters

  // Build WHERE clause
  const where: any = {
    status: 'APPROVED' // Only show approved specialists
  }

  // Full-text search using tsvector
  if (query && query.trim()) {
    // Note: We'll use raw SQL for full-text search with ranking
    const specialists = await searchWithFullText({
      query,
      where,
      sortBy,
      sortOrder,
      page,
      limit,
      ...filters
    })
    return specialists
  }

  // Specialty filter
  if (specialty) {
    where.specialty = {
      contains: specialty,
      mode: 'insensitive'
    }
  }

  // Tags filter (match any tag)
  if (tags && tags.length > 0) {
    where.tags = {
      hasSome: tags
    }
  }

  // Format filter
  if (format && format.length > 0) {
    where.format = {
      hasSome: format
    }
  }

  // Location filter
  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive'
    }
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  // Rating filter
  if (minRating !== undefined) {
    where.rating = {
      gte: minRating
    }
  }

  // Reviews filter
  if (minReviews !== undefined) {
    where.totalReviews = {
      gte: minReviews
    }
  }

  // Experience filter
  if (minExperience !== undefined) {
    where.experience = {
      gte: minExperience
    }
  }

  // Build ORDER BY clause
  const orderBy: any = []

  if (sortBy === 'rating') {
    orderBy.push({ rating: sortOrder })
  } else if (sortBy === 'price') {
    orderBy.push({ price: sortOrder })
  } else if (sortBy === 'experience') {
    orderBy.push({ experience: sortOrder })
  } else if (sortBy === 'reviews') {
    orderBy.push({ totalReviews: sortOrder })
  } else {
    // Default: newest first
    orderBy.push({ createdAt: 'desc' })
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Execute query
  const [specialists, total] = await Promise.all([
    prisma.specialist.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        specialty: true,
        description: true,
        price: true,
        location: true,
        format: true,
        tags: true,
        rating: true,
        totalReviews: true,
        experience: true,
        image: true,
        sessionDuration: true,
        createdAt: true
      }
    }),
    prisma.specialist.count({ where })
  ])

  // Add availability info if requested
  if (hasAvailability) {
    const specialistsWithAvailability = await Promise.all(
      specialists.map(async (specialist) => {
        const availabilityWhere: any = {
          specialistId: specialist.id,
          isBooked: false,
          date: {
            gte: availableFrom || new Date()
          }
        }

        if (availableTo) {
          availabilityWhere.date.lte = availableTo
        }

        const slotsCount = await prisma.timeSlot.count({
          where: availabilityWhere
        })

        return {
          ...specialist,
          hasAvailability: slotsCount > 0,
          availableSlotsCount: slotsCount
        }
      })
    )

    // Filter out specialists without availability
    const filtered = specialistsWithAvailability.filter(s => s.hasAvailability)

    return {
      data: filtered,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    }
  }

  return {
    data: specialists,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Full-text search with PostgreSQL tsvector and ranking
 */
const searchWithFullText = async (params: any) => {
  const {
    query,
    specialty,
    tags,
    format,
    location,
    minPrice,
    maxPrice,
    minRating,
    minReviews,
    minExperience,
    sortBy,
    sortOrder,
    page,
    limit
  } = params

  // Prepare search query for Russian
  const searchQuery = query.trim().split(/\s+/).join(' & ')

  // Build SQL conditions
  const conditions: string[] = [`status = 'APPROVED'`]
  const parameters: any[] = [searchQuery]

  let paramIndex = 2

  if (specialty) {
    conditions.push(`specialty ILIKE $${paramIndex}`)
    parameters.push(`%${specialty}%`)
    paramIndex++
  }

  if (tags && tags.length > 0) {
    conditions.push(`tags && ARRAY[$${paramIndex}]::text[]`)
    parameters.push(tags)
    paramIndex++
  }

  if (format && format.length > 0) {
    conditions.push(`format && ARRAY[$${paramIndex}]::text[]`)
    parameters.push(format)
    paramIndex++
  }

  if (location) {
    conditions.push(`location ILIKE $${paramIndex}`)
    parameters.push(`%${location}%`)
    paramIndex++
  }

  if (minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex}`)
    parameters.push(minPrice)
    paramIndex++
  }

  if (maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex}`)
    parameters.push(maxPrice)
    paramIndex++
  }

  if (minRating !== undefined) {
    conditions.push(`rating >= $${paramIndex}`)
    parameters.push(minRating)
    paramIndex++
  }

  if (minReviews !== undefined) {
    conditions.push(`"totalReviews" >= $${paramIndex}`)
    parameters.push(minReviews)
    paramIndex++
  }

  if (minExperience !== undefined) {
    conditions.push(`experience >= $${paramIndex}`)
    parameters.push(minExperience)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')

  // Build ORDER BY clause
  let orderByClause = ''
  if (sortBy === 'relevance') {
    orderByClause = 'ORDER BY rank DESC, rating DESC'
  } else if (sortBy === 'rating') {
    orderByClause = `ORDER BY rating ${sortOrder.toUpperCase()}, rank DESC`
  } else if (sortBy === 'price') {
    orderByClause = `ORDER BY price ${sortOrder.toUpperCase()}, rank DESC`
  } else if (sortBy === 'experience') {
    orderByClause = `ORDER BY experience ${sortOrder.toUpperCase()}, rank DESC`
  } else if (sortBy === 'reviews') {
    orderByClause = `ORDER BY "totalReviews" ${sortOrder.toUpperCase()}, rank DESC`
  } else {
    orderByClause = 'ORDER BY rank DESC, rating DESC'
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Execute full-text search with ranking
  const sql = `
    SELECT
      id,
      name,
      specialty,
      description,
      price,
      location,
      format,
      tags,
      rating,
      "totalReviews",
      experience,
      image,
      "sessionDuration",
      "createdAt",
      ts_rank("searchVector", to_tsquery('russian', $1)) as rank
    FROM "Specialist"
    WHERE "searchVector" @@ to_tsquery('russian', $1) AND ${whereClause}
    ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  parameters.push(limit, skip)

  // Get total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM "Specialist"
    WHERE "searchVector" @@ to_tsquery('russian', $1) AND ${whereClause}
  `

  const [specialists, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(sql, ...parameters),
    prisma.$queryRawUnsafe(countSql, ...parameters.slice(0, -2))
  ])

  const total = Number((countResult as any)[0].total)

  return {
    data: specialists,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// ========================================
// Autocomplete / Suggestions
// ========================================

/**
 * Get search suggestions based on query
 */
export const getSuggestions = async (query: string, limit: number = 10) => {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchQuery = `%${query.trim()}%`

  // Search in names and specialties
  const specialists = await prisma.specialist.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          specialty: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    },
    select: {
      name: true,
      specialty: true
    },
    take: limit
  })

  // Extract unique suggestions
  const suggestions = new Set<string>()

  specialists.forEach(s => {
    if (s.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(s.name)
    }
    if (s.specialty.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(s.specialty)
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

// ========================================
// Popular Tags
// ========================================

/**
 * Get most popular tags
 */
export const getPopularTags = async (limit: number = 20) => {
  // Get all tags from approved specialists
  const specialists = await prisma.specialist.findMany({
    where: {
      status: 'APPROVED'
    },
    select: {
      tags: true
    }
  })

  // Count tag frequency
  const tagCounts = new Map<string, number>()

  specialists.forEach(s => {
    s.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  // Sort by frequency
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))

  return sortedTags
}

// ========================================
// Specialties
// ========================================

/**
 * Get list of unique specialties
 */
export const getSpecialties = async () => {
  const specialists = await prisma.specialist.findMany({
    where: {
      status: 'APPROVED'
    },
    select: {
      specialty: true
    },
    distinct: ['specialty']
  })

  return specialists.map(s => s.specialty).sort()
}

// ========================================
// Locations
// ========================================

/**
 * Get list of unique locations
 */
export const getLocations = async () => {
  const specialists = await prisma.specialist.findMany({
    where: {
      status: 'APPROVED',
      location: {
        not: null
      }
    },
    select: {
      location: true
    },
    distinct: ['location']
  })

  return specialists
    .map(s => s.location)
    .filter((loc): loc is string => loc !== null)
    .sort()
}
