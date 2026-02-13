/**
 * Create test users for WebSocket testing
 *
 * Usage:
 *   npx ts-node create-websocket-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating WebSocket test users...\n');

  try {
    // Create CLIENT user
    const clientPassword = await bcrypt.hash('test123', 10);

    const clientUser = await prisma.user.upsert({
      where: { email: 'wsclient@test.com' },
      update: {},
      create: {
        email: 'wsclient@test.com',
        password: clientPassword,
        firstName: 'WebSocket',
        lastName: 'Client',
        role: 'CLIENT',
        isVerified: true,
      },
    });

    const client = await prisma.client.upsert({
      where: { userId: clientUser.id },
      update: {},
      create: {
        userId: clientUser.id,
        name: 'WebSocket Test Client',
      },
    });

    console.log('✅ CLIENT created:');
    console.log('   Email:    wsclient@test.com');
    console.log('   Password: test123');
    console.log('   User ID:  ', clientUser.id);
    console.log('   Client ID:', client.id);
    console.log('');

    // Create SPECIALIST user
    const specialistPassword = await bcrypt.hash('test123', 10);

    const specialistUser = await prisma.user.upsert({
      where: { email: 'wsspecialist@test.com' },
      update: {},
      create: {
        email: 'wsspecialist@test.com',
        password: specialistPassword,
        firstName: 'WebSocket',
        lastName: 'Specialist',
        role: 'SPECIALIST',
        isVerified: true,
      },
    });

    const specialist = await prisma.specialist.upsert({
      where: { userId: specialistUser.id },
      update: {},
      create: {
        userId: specialistUser.id,
        name: 'WebSocket Test Specialist',
        specialty: 'Клинический психолог',
        bio: 'Test account for WebSocket functionality',
        hourlyRate: 2000,
        status: 'APPROVED',
      },
    });

    console.log('✅ SPECIALIST created:');
    console.log('   Email:        wsspecialist@test.com');
    console.log('   Password:     test123');
    console.log('   User ID:      ', specialistUser.id);
    console.log('   Specialist ID:', specialist.id);
    console.log('   Status:       ', specialist.status);
    console.log('');

    // Create a chat room between them
    const chatRoom = await prisma.chatRoom.upsert({
      where: {
        clientId_specialistId: {
          clientId: client.id,
          specialistId: specialist.id,
        },
      },
      update: {},
      create: {
        clientId: client.id,
        specialistId: specialist.id,
      },
    });

    console.log('✅ Chat room created:');
    console.log('   Room ID:', chatRoom.id);
    console.log('');

    console.log('🎉 Test users ready!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Open 2 browser windows');
    console.log('   2. Window 1: Login as wsclient@test.com');
    console.log('   3. Window 2: Login as wsspecialist@test.com');
    console.log('   4. Start testing WebSocket features!');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
