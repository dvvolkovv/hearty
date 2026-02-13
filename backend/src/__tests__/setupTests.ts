import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Global test database
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db'
    }
  }
})

// Setup: run migrations and seed test DB
beforeAll(async () => {
  console.log('🧪 Setting up test environment...')

  // Note: For PostgreSQL, ensure test database exists before running tests
  // We rely on existing migrations being applied to the test database

  try {
    // Verify connection to test database
    await prisma.$connect()
    console.log('✅ Connected to test database')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('Make sure PostgreSQL test database exists and DATABASE_URL in .env.test is correct')
    throw error
  }
})

// Cleanup after each test
afterEach(async () => {
  // Clean up all tables (in reverse order of foreign key dependencies)
  const tables = [
    'Message',
    'ChatRoom',
    'Session',
    'Review',
    'Transaction',
    'WithdrawalRequest',
    'Booking',
    'TimeSlot',
    'ClientNote',
    'Notification',
    'AIConversation',
    'Specialist',
    'Client',
    'User'
  ]

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`)
  }
})

// Teardown: close connections
afterAll(async () => {
  await prisma.$disconnect()
  console.log('🧹 Test environment cleaned up')
})

// Helper to create test JWT token
export const generateTestToken = (payload: { userId: string; email: string; role: string }) => {
  const jwt = require('jsonwebtoken')
  const config = require('../config/env').default
  return jwt.sign(payload, config.jwtSecret || 'test_jwt_secret_key_for_integration_tests_only', {
    expiresIn: '1h'
  })
}

// Helper to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 10)
}
