const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Data
let specialists = [
  {
    id: 1,
    name: 'Алексей Иванов',
    specialty: 'Психолог, Гештальт-терапевт',
    description: 'Специализируюсь на работе с эмоциональным выгоранием и поиском предназначения.',
    price: 5000,
    location: 'Уфа',
    format: 'Онлайн / Лично',
    tags: ['Гештальт', 'Выгорание'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.9,
    reviews: 124,
    slots: {
      '2025-12-20': ['10:00', '12:00', '14:00', '16:00'],
      '2025-12-21': ['11:00', '13:00', '15:00'],
      '2025-12-22': ['10:00', '11:00', '16:00', '17:00']
    }
  },
  {
    id: 2,
    name: 'Мария Петрова',
    specialty: 'Коуч, Бизнес-консультант',
    description: 'Помогаю предпринимателям масштабировать бизнес и сохранять work-life balance.',
    price: 7000,
    location: 'Москва',
    format: 'Онлайн',
    tags: ['Бизнес', 'Тайм-менеджмент'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 5.0,
    reviews: 89,
    slots: {
      '2025-12-20': ['09:00', '10:30', '15:00'],
      '2025-12-23': ['10:00', '14:00']
    }
  },
  {
    id: 3,
    name: 'Дмитрий Соколов',
    specialty: 'Семейный психолог',
    description: 'Работа с парами, разрешение конфликтов и укрепление отношений.',
    price: 4500,
    location: 'Санкт-Петербург',
    format: 'Лично',
    tags: ['Семья', 'Отношения'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.8,
    reviews: 56,
    slots: {
      '2025-12-20': ['12:00', '13:00', '14:00'],
      '2025-12-21': ['10:00', '16:00']
    }
  },
  {
    id: 4,
    name: 'Елена Волкова',
    specialty: 'КПТ-терапевт',
    description: 'Помогаю справиться с тревожностью, паническими атаками и фобиями через когнитивно-поведенческий подход.',
    price: 3500,
    location: 'Екатеринбург',
    format: 'Онлайн',
    tags: ['КПТ', 'Тревога', 'Депрессия'],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.7,
    reviews: 42,
    slots: {
      '2025-12-21': ['09:00', '10:00', '11:00'],
      '2025-12-22': ['14:00', '15:00']
    }
  },
  {
    id: 5,
    name: 'Игорь Морозов',
    specialty: 'Экзистенциальный психолог',
    description: 'Работа с вопросами смысла жизни, одиночества и принятия сложных решений.',
    price: 6000,
    location: 'Уфа',
    format: 'Лично',
    tags: ['Смысл', 'Выбор'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.9,
    reviews: 73,
    slots: {
      '2025-12-20': ['16:00', '17:00', '18:00'],
      '2025-12-24': ['10:00', '11:00']
    }
  },
  {
    id: 6,
    name: 'Анна Кузнецова',
    specialty: 'Детский и подростковый психолог',
    description: 'Нахожу общий язык с подростками, помогаю родителям понять своих детей.',
    price: 4000,
    location: 'Казань',
    format: 'Онлайн / Лично',
    tags: ['Дети', 'Подростки', 'Воспитание'],
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.9,
    reviews: 110,
    slots: {
      '2025-12-20': ['10:00', '11:00', '12:00'],
      '2025-12-21': ['14:00', '15:00']
    }
  },
  {
    id: 7,
    name: 'Виктор Степанов',
    specialty: 'НЛП-мастер, Лайф-коуч',
    description: 'Быстрое достижение целей, работа с ограничивающими убеждениями и уверенностью.',
    price: 8500,
    location: 'Москва',
    format: 'Онлайн',
    tags: ['Коучинг', 'Успех', 'НЛП'],
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 5.0,
    reviews: 215,
    slots: {
      '2025-12-22': ['10:00', '12:00', '14:00'],
      '2025-12-23': ['09:00', '11:00', '13:00']
    }
  },
  {
    id: 8,
    name: 'Ольга Смирнова',
    specialty: 'Арт-терапевт',
    description: 'Использую творчество для исцеления и самопознания. Не нужно уметь рисовать, чтобы начать.',
    price: 3000,
    location: 'Сочи',
    format: 'Лично',
    tags: ['Творчество', 'Арт-терапия'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.8,
    reviews: 34,
    slots: {
      '2025-12-20': ['11:00', '13:00', '15:00'],
      '2025-12-21': ['10:00', '12:00']
    }
  },
  {
    id: 9,
    name: 'Артем Зайцев',
    specialty: 'Спортивный психолог',
    description: 'Психологическая подготовка атлетов к соревнованиям и восстановление после травм.',
    price: 5500,
    location: 'Новосибирск',
    format: 'Онлайн',
    tags: ['Спорт', 'Мотивация'],
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&h=400&auto=format&fit=crop',
    rating: 4.9,
    reviews: 67,
    slots: {
      '2025-12-21': ['12:00', '14:00', '16:00'],
      '2025-12-24': ['09:00', '11:00']
    }
  }
];

const mockBookings = [
  { id: 101, specialistId: 1, name: 'Марина', phone: '+7 (917) 123-44-55', date: '2025-12-20', time: '10:00', status: 'new', message: 'Хочу обсудить выгорание на работе.' },
  { id: 102, specialistId: 1, name: 'Сергей', phone: '+7 (905) 555-66-77', date: '2025-12-21', time: '13:00', status: 'confirmed', message: 'Повторная сессия.' },
  { id: 103, specialistId: 1, name: 'Анна', phone: '+7 (999) 000-11-22', date: '2025-12-18', time: '16:00', status: 'completed', message: 'Первичная консультация.' }
];

// Routes
app.get('/api/specialists', (req, res) => {
  res.json(specialists);
});

app.get('/api/specialists/:id/bookings', (req, res) => {
  const { id } = req.params;
  const bookings = mockBookings.filter(b => b.specialistId === parseInt(id));
  res.json(bookings);
});

app.get('/api/specialists/:id/stats', (req, res) => {
  res.json({
    totalSessions: 48,
    rating: 4.9,
    earned: 240000,
    newRequests: 1
  });
});

app.post('/api/specialists/:id/slots', (req, res) => {
  const { id } = req.params;
  const { date, slots } = req.body;
  const specialist = specialists.find(s => s.id === parseInt(id));
  if (specialist) {
    if (!specialist.slots) specialist.slots = {};
    specialist.slots[date] = slots;
    res.json({ success: true, slots: specialist.slots });
  } else {
    res.status(404).json({ error: 'Specialist not found' });
  }
});

app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  console.log('New booking received:', booking);
  res.status(201).json({ success: true, message: 'Booking received' });
});

app.post('/api/ai/diagnostic', (req, res) => {
  const { message } = req.body;
  const responses = [
    "Понимаю. Расскажите чуть подробнее, как часто вы это чувствуете?",
    "Это важный момент. Как это влияет на вашу повседневную жизнь?",
    "Я здесь, чтобы помочь. Что бы вы хотели изменить в этой ситуации в первую очередь?",
    "Спасибо, что делитесь. Похоже, вам может подойти специалист с бережным подходом. Есть ли что-то еще, что мне стоит знать?",
    "Я зафиксировал ваш запрос. Теперь мы сможем подобрать специалиста гораздо точнее."
  ];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  res.json({ reply: randomResponse });
});

app.post('/api/ai/linkeon', (req, res) => {
  const { message } = req.body;
  // Simulated AI response for onboarding
  const responses = [
    "Это важно. А как вы транслируете свои ценности клиенту в процессе терапии?",
    "Опишите ваш рабочий подход: что для вас первостепенно в методологии?",
    "Ваш энергетический настрой — это то, что клиенты чувствуют сразу. Как бы вы его описали одним словом?",
    "Спасибо! Мы исследуем глубину вашей практики, чтобы мэтчинг был максимально точным. Какой ваш главный профессиональный принцип?",
    "Как вы считаете, какие ваши личные качества больше всего помогают в работе с запросами клиентов?"
  ];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  res.json({ reply: randomResponse });
});

app.post('/api/ai/ekaterina', (req, res) => {
  const { topic } = req.body;
  // Simulated AI response for content generation
  res.json({ 
    post: `Вот набросок поста на тему "${topic}":\n\nЧасто мы забываем, что наше ментальное здоровье — это фундамент...` 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
