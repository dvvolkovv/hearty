const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Создаем тестового админа
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hearty.pro' },
    update: {},
    create: {
      email: 'admin@hearty.pro',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Admin',
      lastName: 'Hearty'
    }
  })
  console.log('✅ Admin created:', admin.email)

  // Создаем тестового специалиста
  const specialistPassword = await bcrypt.hash('specialist123', 10)
  const specialistUser = await prisma.user.upsert({
    where: { email: 'specialist@hearty.pro' },
    update: {},
    create: {
      email: 'specialist@hearty.pro',
      passwordHash: specialistPassword,
      role: 'SPECIALIST',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Алексей',
      lastName: 'Иванов',
      specialist: {
        create: {
          name: 'Алексей Иванов',
          specialty: 'Психолог, Гештальт-терапевт',
          description: 'Специализируюсь на работе с эмоциональным выгоранием и поиском предназначения.',
          fullDescription: 'Я верю, что каждый человек обладает внутренними ресурсами для преодоления любых трудностей. В своей работе я использую гештальт-подход, который помогает клиентам осознать свои истинные потребности и чувства здесь и сейчас.',
          price: 500000, // 5000 руб в копейках
          location: 'Уфа',
          format: ['Онлайн', 'Лично'],
          tags: ['Гештальт', 'Выгорание', 'Личность'],
          education: ['МГУ им. Ломоносова, Психологический факультет', 'Московский Гештальт Институт (МГИ)'],
          certifications: [],
          experience: 5,
          rating: 4.9,
          totalReviews: 10,
          status: 'APPROVED',
          phone: '+7 (917) 123-45-67',
          email: 'alexey.ivanov@example.com',
        }
      }
    },
    include: {
      specialist: true
    }
  })
  console.log('✅ Specialist created:', specialistUser.email)

  // Создаем тестового клиента
  const clientPassword = await bcrypt.hash('client123', 10)
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@hearty.pro' },
    update: {},
    create: {
      email: 'client@hearty.pro',
      passwordHash: clientPassword,
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Мария',
      lastName: 'Петрова',
      client: {
        create: {
          name: 'Мария Петрова'
        }
      }
    },
    include: {
      client: true
    }
  })
  console.log('✅ Client created:', clientUser.email)

  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📝 Test accounts:')
  console.log('Admin: admin@hearty.pro / admin123')
  console.log('Specialist: specialist@hearty.pro / specialist123')
  console.log('Client: client@hearty.pro / client123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
