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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
