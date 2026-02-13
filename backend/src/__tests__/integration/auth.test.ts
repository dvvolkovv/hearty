import request from 'supertest'
import app from '../../index'
import { prisma } from '../setupTests'
import { generateTestEmail, generateFirstName, generateLastName } from '../helpers/testData'

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new client successfully', async () => {
      const userData = {
        email: generateTestEmail(),
        password: 'Password123!',
        role: 'CLIENT',
        firstName: generateFirstName(),
        lastName: generateLastName()
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('message', 'Registration successful. Please check your email for verification.')
      expect(response.body).toHaveProperty('userId')

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { client: true }
      })
      expect(user).toBeTruthy()
      expect(user?.role).toBe('CLIENT')
      expect(user?.client).toBeTruthy()
    })

    it('should register a new specialist successfully', async () => {
      const userData = {
        email: generateTestEmail(),
        password: 'Password123!',
        role: 'SPECIALIST',
        firstName: generateFirstName(),
        lastName: generateLastName()
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('userId')

      // Verify specialist was created
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { specialist: true }
      })
      expect(user?.role).toBe('SPECIALIST')
      expect(user?.specialist).toBeTruthy()
    })

    it('should fail with duplicate email', async () => {
      const email = generateTestEmail()
      const userData = {
        email,
        password: 'Password123!',
        role: 'CLIENT',
        firstName: generateFirstName(),
        lastName: generateLastName()
      }

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/already registered/i)
    })

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: generateTestEmail()
          // Missing password and role
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: generateTestEmail(),
          password: '123', // Too short
          role: 'CLIENT'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/at least 6 characters/i)
    })

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: generateTestEmail(),
          password: 'Password123!',
          role: 'INVALID_ROLE'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/invalid role/i)
    })
  })

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: generateTestEmail(),
      password: 'Password123!',
      role: 'CLIENT' as const,
      firstName: 'Test',
      lastName: 'User'
    }

    beforeEach(async () => {
      // Register user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)

      // Manually activate user (verify email)
      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          status: 'ACTIVE',
          emailVerified: true,
          verificationToken: null
        }
      })
    })

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.user.role).toBe('CLIENT')
    })

    // Note: API does not support case-insensitive email lookup
    // Email must match exactly as stored in database

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/invalid credentials/i)
    })

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/invalid credentials/i)
    })

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // Missing password
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should update lastLoginAt timestamp', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      })

      expect(user?.lastLoginAt).toBeTruthy()
      expect(user?.lastLoginAt).toBeInstanceOf(Date)
    })

    it('should fail when email is not verified', async () => {
      // Create unverified user
      const unverifiedEmail = generateTestEmail()
      await request(app)
        .post('/api/auth/register')
        .send({
          email: unverifiedEmail,
          password: 'Password123!',
          role: 'CLIENT'
        })

      // Try to login without verification
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: unverifiedEmail,
          password: 'Password123!'
        })
        .expect(403)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/verify your email/i)
    })
  })

  describe('GET /api/auth/me', () => {
    let authToken: string
    let userId: string
    const testEmail = generateTestEmail()

    beforeEach(async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          role: 'CLIENT',
          firstName: generateFirstName(),
          lastName: generateLastName()
        })

      userId = registerResponse.body.userId

      // Activate user
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          emailVerified: true,
          verificationToken: null
        }
      })

      // Get auth token via login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!'
        })

      authToken = loginResponse.body.token
    })

    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body.user.id).toBe(userId)
      expect(response.body.user).not.toHaveProperty('passwordHash')
    })

    it('should fail without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    it('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', authToken) // Missing 'Bearer' prefix
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    it('should fail with expired token', async () => {
      const jwt = require('jsonwebtoken')
      const expiredToken = jwt.sign(
        { userId, email: testEmail, role: 'CLIENT' },
        process.env.JWT_SECRET || 'test_jwt_secret_key_for_integration_tests_only',
        { expiresIn: '-1h' } // Expired 1 hour ago
      )

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email with valid token', async () => {
      const userData = {
        email: generateTestEmail(),
        password: 'Password123!',
        role: 'CLIENT',
        firstName: generateFirstName(),
        lastName: generateLastName()
      }

      // Register user
      await request(app)
        .post('/api/auth/register')
        .send(userData)

      // Get verification token from database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      expect(user?.verificationToken).toBeTruthy()

      // Verify email
      const response = await request(app)
        .get(`/api/auth/verify-email/${user!.verificationToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Email verified successfully')

      // Check user is now verified
      const verifiedUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      expect(verifiedUser?.emailVerified).toBe(true)
      expect(verifiedUser?.status).toBe('ACTIVE')
      expect(verifiedUser?.verificationToken).toBeNull()
    })

    it('should fail with invalid verification token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid_token_12345')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/invalid verification token/i)
    })
  })
})
