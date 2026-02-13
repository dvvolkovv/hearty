-- Add indexes for Analytics API performance optimization

-- ========================================
-- Booking Model Indexes
-- ========================================
-- For specialist analytics: earnings timeline, bookings by specialist
CREATE INDEX IF NOT EXISTS "Booking_specialistId_createdAt_idx" ON "Booking"("specialistId", "createdAt");

-- For platform analytics: bookings by status over time
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- ========================================
-- Transaction Model Indexes
-- ========================================
-- For specialist earnings queries
CREATE INDEX IF NOT EXISTS "Transaction_specialistId_createdAt_idx" ON "Transaction"("specialistId", "createdAt");

-- For platform revenue analytics by status
CREATE INDEX IF NOT EXISTS "Transaction_status_createdAt_idx" ON "Transaction"("status", "createdAt");

-- For revenue breakdown by transaction type
CREATE INDEX IF NOT EXISTS "Transaction_type_createdAt_idx" ON "Transaction"("type", "createdAt");

-- For specialist balance calculations
CREATE INDEX IF NOT EXISTS "Transaction_specialistId_status_idx" ON "Transaction"("specialistId", "status");

-- ========================================
-- Review Model Indexes
-- ========================================
-- For rating trends over time per specialist
CREATE INDEX IF NOT EXISTS "Review_specialistId_createdAt_idx" ON "Review"("specialistId", "createdAt");

-- ========================================
-- Session Model Indexes
-- ========================================
-- For specialist session completion analytics
CREATE INDEX IF NOT EXISTS "Session_specialistId_createdAt_idx" ON "Session"("specialistId", "createdAt");

-- For client engagement analytics
CREATE INDEX IF NOT EXISTS "Session_clientId_createdAt_idx" ON "Session"("clientId", "createdAt");

-- ========================================
-- Specialist Model Indexes
-- ========================================
-- For specialty distribution analytics
CREATE INDEX IF NOT EXISTS "Specialist_specialty_idx" ON "Specialist"("specialty");

-- For location distribution analytics
CREATE INDEX IF NOT EXISTS "Specialist_location_idx" ON "Specialist"("location");

-- For growth metrics (new specialists over time)
CREATE INDEX IF NOT EXISTS "Specialist_status_createdAt_idx" ON "Specialist"("status", "createdAt");
