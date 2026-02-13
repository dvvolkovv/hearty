# Test Users for WebSocket Testing

## Quick Test User Creation

You need at least 2 test accounts to test chat functionality:
1. **CLIENT** account
2. **SPECIALIST** account

---

## Method 1: Via Backend Script (Recommended)

Create a test user creation script:

```bash
cd backend
node create-test-users.js
```

**create-test-users.js:**
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  // Create CLIENT user
  const clientPassword = await bcrypt.hash('test123', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@test.com',
      password: clientPassword,
      firstName: 'Тестовый',
      lastName: 'Клиент',
      role: 'CLIENT',
      isVerified: true,
    },
  });

  const client = await prisma.client.create({
    data: {
      userId: clientUser.id,
      name: 'Тестовый Клиент',
    },
  });

  console.log('✅ CLIENT created:', {
    email: 'client@test.com',
    password: 'test123',
    userId: clientUser.id,
    clientId: client.id,
  });

  // Create SPECIALIST user
  const specialistPassword = await bcrypt.hash('test123', 10);
  const specialistUser = await prisma.user.create({
    data: {
      email: 'specialist@test.com',
      password: specialistPassword,
      firstName: 'Тестовый',
      lastName: 'Психолог',
      role: 'SPECIALIST',
      isVerified: true,
    },
  });

  const specialist = await prisma.specialist.create({
    data: {
      userId: specialistUser.id,
      name: 'Тестовый Психолог',
      specialty: 'Клинический психолог',
      bio: 'Тестовый аккаунт для проверки WebSocket',
      hourlyRate: 2000,
      status: 'APPROVED',
    },
  });

  console.log('✅ SPECIALIST created:', {
    email: 'specialist@test.com',
    password: 'test123',
    userId: specialistUser.id,
    specialistId: specialist.id,
  });

  await prisma.$disconnect();
}

createTestUsers()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
```

---

## Method 2: Via API (Register Endpoints)

Use Postman, curl, or browser console:

### Create CLIENT:
```bash
curl -X POST https://YOUR_BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "test123",
    "firstName": "Тестовый",
    "lastName": "Клиент",
    "role": "CLIENT"
  }'
```

### Create SPECIALIST:
```bash
curl -X POST https://YOUR_BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "specialist@test.com",
    "password": "test123",
    "firstName": "Тестовый",
    "lastName": "Психолог",
    "role": "SPECIALIST",
    "specialty": "Клинический психолог",
    "bio": "Тестовый аккаунт",
    "hourlyRate": 2000
  }'
```

**Then approve specialist via database:**
```sql
UPDATE "Specialist"
SET status = 'APPROVED'
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'specialist@test.com');
```

---

## Method 3: Via Database (Direct SQL)

```sql
-- 1. Create CLIENT user
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'client@test.com',
  '$2a$10$...',  -- bcrypt hash of 'test123'
  'Тестовый',
  'Клиент',
  'CLIENT',
  true,
  NOW(),
  NOW()
);

-- Get the userId
SELECT id FROM "User" WHERE email = 'client@test.com';

-- 2. Create Client profile
INSERT INTO "Client" (id, "userId", name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'USER_ID_FROM_ABOVE',
  'Тестовый Клиент',
  NOW(),
  NOW()
);

-- 3. Create SPECIALIST user (similar process)
-- ...
```

---

## Test User Credentials

After creation, use these credentials:

### CLIENT Account:
- **Email:** `client@test.com`
- **Password:** `test123`
- **Role:** CLIENT

### SPECIALIST Account:
- **Email:** `specialist@test.com`
- **Password:** `test123`
- **Role:** SPECIALIST
- **Status:** APPROVED

---

## Verify Users Created

```sql
-- Check users exist
SELECT id, email, role, "isVerified"
FROM "User"
WHERE email IN ('client@test.com', 'specialist@test.com');

-- Check CLIENT profile
SELECT c.id, c.name, u.email
FROM "Client" c
JOIN "User" u ON c."userId" = u.id
WHERE u.email = 'client@test.com';

-- Check SPECIALIST profile
SELECT s.id, s.name, s.specialty, s.status, u.email
FROM "Specialist" s
JOIN "User" u ON s."userId" = u.id
WHERE u.email = 'specialist@test.com';
```

**Expected Output:**
- ✅ 2 users in User table
- ✅ 1 Client record
- ✅ 1 Specialist record with status='APPROVED'

---

## Ready to Test!

Once test users are created:
1. Open 2 browser windows (or use Incognito for one)
2. **Window 1:** Login as `client@test.com`
3. **Window 2:** Login as `specialist@test.com`
4. Start testing WebSocket features!

See [QUICK_WEBSOCKET_TEST.md](./QUICK_WEBSOCKET_TEST.md) for test procedures.
