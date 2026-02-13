import request from 'supertest'
import app from '../../index'
import { prisma } from '../setupTests'
import { generateTestEmail, generateFirstName, generateLastName } from '../helpers/testData'

describe('Specialists API Integration Tests', () => {
  // Helper to create a specialist with APPROVED status
  const createApprovedSpecialist = async (data?: Partial<any>) => {
    const email = generateTestEmail()
    const password = 'Password123!'

    // Register as specialist
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password,
        role: 'SPECIALIST',
        firstName: generateFirstName(),
        lastName: generateLastName()
      })

    const userId = registerResponse.body.userId

    // Get specialist record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    // Update specialist to APPROVED status and set additional data
    const updatedSpecialist = await prisma.specialist.update({
      where: { id: user!.specialist!.id },
      data: {
        status: 'APPROVED',
        specialty: data?.specialty || 'Психолог',
        description: data?.description || 'Опытный специалист',
        price: data?.price || 5000,
        location: data?.location || 'Москва',
        format: data?.format || ['online', 'offline'],
        tags: data?.tags || ['тревожность', 'стресс'],
        rating: data?.rating || 4.5,
        totalReviews: data?.totalReviews || 10,
        experience: data?.experience || 5,
        ...data
      }
    })

    // Activate user for auth purposes
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        emailVerified: true,
        verificationToken: null
      }
    })

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email, password })

    return {
      specialist: updatedSpecialist,
      user: user!,
      token: loginResponse.body.token
    }
  }

  describe('GET /api/specialists', () => {
    beforeEach(async () => {
      // Create multiple specialists with different data
      await createApprovedSpecialist({
        specialty: 'Психолог',
        price: 3000,
        rating: 4.8,
        location: 'Москва',
        format: ['online']
      })
      await createApprovedSpecialist({
        specialty: 'Психотерапевт',
        price: 7000,
        rating: 4.2,
        location: 'Санкт-Петербург',
        format: ['offline']
      })
      await createApprovedSpecialist({
        specialty: 'Коуч',
        price: 5000,
        rating: 4.9,
        location: 'Москва',
        format: ['online', 'offline']
      })
    })

    it('should get list of specialists with pagination', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty('specialists')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.specialists)).toBe(true)
      expect(response.body.specialists.length).toBeGreaterThan(0)
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10
      })
    })

    it('should filter specialists by specialty', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ specialty: 'Психолог' })
        .expect(200)

      expect(response.body.specialists.length).toBeGreaterThan(0)
      response.body.specialists.forEach((spec: any) => {
        expect(spec.specialty.toLowerCase()).toContain('психолог')
      })
    })

    it('should filter specialists by price range', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ minPrice: 4000, maxPrice: 6000 })
        .expect(200)

      response.body.specialists.forEach((spec: any) => {
        expect(spec.price).toBeGreaterThanOrEqual(4000)
        expect(spec.price).toBeLessThanOrEqual(6000)
      })
    })

    it('should filter specialists by minimum rating', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ minRating: 4.5 })
        .expect(200)

      response.body.specialists.forEach((spec: any) => {
        expect(spec.rating).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should filter specialists by location', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ location: 'Москва' })
        .expect(200)

      expect(response.body.specialists.length).toBeGreaterThan(0)
      response.body.specialists.forEach((spec: any) => {
        expect(spec.location.toLowerCase()).toContain('москва')
      })
    })

    it('should filter specialists by format', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ format: 'online' })
        .expect(200)

      response.body.specialists.forEach((spec: any) => {
        expect(spec.format).toContain('online')
      })
    })

    it('should search specialists by name, specialty, or description', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ search: 'Психолог' })
        .expect(200)

      expect(response.body.specialists.length).toBeGreaterThan(0)
    })

    it('should sort specialists by rating descending', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ sortBy: 'rating', order: 'desc' })
        .expect(200)

      const ratings = response.body.specialists.map((s: any) => s.rating)
      for (let i = 0; i < ratings.length - 1; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1])
      }
    })

    it('should sort specialists by price ascending', async () => {
      const response = await request(app)
        .get('/api/specialists')
        .query({ sortBy: 'price', order: 'asc' })
        .expect(200)

      const prices = response.body.specialists.map((s: any) => s.price)
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1])
      }
    })

    it('should only show APPROVED specialists', async () => {
      // Create a PENDING specialist
      const email = generateTestEmail()
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Password123!',
          role: 'SPECIALIST'
        })

      const response = await request(app)
        .get('/api/specialists')
        .expect(200)

      // PENDING specialist should not be in the list
      response.body.specialists.forEach((spec: any) => {
        expect(spec.status).toBe('APPROVED')
      })
    })

    it('should handle pagination correctly', async () => {
      const response1 = await request(app)
        .get('/api/specialists')
        .query({ page: 1, limit: 2 })
        .expect(200)

      expect(response1.body.specialists.length).toBeLessThanOrEqual(2)
      expect(response1.body.pagination.totalPages).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/specialists/:id', () => {
    let specialistId: string

    beforeEach(async () => {
      const { specialist } = await createApprovedSpecialist({
        specialty: 'Психолог',
        description: 'Опытный психолог',
        fullDescription: 'Детальное описание...',
        price: 5000
      })
      specialistId = specialist.id
    })

    it('should get specialist profile by id', async () => {
      const response = await request(app)
        .get(`/api/specialists/${specialistId}`)
        .expect(200)

      expect(response.body).toHaveProperty('specialist')
      expect(response.body.specialist.id).toBe(specialistId)
      expect(response.body.specialist).toHaveProperty('user')
      expect(response.body.specialist).toHaveProperty('reviews')
      expect(response.body.specialist).toHaveProperty('timeSlots')
    })

    it('should return 404 for non-existent specialist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await request(app)
        .get(`/api/specialists/${fakeId}`)
        .expect(404)
    })

    it('should return 403 for non-approved specialist', async () => {
      // Create PENDING specialist
      const email = generateTestEmail()
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Password123!',
          role: 'SPECIALIST'
        })

      const user = await prisma.user.findUnique({
        where: { id: registerResponse.body.userId },
        include: { specialist: true }
      })

      const response = await request(app)
        .get(`/api/specialists/${user!.specialist!.id}`)
        .expect(403)

      expect(response.body.error).toMatch(/not available/i)
    })
  })

  describe('PUT /api/specialists/:id', () => {
    let specialistId: string
    let authToken: string
    let otherToken: string

    beforeEach(async () => {
      const { specialist, token } = await createApprovedSpecialist({
        specialty: 'Психолог',
        price: 5000
      })
      specialistId = specialist.id
      authToken = token

      // Create another specialist for testing access control
      const other = await createApprovedSpecialist()
      otherToken = other.token
    })

    it('should update specialist profile with valid auth', async () => {
      const updateData = {
        name: 'Updated Name',
        specialty: 'Психотерапевт',
        price: 7000,
        description: 'Updated description',
        location: 'Санкт-Петербург'
      }

      const response = await request(app)
        .put(`/api/specialists/${specialistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('specialist')
      expect(response.body.specialist.name).toBe(updateData.name)
      expect(response.body.specialist.specialty).toBe(updateData.specialty)
      expect(response.body.specialist.price).toBe(updateData.price)
    })

    it('should fail without authentication', async () => {
      await request(app)
        .put(`/api/specialists/${specialistId}`)
        .send({ name: 'Updated Name' })
        .expect(401)
    })

    it('should fail when trying to update another specialist profile', async () => {
      const response = await request(app)
        .put(`/api/specialists/${specialistId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Updated Name' })
        .expect(403)

      expect(response.body.error).toMatch(/access denied/i)
    })

    it('should return 404 for non-existent specialist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await request(app)
        .put(`/api/specialists/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404)
    })

    it('should update only provided fields', async () => {
      const originalResponse = await request(app)
        .get(`/api/specialists/${specialistId}`)

      const originalPrice = originalResponse.body.specialist.price

      // Update only name
      await request(app)
        .put(`/api/specialists/${specialistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name Only' })
        .expect(200)

      const updatedResponse = await request(app)
        .get(`/api/specialists/${specialistId}`)

      expect(updatedResponse.body.specialist.name).toBe('New Name Only')
      expect(updatedResponse.body.specialist.price).toBe(originalPrice)
    })
  })

  describe('GET /api/specialists/:id/availability', () => {
    let specialistId: string
    let authToken: string

    beforeEach(async () => {
      const { specialist, token } = await createApprovedSpecialist()
      specialistId = specialist.id
      authToken = token

      // Create some time slots
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      await prisma.timeSlot.createMany({
        data: [
          {
            specialistId,
            date: tomorrow,
            time: '10:00',
            isBooked: false
          },
          {
            specialistId,
            date: tomorrow,
            time: '14:00',
            isBooked: false
          },
          {
            specialistId,
            date: tomorrow,
            time: '16:00',
            isBooked: true
          }
        ]
      })
    })

    it('should get available time slots', async () => {
      const response = await request(app)
        .get(`/api/specialists/${specialistId}/availability`)
        .expect(200)

      expect(response.body).toHaveProperty('timeSlots')
      expect(Array.isArray(response.body.timeSlots)).toBe(true)

      // Should only return non-booked slots
      response.body.timeSlots.forEach((slot: any) => {
        expect(slot.isBooked).toBe(false)
      })
    })

    it('should filter slots by date range', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date(tomorrow)
      dayAfter.setDate(dayAfter.getDate() + 1)

      const response = await request(app)
        .get(`/api/specialists/${specialistId}/availability`)
        .query({
          startDate: tomorrow.toISOString(),
          endDate: dayAfter.toISOString()
        })
        .expect(200)

      expect(response.body.timeSlots.length).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent specialist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await request(app)
        .get(`/api/specialists/${fakeId}/availability`)
        .expect(404)
    })
  })

  describe('POST /api/specialists/:id/availability', () => {
    let specialistId: string
    let authToken: string
    let otherToken: string

    beforeEach(async () => {
      const { specialist, token } = await createApprovedSpecialist()
      specialistId = specialist.id
      authToken = token

      const other = await createApprovedSpecialist()
      otherToken = other.token
    })

    it('should create availability slots with valid auth', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const slotsData = {
        slots: [
          { date: tomorrow.toISOString(), time: '10:00' },
          { date: tomorrow.toISOString(), time: '14:00' },
          { date: tomorrow.toISOString(), time: '16:00' }
        ]
      }

      const response = await request(app)
        .post(`/api/specialists/${specialistId}/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(slotsData)
        .expect(201)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('slots')
      expect(response.body.slots.length).toBe(3)
    })

    it('should fail without authentication', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      await request(app)
        .post(`/api/specialists/${specialistId}/availability`)
        .send({
          slots: [{ date: tomorrow.toISOString(), time: '10:00' }]
        })
        .expect(401)
    })

    it('should fail when trying to set availability for another specialist', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const response = await request(app)
        .post(`/api/specialists/${specialistId}/availability`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          slots: [{ date: tomorrow.toISOString(), time: '10:00' }]
        })
        .expect(403)

      expect(response.body.error).toMatch(/access denied/i)
    })

    it('should fail with invalid slots data', async () => {
      await request(app)
        .post(`/api/specialists/${specialistId}/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ slots: [] })
        .expect(400)
    })

    it('should fail with missing date or time', async () => {
      const response = await request(app)
        .post(`/api/specialists/${specialistId}/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          slots: [{ date: new Date().toISOString() }] // Missing time
        })
        .expect(400)

      expect(response.body.error).toMatch(/date and time are required/i)
    })
  })
})
