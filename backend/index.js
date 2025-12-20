const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/images';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const specialistId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `spec-${specialistId}-custom-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let specialists = [
  {
    id: 1,
    name: 'Алексей Иванов',
    specialty: 'Психолог, Гештальт-терапевт',
    description: 'Специализируюсь на работе с эмоциональным выгоранием и поиском предназначения.',
    price: 5000,
    location: 'Уфа',
    format: 'Онлайн / Лично',
    tags: ['Гештальт', 'Выгорание', 'Личность'],
    image: '/images/spec-1.jpg',
    rating: 4.9,
    reviews: 124,
    detailedReviews: [
      { id: 1, author: 'Елена', text: 'Очень помог разобраться в себе. Чуткий и внимательный специалист.', rating: 5 },
      { id: 2, author: 'Марк', text: 'Профессиональный подход. Уже после первой сессии стало легче.', rating: 5 }
    ],
    fullDescription: 'Я верю, что каждый человек обладает внутренними ресурсами для преодоления любых трудностей. В своей работе я использую гештальт-подход, который помогает клиентам осознать свои истинные потребности и чувства здесь и сейчас. Моя задача — создать безопасное пространство, где вы сможете быть собой и находить ответы на важные вопросы.',
    education: ['МГУ им. Ломоносова, Психологический факультет', 'Московский Гештальт Институт (МГИ)'],
    phone: '+7 (917) 123-45-67',
    email: 'alexey.ivanov@example.com',
    socialLinks: {
      instagram: 'https://instagram.com/alexey_ivanov',
      telegram: 'https://t.me/alexey_ivanov',
      vk: 'https://vk.com/alexey_ivanov'
    },
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
    tags: ['Бизнес', 'Тайм-менеджмент', 'Эффективность'],
    image: '/images/spec-2.jpg',
    rating: 5.0,
    reviews: 89,
    detailedReviews: [
      { id: 1, author: 'Александр', text: 'Мария помогла мне структурировать бизнес-процессы. Очень ценные советы.', rating: 5 },
      { id: 2, author: 'Виктория', text: 'Прекрасный коуч. Помогла найти баланс между работой и личной жизнью.', rating: 5 }
    ],
    fullDescription: 'Моя специализация — развитие лидерского потенциала и повышение личной эффективности. Я работаю с предпринимателями и руководителями, помогая им достигать амбициозных целей, не жертвуя при этом личным временем и здоровьем. Мой подход основан на сочетании классического коучинга и практических бизнес-инструментов.',
    education: ['ВШЭ, Менеджмент', 'Международный Эриксоновский Университет коучинга'],
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
    image: '/images/spec-3.jpg',
    rating: 4.8,
    reviews: 56,
    detailedReviews: [
      { id: 1, author: 'Ольга', text: 'Помог сохранить брак. Очень благодарны за терпение и мудрость.', rating: 5 },
      { id: 2, author: 'Иван', text: 'Научил нас с женой слушать друг друга. Рекомендую.', rating: 4 }
    ],
    fullDescription: 'Семья — это живая система, и иногда она нуждается в настройке. Я помогаю парам проходить через кризисы, восстанавливать доверие и находить новые смыслы в отношениях. Моя работа направлена на то, чтобы каждый член семьи чувствовал себя услышанным и важным.',
    education: ['СПбГУ, Факультет психологии', 'Институт психотерапии и консультирования «Гармония»'],
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
    tags: ['КПТ', 'Тревога', 'Депрессия', 'Состояния'],
    image: '/images/spec-4.jpg',
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
    image: '/images/spec-5.jpg',
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
    image: '/images/spec-6.jpg',
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
    image: '/images/spec-7.jpg',
    rating: 5.0,
    reviews: 215,
    slots: {
      '2025-12-22': ['10:00', '12:00', '14:00'],
      '2025-12-23': ['09:00', '11:00', '13:00']
    }
  },
  {
    id: 10,
    name: 'Ольга Смирнова',
    specialty: 'Арт-терапевт',
    description: 'Использую творчество для исцеления и самопознания. Помогаю проработать самооценку через образы.',
    price: 3000,
    location: 'Сочи',
    format: 'Лично',
    tags: ['Творчество', 'Арт-терапия', 'Самооценка'],
    image: '/images/spec-8.jpg',
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
    description: 'Психологическая подготовка атлетов к соревнованиям и восстановление после травм и событий.',
    price: 5500,
    location: 'Новосибирск',
    format: 'Онлайн',
    tags: ['Спорт', 'Мотивация', 'События'],
    image: '/images/spec-9.jpg',
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

// Mock pending reviews (awaiting approval)
let mockPendingReviews = [
  { id: 1001, specialistId: 1, author: 'Мария К.', rating: 5, text: 'Алексей помог мне справиться с выгоранием. Очень внимательный и профессиональный подход!', createdAt: '2025-12-19T10:00:00Z' },
  { id: 1002, specialistId: 1, author: 'Иван П.', rating: 4, text: 'Хороший специалист, но хотелось бы больше конкретных рекомендаций.', createdAt: '2025-12-18T15:30:00Z' }
];

// Mock client notes
let mockClientNotes = {
  1: {
    'Марина': [
      { id: 1, text: 'Работает над выгоранием на работе. Первая сессия прошла продуктивно.', createdAt: '2025-12-20T10:00:00Z' },
      { id: 2, text: 'Клиентка открылась, готовы к более глубокой работе.', createdAt: '2025-12-21T14:00:00Z' }
    ],
    'Сергей': [
      { id: 3, text: 'Повторная сессия. Прогресс по целям хороший.', createdAt: '2025-12-21T13:00:00Z' }
    ],
    'Анна': [
      { id: 4, text: 'Первичная консультация. Основной запрос - поиск предназначения.', createdAt: '2025-12-18T16:00:00Z' }
    ]
  }
};

// Mock chat messages: { specialistId: { clientName: [messages] } }
let mockChatMessages = {
  1: {
    'Марина': [
      { id: 1, sender: 'client', text: 'Здравствуйте! Спасибо за первую сессию, мне очень помогло.', createdAt: '2025-12-20T11:00:00Z' },
      { id: 2, sender: 'specialist', text: 'Рад был помочь! Как вы себя чувствуете после нашей встречи?', createdAt: '2025-12-20T12:00:00Z' },
      { id: 3, sender: 'client', text: 'Намного лучше, начала применять техники, которые вы посоветовали.', createdAt: '2025-12-20T15:00:00Z' }
    ],
    'Сергей': [
      { id: 4, sender: 'client', text: 'Можно перенести сессию на завтра на час позже?', createdAt: '2025-12-21T09:00:00Z' },
      { id: 5, sender: 'specialist', text: 'Конечно, давайте перенесем на 14:00, подходит?', createdAt: '2025-12-21T09:30:00Z' }
    ]
  }
};

// Mock clients data (manually added clients)
let mockClients = {
  1: [
    // Format: { name: string, phone: string, email?: string, notes?: string, createdAt: string }
  ]
};

// Routes
app.get('/api/specialists', (req, res) => {
  res.json(specialists);
});

app.get('/api/specialists/:id/bookings', (req, res) => {
  const { id } = req.params;
  const bookings = mockBookings.filter(b => b.specialistId === parseInt(id));
  res.json(bookings);
});

app.post('/api/specialists/:id/bookings', (req, res) => {
  const { id } = req.params;
  const { clientName, date, time, status } = req.body;
  
  const newBooking = {
    id: mockBookings.length > 0 ? Math.max(...mockBookings.map(b => b.id)) + 1 : 1,
    specialistId: parseInt(id),
    clientName: clientName || 'Клиент',
    date: date,
    time: time,
    status: status || 'confirmed',
    specialty: 'Сессия'
  };
  
  mockBookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

app.put('/api/bookings/:bookingId/status', (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  
  const booking = mockBookings.find(b => b.id === parseInt(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const validStatuses = ['new', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  booking.status = status;
  res.json({ success: true, booking });
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
  const { message } = req.body;
  // Simulated AI response for content generation
  const responses = [
    `Понял! На основе вашего запроса "${message}", вот черновик контента:\n\nЧасто мы забываем, что наше ментальное здоровье — это фундамент всего, что мы делаем. Когда мы заботимся о себе, мы можем давать больше другим.`,
    `Отличная тема! Вот набросок для "${message}":\n\nКаждый из нас сталкивается с вызовами. Важно не то, что происходит, а как мы на это реагируем. Развитие эмоциональной устойчивости — это навык, который можно тренировать.`,
    `Интересный запрос! На основе "${message}" предлагаю такой вариант:\n\nАутентичность — это не быть идеальным. Это быть честным с собой и окружающими. Когда мы позволяем себе быть настоящими, мы создаем пространство для глубоких связей.`
  ];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  res.json({ reply: randomResponse });
});

app.post('/api/specialists/:id/upload-photo', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const specialist = specialists.find(s => s.id === parseInt(id));
  
  if (specialist && req.file) {
    const photoPath = `/images/${req.file.filename}`;
    specialist.image = photoPath;
    res.json({ success: true, image: photoPath });
  } else {
    res.status(404).json({ error: 'Specialist not found or no file uploaded' });
  }
});

app.put('/api/specialists/:id/profile', (req, res) => {
  const { id } = req.params;
  const { phone, email, socialLinks } = req.body;
  const specialist = specialists.find(s => s.id === parseInt(id));
  
  if (!specialist) {
    return res.status(404).json({ error: 'Specialist not found' });
  }
  
  if (phone !== undefined) specialist.phone = phone;
  if (email !== undefined) specialist.email = email;
  if (socialLinks !== undefined) specialist.socialLinks = socialLinks;
  
  res.json({ success: true, specialist });
});

// Reviews API
app.post('/api/specialists/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { author, rating, text } = req.body;
  const specialist = specialists.find(s => s.id === parseInt(id));
  
  if (!specialist) {
    return res.status(404).json({ error: 'Specialist not found' });
  }
  
  const newReview = {
    id: Date.now(),
    specialistId: parseInt(id),
    author: author || 'Анонимный клиент',
    rating: parseInt(rating) || 5,
    text: text || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  mockPendingReviews.push(newReview);
  res.status(201).json({ success: true, review: newReview });
});

app.get('/api/specialists/:id/reviews/pending', (req, res) => {
  const { id } = req.params;
  const pendingReviews = mockPendingReviews.filter(r => r.specialistId === parseInt(id));
  res.json(pendingReviews);
});

app.post('/api/specialists/:id/reviews/:reviewId/approve', (req, res) => {
  const { id, reviewId } = req.params;
  const specialist = specialists.find(s => s.id === parseInt(id));
  
  if (!specialist) {
    return res.status(404).json({ error: 'Specialist not found' });
  }
  
  const reviewIndex = mockPendingReviews.findIndex(r => r.id === parseInt(reviewId) && r.specialistId === parseInt(id));
  
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  const approvedReview = mockPendingReviews[reviewIndex];
  mockPendingReviews.splice(reviewIndex, 1);
  
  // Add to specialist's approved reviews
  if (!specialist.detailedReviews) {
    specialist.detailedReviews = [];
  }
  specialist.detailedReviews.push({
    id: approvedReview.id,
    author: approvedReview.author,
    rating: approvedReview.rating,
    text: approvedReview.text
  });
  
  // Update rating (simple average calculation)
  if (specialist.detailedReviews.length > 0) {
    const totalRating = specialist.detailedReviews.reduce((sum, r) => sum + r.rating, 0);
    specialist.rating = (totalRating / specialist.detailedReviews.length).toFixed(1);
    specialist.reviews = specialist.detailedReviews.length;
  }
  
  res.json({ success: true, review: approvedReview });
});

app.post('/api/specialists/:id/reviews/:reviewId/reject', (req, res) => {
  const { id, reviewId } = req.params;
  const specialist = specialists.find(s => s.id === parseInt(id));
  
  if (!specialist) {
    return res.status(404).json({ error: 'Specialist not found' });
  }
  
  const reviewIndex = mockPendingReviews.findIndex(r => r.id === parseInt(reviewId) && r.specialistId === parseInt(id));
  
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  mockPendingReviews.splice(reviewIndex, 1);
  res.json({ success: true, message: 'Review rejected' });
});

// Client Notes API
app.get('/api/specialists/:id/clients', (req, res) => {
  const { id } = req.params;
  const specialistId = parseInt(id);
  const bookings = mockBookings.filter(b => b.specialistId === specialistId);
  const manualClients = mockClients[specialistId] || [];
  
  // Get unique clients from bookings
  const bookingClients = Array.from(new Set(bookings.map(b => b.name))).map(name => {
    const clientBookings = bookings.filter(b => b.name === name);
    const notes = mockClientNotes[specialistId]?.[name] || [];
    const manualClientData = manualClients.find(c => c.name === name);
    
    return {
      name,
      phone: manualClientData?.phone || clientBookings[0].phone,
      email: manualClientData?.email || '',
      notes: manualClientData?.notes || '',
      totalSessions: clientBookings.length,
      lastSession: clientBookings.length > 0 ? clientBookings[clientBookings.length - 1].date : null,
      notesCount: notes.length,
      bookings: clientBookings,
      createdAt: manualClientData?.createdAt || (clientBookings.length > 0 ? clientBookings[0].date : null)
    };
  });
  
  // Add manual clients that don't have bookings
  const manualClientsWithoutBookings = manualClients
    .filter(c => !bookings.some(b => b.name === c.name))
    .map(c => {
      const notes = mockClientNotes[specialistId]?.[c.name] || [];
      return {
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        notes: c.notes || '',
        totalSessions: 0,
        lastSession: null,
        notesCount: notes.length,
        bookings: [],
        createdAt: c.createdAt
      };
    });
  
  const allClients = [...bookingClients, ...manualClientsWithoutBookings];
  res.json(allClients);
});

app.get('/api/specialists/:id/clients/:clientName/notes', (req, res) => {
  const { id, clientName } = req.params;
  const notes = mockClientNotes[parseInt(id)]?.[clientName] || [];
  res.json(notes);
});

app.post('/api/specialists/:id/clients/:clientName/notes', (req, res) => {
  const { id, clientName } = req.params;
  const { text } = req.body;
  
  if (!mockClientNotes[parseInt(id)]) {
    mockClientNotes[parseInt(id)] = {};
  }
  
  if (!mockClientNotes[parseInt(id)][clientName]) {
    mockClientNotes[parseInt(id)][clientName] = [];
  }
  
  const newNote = {
    id: Date.now(),
    text: text || '',
    createdAt: new Date().toISOString()
  };
  
  mockClientNotes[parseInt(id)][clientName].push(newNote);
  res.status(201).json({ success: true, note: newNote });
});

app.delete('/api/specialists/:id/clients/:clientName/notes/:noteId', (req, res) => {
  const { id, clientName, noteId } = req.params;
  const notes = mockClientNotes[parseInt(id)]?.[clientName] || [];
  const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes.splice(noteIndex, 1);
  res.json({ success: true, message: 'Note deleted' });
});

// Client Management API
app.post('/api/specialists/:id/clients', (req, res) => {
  const { id } = req.params;
  const { name, phone, email, notes } = req.body;
  const specialistId = parseInt(id);
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  if (!mockClients[specialistId]) {
    mockClients[specialistId] = [];
  }
  
  // Check if client already exists
  const existingClient = mockClients[specialistId].find(c => c.name === name);
  if (existingClient) {
    return res.status(400).json({ error: 'Client with this name already exists' });
  }
  
  const newClient = {
    name,
    phone,
    email: email || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  
  mockClients[specialistId].push(newClient);
  res.status(201).json({ success: true, client: newClient });
});

app.put('/api/specialists/:id/clients/:clientName', (req, res) => {
  const { id, clientName } = req.params;
  const { name, phone, email, notes } = req.body;
  const specialistId = parseInt(id);
  const decodedClientName = decodeURIComponent(clientName);
  
  if (!mockClients[specialistId]) {
    mockClients[specialistId] = [];
  }
  
  // Find client
  let client = mockClients[specialistId].find(c => c.name === decodedClientName);
  
  // If client doesn't exist in manual clients, create it from bookings
  if (!client) {
    const bookings = mockBookings.filter(b => b.specialistId === specialistId && b.name === decodedClientName);
    if (bookings.length > 0) {
      client = {
        name: decodedClientName,
        phone: bookings[0].phone,
        email: '',
        notes: '',
        createdAt: bookings[0].date
      };
      mockClients[specialistId].push(client);
    } else {
      return res.status(404).json({ error: 'Client not found' });
    }
  }
  
  // Update client data
  if (name && name !== decodedClientName) {
    // Check if new name already exists
    const nameExists = mockClients[specialistId].find(c => c.name === name && c.name !== decodedClientName);
    if (nameExists) {
      return res.status(400).json({ error: 'Client with this name already exists' });
    }
    client.name = name;
  }
  if (phone) client.phone = phone;
  if (email !== undefined) client.email = email;
  if (notes !== undefined) client.notes = notes;
  
  res.json({ success: true, client });
});

// Chat API for specialists
app.get('/api/specialists/:id/chats', (req, res) => {
  const { id } = req.params;
  const specialistId = parseInt(id);
  const chats = mockChatMessages[specialistId] || {};
  
  const chatList = Object.keys(chats).map(clientName => {
    const messages = chats[clientName];
    const lastMessage = messages[messages.length - 1];
    return {
      clientName,
      lastMessage: lastMessage.text,
      lastMessageTime: lastMessage.createdAt,
      unreadCount: messages.filter(m => m.sender === 'client' && !m.read).length
    };
  });
  
  res.json(chatList);
});

app.get('/api/specialists/:id/chats/:clientName/messages', (req, res) => {
  const { id, clientName } = req.params;
  const specialistId = parseInt(id);
  const decodedClientName = decodeURIComponent(clientName);
  
  const messages = mockChatMessages[specialistId]?.[decodedClientName] || [];
  res.json(messages);
});

app.post('/api/specialists/:id/chats/:clientName/messages', (req, res) => {
  const { id, clientName } = req.params;
  const { text } = req.body;
  const specialistId = parseInt(id);
  const decodedClientName = decodeURIComponent(clientName);
  
  if (!mockChatMessages[specialistId]) {
    mockChatMessages[specialistId] = {};
  }
  if (!mockChatMessages[specialistId][decodedClientName]) {
    mockChatMessages[specialistId][decodedClientName] = [];
  }
  
  const newMessage = {
    id: mockChatMessages[specialistId][decodedClientName].length + 1,
    sender: 'specialist',
    text,
    createdAt: new Date().toISOString()
  };
  
  mockChatMessages[specialistId][decodedClientName].push(newMessage);
  res.json({ success: true, message: newMessage });
});

// Chat API for clients
app.get('/api/clients/:clientName/chats', (req, res) => {
  const { clientName } = req.params;
  const decodedClientName = decodeURIComponent(clientName);
  const chats = [];
  
  // Find all specialists this client has chats with
  Object.keys(mockChatMessages).forEach(specialistId => {
    if (mockChatMessages[specialistId][decodedClientName]) {
      const specialist = specialists.find(s => s.id === parseInt(specialistId));
      if (specialist) {
        const messages = mockChatMessages[specialistId][decodedClientName];
        const lastMessage = messages[messages.length - 1];
        chats.push({
          specialistId: parseInt(specialistId),
          specialistName: specialist.name,
          specialistImage: specialist.image,
          lastMessage: lastMessage.text,
          lastMessageTime: lastMessage.createdAt,
          unreadCount: messages.filter(m => m.sender === 'specialist' && !m.read).length
        });
      }
    }
  });
  
  res.json(chats);
});

app.get('/api/clients/:clientName/chats/:specialistId/messages', (req, res) => {
  const { clientName, specialistId } = req.params;
  const decodedClientName = decodeURIComponent(clientName);
  const specId = parseInt(specialistId);
  
  const messages = mockChatMessages[specId]?.[decodedClientName] || [];
  res.json(messages);
});

app.post('/api/clients/:clientName/chats/:specialistId/messages', (req, res) => {
  const { clientName, specialistId } = req.params;
  const { text } = req.body;
  const decodedClientName = decodeURIComponent(clientName);
  const specId = parseInt(specialistId);
  
  if (!mockChatMessages[specId]) {
    mockChatMessages[specId] = {};
  }
  if (!mockChatMessages[specId][decodedClientName]) {
    mockChatMessages[specId][decodedClientName] = [];
  }
  
  const newMessage = {
    id: mockChatMessages[specId][decodedClientName].length + 1,
    sender: 'client',
    text,
    createdAt: new Date().toISOString()
  };
  
  mockChatMessages[specId][decodedClientName].push(newMessage);
  res.json({ success: true, message: newMessage });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
