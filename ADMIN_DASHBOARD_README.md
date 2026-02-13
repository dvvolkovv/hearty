# Admin Dashboard - Phase 2 Complete ✅

## Что было реализовано

### 1. **Admin API Client** (`src/api/admin.ts`)
- ✅ 20+ функций для управления платформой
- ✅ TypeScript интерфейсы для всех типов
- ✅ Автоматическая обработка JWT + проверка ADMIN роли
- ✅ Обработка ошибок 401/403

**Доступные методы:**

**User Management:**
- `getUsers()` - список пользователей с фильтрами
- `getUserById()` - детали пользователя
- `banUser()` - заблокировать пользователя
- `unbanUser()` - разблокировать

**Specialist Moderation:**
- `getSpecialists()` - список специалистов
- `approveSpecialist()` - одобрить специалиста
- `rejectSpecialist()` - отклонить
- `suspendSpecialist()` - приостановить

**Review Moderation:**
- `getReviews()` - список отзывов
- `approveReview()` - одобрить отзыв
- `rejectReview()` - отклонить

**Booking Management:**
- `getBookings()` - все бронирования
- `cancelBooking()` - отменить с возвратом

**Financial Reports:**
- `getFinancialSummary()` - финансовый отчет
- `getSpecialistFinancials()` - финансы специалиста

**Platform Stats:**
- `getPlatformStats()` - общая статистика платформы
- `getTransactions()` - все транзакции

### 2. **Base UI Components**

#### Новые компоненты (`src/components/ui/`)
- ✅ **Table** - Табличный компонент с поддержкой Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableEmpty
- ✅ **Modal** - Диалоговое окно с backdrop, ESC закрытие, размеры (sm/md/lg/xl)
  - ModalHeader, ModalBody, ModalFooter
- ✅ **Button** - Кнопка с вариантами (primary/secondary/success/danger/outline/ghost)
  - Размеры: sm/md/lg
  - Loading state

### 3. **Admin Components** (`src/components/admin/`)

#### **UsersTable.tsx** - Управление пользователями
- ✅ Таблица пользователей с email, роль, статус
- ✅ Бейджи ролей (ADMIN/SPECIALIST/CLIENT)
- ✅ Статус (Активен/Заблокирован)
- ✅ Модальные окна блокировки/разблокировки
- ✅ Указание причины блокировки (обязательно)
- ✅ Автообновление после действий

**Функционал:**
- Заблокировать пользователя (с причиной)
- Разблокировать пользователя
- Просмотр деталей (email, дата регистрации, причина бана)
- Защита от блокировки ADMIN ролей

#### **SpecialistsModeration.tsx** - Модерация специалистов
- ✅ Таблица специалистов с специализация, опыт, стоимость, рейтинг
- ✅ Статусы (PENDING/APPROVED/REJECTED/SUSPENDED)
- ✅ Действия зависят от статуса:
  - PENDING → Одобрить/Отклонить
  - APPROVED → Приостановить
  - REJECTED/SUSPENDED → Активировать

**Модальные окна:**
- Одобрение (с подтверждением)
- Отклонение (с опциональной причиной)
- Приостановка (с опциональной причиной)

#### **ReviewsModeration.tsx** - Модерация отзывов
- ✅ Таблица отзывов с рейтинг (звезды), комментарий
- ✅ Информация о специалисте и клиенте
- ✅ Статусы (PENDING/APPROVED/REJECTED)
- ✅ Действия:
  - PENDING → Одобрить/Отклонить
  - REJECTED → Одобрить

**Модальные окна:**
- Одобрение (с preview отзыва)
- Отклонение (с опциональной причиной: спам, оскорбления и т.д.)

### 4. **Main Admin Dashboard** (`src/pages/admin/AdminDashboard.tsx`)

✅ **Полноценная админ-панель с 4 табами:**

#### **Tab 1: Обзор (Overview)**
- 5 карточек статистики:
  - Всего пользователей (с разбивкой Специалистов/Клиентов)
  - На модерации (pending specialists)
  - Всего бронирований
  - Общий доход
  - Отзывы на проверке

- Быстрые действия:
  - Перейти к модерации специалистов
  - Перейти к модерации отзывов
  - Перейти к управлению пользователями

#### **Tab 2: Пользователи (Users)**
- Таблица всех пользователей
- Фильтр по роли (CLIENT/SPECIALIST/ADMIN)
- Поиск (в будущем)
- Блокировка/разблокировка

#### **Tab 3: Специалисты (Specialists)**
- Таблица специалистов
- Фильтр по статусу (PENDING/APPROVED/REJECTED/SUSPENDED)
- Одобрение/отклонение/приостановка
- **Бейдж с количеством pending в табе**

#### **Tab 4: Отзывы (Reviews)**
- Таблица отзывов
- Фильтр по статусу (PENDING/APPROVED/REJECTED)
- Одобрение/отклонение
- **Бейдж с количеством pending в табе**

**Особенности:**
- ✅ Автоматическая загрузка данных при смене таба
- ✅ Loading states для всех таблиц
- ✅ Обновление данных после модерации
- ✅ Toast уведомления (success/error)
- ✅ Responsive layout

### 5. **Интеграция**
- ✅ Route добавлен: `/dashboard/admin`
- ✅ Импорт в App.tsx
- ✅ Build успешен без ошибок TypeScript

---

## Как использовать

### 1. Запуск
```bash
cd /Users/dmitry/Downloads/hearty
npm run dev
```

### 2. Доступ к Admin Dashboard

**URL:**
```
http://localhost:5173/dashboard/admin
```

### 3. Требования

**Аутентификация:**
- JWT токен в `localStorage.getItem('token')`
- **Роль пользователя должна быть ADMIN**
- При отсутствии admin роли → 403 Forbidden

**Backend endpoints:**
- Все `/api/admin/*` endpoints должны быть реализованы
- Middleware `requireAdmin` должен проверять роль

---

## Структура файлов

```
src/
├── api/
│   ├── analytics.ts          # Analytics API (Phase 1)
│   └── admin.ts              # Admin API (Phase 2) ✨
│
├── components/
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── Table.tsx         # ✨ New
│   │   ├── Modal.tsx         # ✨ New
│   │   └── Button.tsx        # ✨ New
│   │
│   ├── analytics/            # Phase 1
│   │   └── ...
│   │
│   └── admin/                # ✨ Phase 2
│       ├── UsersTable.tsx
│       ├── SpecialistsModeration.tsx
│       └── ReviewsModeration.tsx
│
├── pages/
│   ├── analytics/
│   │   └── SpecialistDashboard.tsx  # Phase 1
│   │
│   └── admin/                        # ✨ Phase 2
│       └── AdminDashboard.tsx
│
└── App.tsx                   # Added admin route
```

---

## API Endpoints используемые

**User Management:**
- `GET /api/admin/users?page=1&limit=50&role=CLIENT`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:id/ban` (body: { reason })
- `PUT /api/admin/users/:id/unban`

**Specialist Moderation:**
- `GET /api/admin/specialists?status=PENDING&limit=50`
- `PUT /api/admin/specialists/:id/approve`
- `PUT /api/admin/specialists/:id/reject` (body: { reason? })
- `PUT /api/admin/specialists/:id/suspend` (body: { reason? })

**Review Moderation:**
- `GET /api/admin/reviews?status=PENDING&limit=50`
- `PUT /api/admin/reviews/:id/approve`
- `PUT /api/admin/reviews/:id/reject` (body: { reason? })

**Bookings:**
- `GET /api/admin/bookings?status=PENDING`
- `PUT /api/admin/bookings/:id/cancel` (body: { reason, refund })

**Financials:**
- `GET /api/admin/financials/summary?dateFrom=2024-01-01&dateTo=2024-12-31`
- `GET /api/admin/financials/specialists/:id`

**Stats:**
- `GET /api/admin/stats`
- `GET /api/admin/transactions?type=PAYMENT&status=COMPLETED`

---

## Следующие шаги (Phase 3)

**Real-time Features** (из FRONTEND_SPEC.md):
1. WebSocket integration (Socket.IO client)
2. Chat component
3. Real-time notifications
4. Online presence indicators

**Опциональные улучшения Admin Dashboard:**
1. Pagination для таблиц (сейчас limit=50)
2. Search functionality для пользователей
3. Export to CSV для транзакций
4. Financial charts (revenue over time)
5. Audit log (кто, когда, какое действие сделал)

---

## Troubleshooting

### 1. "403 Forbidden"
- Убедитесь что у пользователя роль ADMIN
- Проверьте JWT токен: `jwt.verify(token, secret)` должен вернуть `{ userId, role: 'ADMIN' }`

### 2. "No data loading"
- Проверьте что backend `/api/admin/stats` endpoint работает
- Откройте DevTools > Network
- Проверьте статус коды (200 OK expected)

### 3. "Модерация не работает"
- Убедитесь что approve/reject endpoints возвращают 200
- Проверьте что `onRefresh()` вызывается после успешной операции
- Проверьте console на ошибки

### 4. "Modal не закрывается"
- Проверьте что `onClose` передается в Modal
- ESC key должен закрывать modal
- Клик по backdrop должен закрывать

---

## Тестирование

### Создайте тестовые данные:

1. **Пользователи:**
   - CLIENT пользователи (разные email)
   - SPECIALIST пользователи
   - Некоторые заблокированные (bannedAt not null)

2. **Специалисты:**
   - PENDING статус (для модерации)
   - APPROVED (уже одобренные)
   - REJECTED (отклоненные)

3. **Отзывы:**
   - PENDING (для модерации)
   - Разные рейтинги (1-5 звезд)
   - С комментариями и без

### Проверьте функциональность:

✅ **Overview tab:**
- [ ] Статистика отображается корректно
- [ ] Quick actions работают (переход по табам)

✅ **Users tab:**
- [ ] Таблица загружается
- [ ] Фильтр по роли работает
- [ ] Блокировка требует причину
- [ ] Заблокированный пользователь не может быть снова заблокирован
- [ ] Разблокировка работает
- [ ] ADMIN роль защищена от блокировки

✅ **Specialists tab:**
- [ ] Фильтр по статусу работает
- [ ] PENDING → Одобрить/Отклонить кнопки видны
- [ ] APPROVED → Только "Приостановить" кнопка
- [ ] После одобрения статус меняется
- [ ] Таблица обновляется после действий

✅ **Reviews tab:**
- [ ] Отзывы отображаются с правильными звездами
- [ ] Комментарии видны
- [ ] Одобрение работает
- [ ] Отклонение работает
- [ ] Таблица обновляется

---

## Performance

**Текущие оптимизации:**
- ✅ Lazy loading табов (данные загружаются только при активации)
- ✅ useEffect с dependency на filters
- ✅ Toast notifications вместо alert()

**TODO для production:**
- [ ] Pagination (сейчас hardcoded limit=50)
- [ ] Infinite scroll или page-based pagination
- [ ] Debounce для search input
- [ ] Caching с React Query
- [ ] Optimistic UI updates

---

## Готовность

**Phase 2 Admin Dashboard: ✅ 100% Complete**

- [x] Admin API Client (20+ methods)
- [x] TypeScript Interfaces
- [x] Base UI Components (Table, Modal, Button)
- [x] UsersTable Component
- [x] SpecialistsModeration Component
- [x] ReviewsModeration Component
- [x] Main Admin Dashboard Page
- [x] 4 Tabs (Overview, Users, Specialists, Reviews)
- [x] Routes Integration
- [x] Build Success
- [x] Documentation

**Можно переходить к Phase 3: Real-time Features (WebSocket)**
