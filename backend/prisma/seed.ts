import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const password = await bcrypt.hash('password123', 10)

  // ========================================
  // 1. Создаем админа
  // ========================================
  console.log('👤 Creating admin...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hearty.pro' },
    update: {},
    create: {
      email: 'admin@hearty.pro',
      passwordHash: password,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Admin',
      lastName: 'Hearty'
    }
  })
  console.log('   ✓ Admin created')

  // ========================================
  // 2. Создаем специалистов
  // ========================================
  console.log('🧑‍⚕️ Creating specialists...')

  const specialistsData = [
    {
      email: 'anna.petrova@hearty.pro',
      firstName: 'Анна',
      lastName: 'Петрова',
      name: 'Анна Петрова',
      specialty: 'Психолог, гештальт-терапевт',
      description: 'Помогаю разобраться в отношениях и найти внутренний баланс',
      fullDescription: 'Работаю с темами: отношения, самооценка, тревога, выгорание. Использую гештальт-подход и элементы когнитивно-поведенческой терапии.',
      education: ['МГУ, факультет психологии', 'Московский институт гештальта'],
      certifications: ['Сертификат гештальт-терапевта'],
      experience: 7,
      price: 400000,
      location: 'Москва',
      format: ['Онлайн', 'Лично'],
      tags: ['Гештальт', 'Отношения', 'Тревога'],
      phone: '+7 999 123-45-67',
      rating: 4.8,
      totalReviews: 24,
    },
    {
      email: 'dmitry.sokolov@hearty.pro',
      firstName: 'Дмитрий',
      lastName: 'Соколов',
      name: 'Дмитрий Соколов',
      specialty: 'Карьерный коуч',
      description: 'Помогаю найти призвание и построить успешную карьеру',
      fullDescription: 'Специализируюсь на карьерном консультировании и профессиональном развитии.',
      education: ['ВШЭ, экономический факультет'],
      certifications: ['ACC ICF'],
      experience: 5,
      price: 500000,
      location: 'Санкт-Петербург',
      format: ['Онлайн'],
      tags: ['Карьера', 'Призвание', 'Развитие'],
      phone: '+7 999 234-56-78',
      rating: 4.9,
      totalReviews: 18,
    },
    {
      email: 'elena.smirnova@hearty.pro',
      firstName: 'Елена',
      lastName: 'Смирнова',
      name: 'Елена Смирнова',
      specialty: 'Клинический психолог, КПТ-терапевт',
      description: 'Работаю с тревожными расстройствами и депрессией',
      fullDescription: 'Специализируюсь на когнитивно-поведенческой терапии. Помогаю справиться с тревогой и депрессией.',
      education: ['СПбГУ, клиническая психология'],
      certifications: ['Сертифицированный КПТ-терапевт'],
      experience: 10,
      price: 600000,
      location: 'Санкт-Петербург',
      format: ['Онлайн', 'Лично'],
      tags: ['КПТ', 'Тревога', 'Депрессия'],
      phone: '+7 999 345-67-89',
      rating: 5.0,
      totalReviews: 42,
    },
    {
      email: 'maria.ivanova@hearty.pro',
      firstName: 'Мария',
      lastName: 'Иванова',
      name: 'Мария Иванова',
      specialty: 'Семейный психолог',
      description: 'Помогаю семьям наладить отношения',
      fullDescription: 'Работаю с семейными парами, помогаю восстановить доверие и наладить коммуникацию.',
      education: ['МГУ, семейная психология'],
      certifications: ['Сертификат семейного психолога'],
      experience: 8,
      price: 450000,
      location: 'Москва',
      format: ['Онлайн', 'Лично'],
      tags: ['Семья', 'Пары', 'Отношения'],
      phone: '+7 999 456-78-90',
      rating: 4.7,
      totalReviews: 31,
    },
    {
      email: 'alexey.volkov@hearty.pro',
      firstName: 'Алексей',
      lastName: 'Волков',
      name: 'Алексей Волков',
      specialty: 'Лайф-коуч, бизнес-консультант',
      description: 'Помогаю достигать целей и раскрывать потенциал',
      fullDescription: 'Работаю с предпринимателями и руководителями.',
      education: ['МГИМО, международные отношения'],
      certifications: ['PCC ICF'],
      experience: 12,
      price: 800000,
      location: 'Москва',
      format: ['Онлайн', 'Лично'],
      tags: ['Лидерство', 'Цели', 'Бизнес'],
      phone: '+7 999 567-89-01',
      rating: 4.9,
      totalReviews: 28,
    },
    {
      email: 'olga.novikova@hearty.pro',
      firstName: 'Ольга',
      lastName: 'Новикова',
      name: 'Ольга Новикова',
      specialty: 'Психолог, арт-терапевт',
      description: 'Использую творчество для работы с эмоциями',
      fullDescription: 'Работаю через арт-терапию и телесно-ориентированные практики.',
      education: ['МГППУ, психология'],
      certifications: ['Арт-терапевт'],
      experience: 6,
      price: 350000,
      location: 'Казань',
      format: ['Онлайн'],
      tags: ['Арт-терапия', 'Творчество', 'Травма'],
      phone: '+7 999 678-90-12',
      rating: 4.6,
      totalReviews: 19,
    },
  ]

  const specialists = []
  for (const data of specialistsData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash: password,
        role: 'SPECIALIST',
        status: 'ACTIVE',
        emailVerified: true,
        firstName: data.firstName,
        lastName: data.lastName,
        specialist: {
          create: {
            name: data.name,
            specialty: data.specialty,
            description: data.description,
            fullDescription: data.fullDescription,
            education: data.education,
            certifications: data.certifications,
            experience: data.experience,
            price: data.price,
            location: data.location,
            format: data.format,
            tags: data.tags,
            phone: data.phone,
            status: 'APPROVED',
            rating: data.rating,
            totalReviews: data.totalReviews,
          }
        }
      },
      include: { specialist: true }
    })
    specialists.push(user)
    console.log(`   ✓ ${data.name}`)
  }

  // ========================================
  // 3. Создаем временные слоты
  // ========================================
  console.log('📅 Creating time slots...')
  const today = new Date()
  const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

  for (const user of specialists) {
    if (!user.specialist) continue

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(today)
      date.setDate(date.getDate() + dayOffset)

      const availableTimes = times.filter(() => Math.random() > 0.5)

      for (const time of availableTimes) {
        await prisma.timeSlot.create({
          data: {
            specialistId: user.specialist.id,
            date,
            time,
            isBooked: false,
          },
        })
      }
    }
  }
  console.log('   ✓ Time slots created')

  // ========================================
  // 4. Создаем клиентов
  // ========================================
  console.log('👥 Creating clients...')
  const clientsData = [
    { email: 'ivan.client@example.com', firstName: 'Иван', lastName: 'Сидоров', name: 'Иван Сидоров' },
    { email: 'maria.client@example.com', firstName: 'Мария', lastName: 'Кузнецова', name: 'Мария Кузнецова' },
    { email: 'peter.client@example.com', firstName: 'Петр', lastName: 'Васильев', name: 'Петр Васильев' },
  ]

  const clients = []
  for (const data of clientsData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash: password,
        role: 'CLIENT',
        status: 'ACTIVE',
        emailVerified: true,
        firstName: data.firstName,
        lastName: data.lastName,
        client: {
          create: { name: data.name }
        }
      },
      include: { client: true }
    })
    clients.push(user)
    console.log(`   ✓ ${data.name}`)
  }

  // ========================================
  // 5. Создаем отзывы
  // ========================================
  console.log('⭐ Creating reviews...')
  const reviewTexts = [
    'Отличный специалист! Помог разобраться в сложной ситуации.',
    'Очень профессиональный подход. Рекомендую!',
    'Благодарю за поддержку и понимание.',
    'Конкретные инструменты и четкая структура работы.',
    'Чуткий и внимательный психолог.',
  ]

  for (const specialistUser of specialists) {
    if (!specialistUser.specialist) continue

    const reviewCount = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < reviewCount; i++) {
      const randomClient = clients[Math.floor(Math.random() * clients.length)]
      if (!randomClient.client) continue

      const rating = Math.random() > 0.3 ? 5 : 4

      await prisma.review.create({
        data: {
          clientId: randomClient.client.id,
          specialistId: specialistUser.specialist.id,
          rating,
          text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          status: 'APPROVED',
        },
      })
    }
  }
  console.log('   ✓ Reviews created')

  console.log('\n✅ Seeding completed!')
  console.log('\n📝 Test credentials:')
  console.log('   Admin: admin@hearty.pro / password123')
  console.log('   Specialist: anna.petrova@hearty.pro / password123')
  console.log('   Client: ivan.client@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
