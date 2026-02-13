import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, User, Menu, X, Heart, Sparkles, Calendar, Send, Star, Shield, Zap, Target, FileText, Upload, Briefcase, Rocket, Compass, BatteryCharging, CloudLightning, Users, Smile, Anchor, Wallet, CheckCircle2, Clock, ArrowLeft, MessageSquare, Check, XCircle, PlusCircle, RefreshCw, ChevronRight, Home, LogOut } from 'lucide-react'
import logoHearty from './assets/logo_hearty.jpg'
import { SpecialistDashboard as SpecialistAnalyticsDashboard } from './pages/analytics/SpecialistDashboard'
import { AdminDashboard as AdminDashboardPage } from './pages/admin/AdminDashboard'
import { ChatTestPage } from './pages/ChatTestPage'
import { SocketProvider } from './contexts/SocketContext'
import { Toaster } from 'react-hot-toast'
import { usePageTitle } from './hooks/usePageTitle'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { Login } from './pages/Login'
import { RegisterClient } from './pages/RegisterClient'
import { RegisterSpecialist } from './pages/RegisterSpecialist'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Bookings } from './pages/Bookings'
import { Payments } from './pages/Payments'

// Constants
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://heartypro-back-production.up.railway.app/api'
  if (url.startsWith('http')) return url
  return `https://${url}`
}
const API_URL = getApiUrl()
const BASE_URL = API_URL.replace('/api', '')
const IS_PRODUCTION = import.meta.env.PROD
console.log('Final API URL:', API_URL)

// Helper to format user-friendly error messages
const getUserFriendlyError = (error: any): string => {
  // Don't show technical JavaScript errors to users
  const technicalErrorPatterns = [
    /is not a function/i,
    /cannot read property/i,
    /undefined/i,
    /null/i,
    /\.map/i,
    /\.filter/i,
    /\.find/i
  ]

  const errorMessage = error?.message || String(error)
  const isTechnicalError = technicalErrorPatterns.some(pattern => pattern.test(errorMessage))

  if (isTechnicalError) {
    return 'Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.'
  }

  return errorMessage
}

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) return imagePath
  return `${BASE_URL}${imagePath}`
}

// Breadcrumbs Component
const Breadcrumbs = ({ items }: { items: { label: string; path?: string }[] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
      <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
        <Home className="h-3 w-3" />
        <span>Главная</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          {item.path ? (
            <Link to={item.path} className="text-muted-foreground hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Navigation Component (needs access to AuthContext)
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoHearty} alt="Hearty" className="h-12 w-12 object-contain" />
            <span className="text-xl font-bold tracking-tight text-foreground">Hearty</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/specialists" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Специалисты</Link>
            <Link to="/onboarding" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Для психологов</Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  Кабинет
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Войти
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <Link to="/specialists" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Специалисты</Link>
          <Link to="/onboarding" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Для психологов</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>
                Кабинет
              </Link>
              <button
                onClick={() => { logout(); setIsMenuOpen(false) }}
                className="w-full bg-muted text-foreground py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Выйти
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Войти
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navigation />
      <main>{children}</main>

      <footer className="border-t bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
            <img src={logoHearty} alt="Hearty" className="h-8 w-8 object-contain" />
            <span className="font-bold">Hearty</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 Hearty Platform. Часть экосистемы Linkeon.</p>
        </div>
      </footer>
    </div>
  )
}

// Pages
const Landing = () => {
  usePageTitle('Найдите своего психолога', '')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/specialists')
  }

  return (
  <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Development Notice - only in development */}
      {!IS_PRODUCTION && (
        <div className="mb-8">
          <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6 text-center max-w-3xl mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BatteryCharging className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-black text-orange-900">Продукт находится в разработке</h2>
            </div>
            <p className="text-sm text-orange-800 font-medium">
              Мы активно работаем над улучшением платформы. Некоторые функции могут работать некорректно или быть временно недоступны.
            </p>
          </div>
        </div>
      )}

      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
          <Sparkles className="h-4 w-4" />
          Подбор психолога с помощью ИИ
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
          Найдите своего психолога на основе ценностей
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Технология Linkeon анализирует не симптомы, а ваши глубинные запросы
        </p>

        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="flex items-center px-6 gap-3 bg-white rounded-2xl shadow-xl border-2 border-border hover:border-primary/30 transition-all">
              <Search className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Что вас беспокоит? (тревога, выгорание, карьера...)"
                className="w-full py-4 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30">
              Найти специалиста
            </button>
          </form>

          <div className="text-center">
            <span className="text-sm font-medium text-muted-foreground">или</span>
            <Link
              to="/diagnostic"
              className="block mt-2 text-primary hover:text-primary/80 transition-all font-bold text-sm group"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>Пройти AI-диагностику для точного подбора</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Link Profile Section */}
      <div className="mb-32">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-[3rem] p-12 border-2 border-primary/20 shadow-xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-black text-foreground">Подключите профиль Linkeon</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8 font-medium leading-relaxed">
              Подключите свой профиль с Linkeon для точного подбора: <br />
              <span className="font-bold text-foreground">клиенты</span> получат наиболее подходящего специалиста, 
              {' '}<span className="font-bold text-foreground">специалисты</span> — идеальных клиентов
            </p>
            <a 
              href="https://my.linkeon.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              <User className="h-5 w-5" />
              Подключить свой профиль с Linkeon
            </a>
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32">
        <div className="bg-muted p-8 rounded-[2rem] border border-border hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Target className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-foreground">Точный мэтчинг</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Технология Linkeon анализирует ваши ценности, а не только симптомы.
          </p>
        </div>
        
        <div className="bg-muted p-8 rounded-[2rem] border border-border hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Shield className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-foreground">Анонимность</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Ищите и выбирайте специалиста без обязательной регистрации.
          </p>
        </div>

        <div className="bg-muted p-8 rounded-[2rem] border border-border hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Zap className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-foreground">AI-проверка</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Каждый психолог прошел глубокое интервью с агентом Linkeon.
          </p>
        </div>

        <div className="bg-muted p-8 rounded-[2rem] border border-border hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Heart className="text-primary h-6 w-6 fill-primary/10" />
          </div>
          <h3 className="text-lg font-black mb-3 text-foreground">Бережный подход</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Минимум барьеров и стресса при поиске своего специалиста.
          </p>
        </div>
      </div>

      {/* Popular Requests Section */}
      <div className="mb-32">
        <h2 className="text-3xl font-black text-foreground mb-6 text-center">С чем мы помогаем</h2>
        <p className="text-center text-muted-foreground mb-12 font-medium">Выберите направление, которое вам сейчас ближе</p>
        
        <div className="space-y-16">
          {/* Coaching Row */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-4">
              <span className="bg-primary/10 px-4 py-1 rounded-full">Коучинг</span>
              <div className="h-px flex-1 bg-primary/10"></div>
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/specialists?filter=Бизнес" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Briefcase className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Бизнес и Карьера</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Рост в доходе</li>
                <li className="flex items-center gap-2">• Синдром самозванца</li>
                <li className="flex items-center gap-2">• Лидерство</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Эффективность" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Rocket className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Эффективность</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Тайм-менеджмент</li>
                <li className="flex items-center gap-2">• Work-life balance</li>
                <li className="flex items-center gap-2">• Цели</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Личность" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Compass className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Личность</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Предназначение</li>
                <li className="flex items-center gap-2">• Самооценка</li>
                <li className="flex items-center gap-2">• Выбор пути</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Выгорание" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <BatteryCharging className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Выгорание</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Энергия</li>
                <li className="flex items-center gap-2">• Выгорание</li>
                <li className="flex items-center gap-2">• Привычки</li>
              </ul>
            </Link>
          </div>
        </div>

        {/* Psychology Row */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-4">
            <span className="bg-muted px-4 py-1 rounded-full">Психология</span>
            <div className="h-px flex-1 bg-[#F5E6DA]"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/specialists?filter=Тревога" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <CloudLightning className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Тревога</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Тревога и страхи</li>
                <li className="flex items-center gap-2">• Депрессия</li>
                <li className="flex items-center gap-2">• Апатия</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Отношения" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Users className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Отношения</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Конфликты в паре</li>
                <li className="flex items-center gap-2">• Расставание</li>
                <li className="flex items-center gap-2">• Границы</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Самооценка" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Smile className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">Самооценка</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Неуверенность</li>
                <li className="flex items-center gap-2">• Самопринятие</li>
                <li className="flex items-center gap-2">• Поиск себя</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=События" className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Anchor className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground">События</h3>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">• Утрата и горе</li>
                <li className="flex items-center gap-2">• Травмы</li>
                <li className="flex items-center gap-2">• Переезд</li>
              </ul>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SpecialistsList = () => {
  usePageTitle('Специалисты')
  const [specialists, setSpecialists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter')

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'experience' | 'default'>('default')
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'medium' | 'premium'>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [formatFilter, setFormatFilter] = useState<'all' | 'Онлайн' | 'Лично'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; showCTA?: boolean }>>([
    { role: 'ai', content: 'Привет! Я помогу подобрать специалиста именно под ваш запрос. Расскажите немного, что вас сейчас беспокоит?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    if (filter === 'Для вас') {
      scrollToBottom()
    }
  }, [chatMessages, isTyping, filter])

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }]
    setChatMessages(newMessages)
    setChatInput('')
    setIsTyping(true)

    try {
      // AI endpoint not implemented - using mock response
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockReply = 'Спасибо за ваш вопрос! AI диагностика сейчас находится в разработке и будет доступна в ближайшее время.\n\nА пока вы можете выбрать специалиста из нашего каталога или изучить профили наших экспертов.'
      setChatMessages([...newMessages, { role: 'ai', content: mockReply, showCTA: true }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  const loadSpecialists = () => {
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/specialists`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Не удалось загрузить специалистов`)
        return res.json()
      })
      .then(data => {
        let filtered = data.specialists

        // Apply tag/text filter
        if (filter) {
          if (filter === 'Для вас') {
            filtered = filtered.filter((sp: any) => sp.rating >= 4.9)
          } else {
            const searchStr = filter.toLowerCase()
            filtered = filtered.filter((sp: any) => {
              return (
                sp.specialty.toLowerCase().includes(searchStr) ||
                sp.tags.some((tag: string) => tag.toLowerCase().includes(searchStr)) ||
                sp.description.toLowerCase().includes(searchStr) ||
                sp.format.toLowerCase().includes(searchStr)
              )
            })
          }
        }

        // Apply price range filter
        if (priceRange !== 'all') {
          filtered = filtered.filter((sp: any) => {
            const price = sp.price / 100
            if (priceRange === 'budget') return price <= 4000
            if (priceRange === 'medium') return price > 4000 && price <= 6000
            if (priceRange === 'premium') return price > 6000
            return true
          })
        }

        // Apply rating filter
        if (minRating > 0) {
          filtered = filtered.filter((sp: any) => sp.rating >= minRating)
        }

        // Apply format filter
        if (formatFilter !== 'all') {
          filtered = filtered.filter((sp: any) =>
            sp.format.includes(formatFilter)
          )
        }

        // Apply sorting
        if (sortBy !== 'default') {
          filtered = [...filtered].sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price
            if (sortBy === 'price-desc') return b.price - a.price
            if (sortBy === 'rating') return b.rating - a.rating
            if (sortBy === 'experience') return b.experience - a.experience
            return 0
          })
        }

        setSpecialists(filtered)
        setLoading(false)
      })
      .catch(err => {
        console.error('Specialists loading error:', err)
        setError(getUserFriendlyError(err))
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSpecialists()
  }, [filter, sortBy, priceRange, minRating, formatFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-black text-foreground">
            {filter === 'Для вас' ? 'Персональные рекомендации' : filter ? `Специалисты: ${filter}` : 'Наши специалисты'}
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            {filter === 'Для вас' ? 'Специалисты, которые лучше всего подходят под ваш профиль.' : 'Подобраны на основе ваших ценностей и запросов.'}
          </p>
    </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {["Для вас", "Все", "Онлайн", "Лично", "Бизнес", "Эффективность", "Личность", "Выгорание", "Тревога", "Отношения", "Самооценка"].map(tag => (
            <Link
              key={tag}
              to={tag === "Все" ? "/specialists" : `/specialists?filter=${tag}`}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all border-2 flex items-center gap-2 ${
                (tag === "Все" && !filter) || filter === tag
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : tag === "Для вас" 
                    ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                    : 'bg-white border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {tag === "Для вас" && <Heart className={`h-3 w-3 ${filter === tag ? 'fill-white' : 'fill-primary/20'}`} />}
          {tag}
            </Link>
      ))}
        </div>
    </div>

      {/* Filters and Sorting Panel */}
      {filter !== 'Для вас' && (
        <div className="mb-8 bg-white rounded-2xl border border-border p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-black text-muted-foreground uppercase tracking-wider">Сортировать:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'default', label: 'По умолчанию' },
                  { value: 'rating', label: 'По рейтингу' },
                  { value: 'price-asc', label: 'Цена ↑' },
                  { value: 'price-desc', label: 'Цена ↓' },
                  { value: 'experience', label: 'По опыту' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      sortBy === option.value
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 transition-all border-2 border-primary/20"
            >
              <Search className="h-4 w-4" />
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top duration-300">
              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 block">
                  Диапазон цен
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'all', label: 'Любая цена' },
                    { value: 'budget', label: 'До 4000 ₽' },
                    { value: 'medium', label: '4000-6000 ₽' },
                    { value: 'premium', label: 'От 6000 ₽' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPriceRange(option.value as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${
                        priceRange === option.value
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 block">
                  Минимальный рейтинг
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 0, label: 'Любой рейтинг' },
                    { value: 4.5, label: '4.5+ звезд' },
                    { value: 4.7, label: '4.7+ звезд' },
                    { value: 4.9, label: '4.9+ звезд' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setMinRating(option.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all flex items-center gap-2 ${
                        minRating === option.value
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                    >
                      {option.value > 0 && <Star className="h-4 w-4 fill-current" />}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Filter */}
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 block">
                  Формат работы
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'all', label: 'Любой формат' },
                    { value: 'Онлайн', label: 'Только онлайн' },
                    { value: 'Лично', label: 'Только лично' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormatFilter(option.value as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${
                        formatFilter === option.value
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(priceRange !== 'all' || minRating > 0 || formatFilter !== 'all' || sortBy !== 'default') && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Активные фильтры:
              </span>
              {priceRange !== 'all' && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                  Цена: {priceRange === 'budget' ? 'до 4000₽' : priceRange === 'medium' ? '4000-6000₽' : 'от 6000₽'}
                  <button onClick={() => setPriceRange('all')} className="hover:text-primary/70">
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                  Рейтинг: {minRating}+
                  <button onClick={() => setMinRating(0)} className="hover:text-primary/70">
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              {formatFilter !== 'all' && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                  Формат: {formatFilter}
                  <button onClick={() => setFormatFilter('all')} className="hover:text-primary/70">
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                  Сортировка активна
                  <button onClick={() => setSortBy('default')} className="hover:text-primary/70">
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setPriceRange('all')
                  setMinRating(0)
                  setFormatFilter('all')
                  setSortBy('default')
                }}
                className="ml-auto px-4 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-bold hover:bg-destructive/20 transition-all"
              >
                Сбросить все
              </button>
            </div>
          )}
        </div>
      )}

      {filter === 'Для вас' && (
        <div className="mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="bg-white border-2 border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col md:flex-row h-[calc(100vh-300px)] md:h-[500px] max-h-[800px]">
            <div className="hidden md:flex md:w-1/3 bg-primary p-10 text-white flex-col justify-between">
              <div>
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-white" />
          </div>
                <h3 className="text-2xl font-black mb-4">Персональный подбор</h3>
                <p className="text-primary-foreground/80 font-medium text-sm leading-relaxed">
                  Ответьте на несколько вопросов нашего ИИ-ассистента, чтобы мы могли предложить вам наиболее подходящих специалистов на основе ваших ценностей и текущего состояния.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
      {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-primary bg-muted overflow-hidden">
                      <img src={getImageUrl(`/images/spec-${i}.jpg`)} alt="" className="h-full w-full object-cover" />
          </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Вас ждут 40+ экспертов</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-background min-h-0">
              {/* AI Status Indicator */}
              <div className="px-4 md:px-8 pt-4 pb-2 border-b border-border bg-white/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-muted-foreground">AI в разработке</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Персональный ассистент</span>
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 scroll-smooth min-h-0"
              >
                {chatMessages.map((m: any, i) => (
                  <div key={i} className="space-y-3">
                    <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none border border-border'
                      }`}>
                        {m.content}
                      </div>
                    </div>

                    {/* CTA Buttons after AI message */}
                    {m.role === 'ai' && m.showCTA && (
                      <div className="flex justify-start pl-4">
                        <div className="flex flex-col sm:flex-row gap-2 max-w-[85%]">
                          <Link
                            to="/specialists"
                            className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                          >
                            <Search className="h-4 w-4" />
                            Посмотреть каталог
                          </Link>
                          <Link
                            to="/specialists"
                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                            className="bg-white border-2 border-primary text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                          >
                            <Users className="h-4 w-4" />
                            Лучшие специалисты
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full animate-pulse text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      Ассистент думает
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 md:p-6 border-t border-border bg-white flex-shrink-0">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Напишите ваш ответ..." 
                    className="flex-1 bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 md:px-6 py-3 text-sm font-medium outline-none transition-all"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-destructive/20 p-10 shadow-lg">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">Что-то пошло не так</h3>
            <p className="text-muted-foreground font-medium mb-6">{error}</p>
            <button
              onClick={loadSpecialists}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Попробовать снова
            </button>
          </div>
        </div>
      ) : specialists.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-border p-10">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">Ничего не найдено</h3>
            <p className="text-muted-foreground font-medium mb-6">
              По вашему запросу не найдено ни одного специалиста. Попробуйте изменить фильтры или посмотрите всех специалистов.
            </p>
            <Link
              to="/specialists"
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 inline-block"
            >
              Посмотреть всех специалистов
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-5/6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded"></div>
                    <div className="h-6 w-20 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            specialists.map(sp => (
              <div key={sp.id} className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all group border border-border">
                <Link to={`/specialist/${sp.id}`} className="block">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {sp.image ? (
                      <img
                        src={getImageUrl(sp.image)}
                        alt={sp.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <User className="h-20 w-20 text-primary opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-black text-sm shadow-lg">
                      {(sp.price / 100).toLocaleString()} ₽
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                      Доступен
                    </div>
                  </div>
                </Link>

                <div className="p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{sp.rating}</span>
                    <span className="text-xs text-muted-foreground">({sp.totalReviews} отзывов)</span>
                  </div>

                  <Link to={`/specialist/${sp.id}`}>
                    <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{sp.name}</h3>
                    <p className="text-sm text-primary font-bold mb-3">{sp.specialty}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {sp.description}
                    </p>
                  </Link>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {sp.tags.map((tag: string) => (
                      <span key={tag} className="text-[11px] font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/book/${sp.id}`}
                    className="w-full bg-primary text-white py-4 rounded-2xl text-center text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-auto"
                  >
                    Записаться на сессию
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
  </div>
)
}

const Onboarding = () => {
  usePageTitle('Для психологов')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Здравствуйте! Я Linkeon. Моя задача — заглянуть за рамки ваших дипломов. Расскажите, в чем заключается ваша истинная философия работы? Какие ценности и какой энергетический настрой вы приносите в каждую сессию?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      // AI endpoint not implemented - using mock response
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockReply = 'Спасибо за интерес к Linkeon! AI анализ ценностей временно недоступен. Эта функция будет добавлена в ближайшее время.'
      setMessages([...newMessages, { role: 'ai', content: mockReply }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary text-white p-8 rounded-[2rem] shadow-2xl shadow-primary/20">
            <Sparkles className="h-10 w-10 mb-6" />
            <h2 className="text-2xl font-black mb-4">Агент Linkeon</h2>
            <p className="text-primary-foreground/80 font-medium leading-relaxed">
              Мы смотрим глубже ваших дипломов. Linkeon анализирует вашу систему ценностей, подходы к работе и энергетический настрой, чтобы найти «ваших» клиентов.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5">
            <h3 className="font-black mb-4">Что это даст?</h3>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li className="flex gap-3"><span className="text-primary font-bold">01</span> Автоматическое портфолио</li>
              <li className="flex gap-3"><span className="text-primary font-bold">02</span> Точный подбор клиентов</li>
              <li className="flex gap-3"><span className="text-primary font-bold">03</span> Рост доверия аудитории</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5 space-y-6">
            <h3 className="font-black">Документы</h3>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2">Резюме / CV</label>
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-2" />
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase">Загрузить PDF</span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </label>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2">Профессиональное эссе</label>
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-2" />
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase">Загрузить эссе</span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border-2 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[700px]">
          <div className="bg-white p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary fill-primary/10" />
              </div>
        <div>
                <h2 className="font-black text-sm">Интервью с Linkeon</h2>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase">В сети</span>
                </div>
              </div>
        </div>
      </div>
      
          <div 
            ref={chatContainerRef}
            className="flex-1 p-8 overflow-y-auto space-y-6 scroll-smooth"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-[1.5rem] font-medium text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                    : 'bg-muted/50 text-foreground rounded-tl-none border-2 border-primary/5'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/50 p-4 rounded-2xl animate-pulse text-xs font-black uppercase text-muted-foreground">
                  Linkeon печатает...
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t">
        <div className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Расскажите о себе..." 
                className="flex-1 bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

const AITools = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Привет! Я Екатерина, ваш персональный ассистент по генерации контента. Расскажите, о чем вы хотите написать пост или какой контент вам нужен?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      // AI endpoint not implemented - using mock response
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockReply = 'Спасибо за ваш запрос! Агент Екатерина временно недоступен. Функция генерации контента будет добавлена в ближайшее время.'
      setMessages([...newMessages, { role: 'ai', content: mockReply }])
    } catch (err) {
      console.error(err)
      setMessages([...newMessages, { role: 'ai', content: 'Извините, произошла ошибка. Попробуйте еще раз.' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link 
        to="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-primary transition-all mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Назад в личный кабинет
      </Link>

      <div className="text-center mb-12">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-black mb-4">Агент Екатерина</h1>
        <p className="text-muted-foreground font-medium">Ваш персональный ассистент по генерации контента</p>
      </div>

      <div className="bg-white border-2 border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div 
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto space-y-6 scroll-smooth"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-muted text-foreground rounded-tl-none border border-border'
              }`}>
                {m.content}
          </div>
        </div>
      ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-full animate-pulse text-[10px] font-black uppercase text-muted-foreground">
                Екатерина печатает...
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-border bg-white">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишите ваш запрос..." 
              className="flex-1 bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
    </div>
  </div>
)
}

const SpecialistProfile = () => {
  const { id } = useParams()
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    text: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadProfile = () => {
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/specialists`)
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить данные')
        return res.json()
      })
      .then(data => {
        const found = data.specialists.find((s: any) => s.id === parseInt(id || '0'))
        if (!found) {
          setError('Специалист не найден')
        }
        setSpecialist(found)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Произошла ошибка при загрузке профиля')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadProfile()
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.text.trim()) return

    setSubmittingReview(true)
    try {
      const res = await fetch(`${API_URL}/specialists/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })
      const data = await res.json()
      if (data.success) {
        setReviewForm({ author: '', rating: 5, text: '' })
        setShowReviewForm(false)
        alert('Спасибо за отзыв! Он будет опубликован после проверки специалистом.')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при отправке отзыва')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
          <div className="h-96 bg-muted"></div>
          <div className="p-10 space-y-6">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="flex gap-2 mt-6">
              <div className="h-8 w-24 bg-muted rounded"></div>
              <div className="h-8 w-24 bg-muted rounded"></div>
              <div className="h-8 w-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !specialist) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border-2 border-destructive/20 p-10 text-center shadow-lg">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-3">
            {error || 'Специалист не найден'}
          </h3>
          <p className="text-muted-foreground font-medium mb-8">
            Проверьте правильность ссылки или вернитесь к списку специалистов
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={loadProfile}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Попробовать снова
            </button>
            <Link
              to="/specialists"
              className="bg-muted text-foreground px-8 py-3 rounded-2xl font-black text-sm hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              К списку специалистов
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <Breadcrumbs items={[
        { label: 'Специалисты', path: '/specialists' },
        { label: specialist.name }
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Photo & Base Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] border border-border p-8 shadow-xl shadow-black/5 sticky top-24">
            <div className="h-64 w-full rounded-[2.5rem] overflow-hidden mb-8 border-4 border-primary/10">
              <img 
                src={getImageUrl(specialist.image)} 
                alt={specialist.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">{specialist.name}</h1>
            <p className="text-primary font-bold mb-6">{specialist.specialty}</p>
            
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-black">{specialist.rating}</span>
              <span className="text-sm text-muted-foreground font-medium">({specialist.reviews} отзывов)</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Стоимость</span>
                <span className="font-black text-xl">{specialist.price} ₽</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Формат</span>
                <span className="font-bold text-sm">{specialist.format}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Город</span>
                <span className="font-bold text-sm">{specialist.location}</span>
              </div>
            </div>

            <Link 
              to={`/book/${specialist.id}`}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              Записаться на сессию
            </Link>
          </div>
        </div>

        {/* Right Column: Detailed Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              О специалисте
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-border p-10 shadow-sm leading-relaxed text-foreground/80 font-medium">
              <p className="mb-6">{specialist.fullDescription || specialist.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-8">
                {specialist.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] font-black bg-muted px-4 py-2 rounded-xl text-muted-foreground uppercase border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {specialist.education && (
            <section>
              <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                Образование
              </h2>
              <div className="bg-white rounded-[2.5rem] border border-border p-10 shadow-sm space-y-4">
                {specialist.education.map((edu: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <p className="font-bold text-foreground/70">{edu}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <Smile className="h-6 w-6 text-primary" />
                Отзывы клиентов
              </h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-4 py-2 rounded-full">
                {specialist.reviews} отзывов
              </span>
            </div>
            
            <div className="space-y-6">
              {(specialist.detailedReviews || [
                { id: 1, author: 'Клиент', text: 'Замечательный специалист, очень помог.', rating: 5 },
                { id: 2, author: 'Клиент', text: 'Профессионально и комфортно.', rating: 5 }
              ]).map((review: any) => (
                <div key={review.id} className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary">
                        {review.author[0]}
                      </div>
                      <span className="font-black text-foreground">{review.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                    «{review.text}»
                  </p>
                </div>
              ))}
            </div>
            
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full mt-6 bg-white border-2 border-primary text-primary py-4 rounded-2xl font-black hover:bg-primary/5 transition-all"
              >
                Написать отзыв
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-6 bg-white rounded-[2.5rem] border-2 border-primary/20 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-black text-foreground mb-2">Ваше имя (необязательно)</label>
                  <input
                    type="text"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    placeholder="Имя"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black text-foreground mb-2">Оценка</label>
        <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating })}
                        className={`p-2 rounded-lg transition-all ${
                          reviewForm.rating >= rating
                            ? 'text-yellow-400'
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`h-6 w-6 ${reviewForm.rating >= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-black text-foreground mb-2">Ваш отзыв</label>
                  <textarea
                    required
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all h-32 resize-none"
                    placeholder="Расскажите о вашем опыте..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false)
                      setReviewForm({ author: '', rating: 5, text: '' })
                    }}
                    className="px-6 bg-white border-2 border-border text-foreground py-4 rounded-2xl font-black hover:bg-muted transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </section>

          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">Готовы начать работу?</h3>
              <p className="text-primary-foreground/80 font-medium">
                Выберите удобное время в календаре {specialist.name.split(' ')[0]} и запишитесь на первую сессию.
              </p>
            </div>
            <Link 
              to={`/book/${specialist.id}`}
              className="bg-white text-primary px-10 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-black/10 whitespace-nowrap"
            >
              Записаться сейчас
            </Link>
          </div>
        </div>
    </div>
  </div>
)
}

const Booking = () => {
  const { id } = useParams()
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customDate, setCustomDate] = useState<string>('')
  const [customTime, setCustomTime] = useState<string>('')
  const [finalBookingDate, setFinalBookingDate] = useState<string>('')
  const [finalBookingTime, setFinalBookingTime] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })

  const steps = [
    { number: 1, title: 'Дата и время', icon: Calendar },
    { number: 2, title: 'Ваши данные', icon: User },
    { number: 3, title: 'Подтверждение', icon: CheckCircle2 }
  ]

  const canProceedToStep2 = () => {
    if (useCustomTime) {
      return customDate && customTime
    }
    return selectedDate && selectedTime
  }

  const canProceedToStep3 = () => {
    return formData.name.trim() && formData.phone.trim()
  }

  const loadSpecialist = () => {
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/specialists`)
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить данные')
        return res.json()
      })
      .then(data => {
        const found = data.specialists.find((s: any) => s.id === parseInt(id || '0'))
        if (!found) {
          setError('Специалист не найден')
        }
        setSpecialist(found)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Произошла ошибка при загрузке')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSpecialist()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError(null)

    const finalDate = useCustomTime ? customDate : selectedDate
    const finalTime = useCustomTime ? customTime : selectedTime

    if (!finalDate || !finalTime) {
      setBookingError('Пожалуйста, выберите дату и время')
      return
    }

    setFinalBookingDate(finalDate)
    setFinalBookingTime(finalTime)
    setSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialistId: id,
          date: finalDate,
          time: finalTime,
          isCustomTime: useCustomTime
        })
      })
      if (!res.ok) throw new Error('Не удалось создать бронирование')
      setBooked(true)
    } catch (err: any) {
      setBookingError(err.message || 'Произошла ошибка при отправке запроса. Попробуйте еще раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !specialist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
          <div className="h-64 bg-muted"></div>
          <div className="p-10 space-y-6">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!specialist && !loading)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border-2 border-destructive/20 p-10 text-center shadow-lg">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-3">
            {error || 'Специалист не найден'}
          </h3>
          <p className="text-muted-foreground font-medium mb-8">
            Проверьте правильность ссылки или вернитесь к списку специалистов
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={loadSpecialist}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Попробовать снова
            </button>
            <Link
              to="/specialists"
              className="bg-muted text-foreground px-8 py-3 rounded-2xl font-black text-sm hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              К списку специалистов
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const availableDates = Object.keys(specialist.slots || {})

  if (booked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <Link 
          to={`/specialist/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-primary transition-all mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Назад к профилю
        </Link>
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-green-100 text-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black mb-4">Запрос отправлен!</h2>
          <p className="text-muted-foreground font-medium mb-2">
            Дата: <span className="text-foreground font-bold">
              {finalBookingDate ? new Date(finalBookingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </span>
          </p>
          <p className="text-muted-foreground font-medium mb-2">
            Время: <span className="text-foreground font-bold">{finalBookingTime}</span>
          </p>
          <p className="text-muted-foreground font-medium mb-10">
            {specialist.name} получит ваш запрос и свяжется с вами для подтверждения.
          </p>
          <Link to="/" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
            Вернуться на главную
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <Link 
        to={`/specialist/${id}`}
        className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-primary transition-all mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Назад к профилю
      </Link>
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Info Side */}
          <div className="lg:col-span-2 p-12 bg-primary text-white">
            <div className="h-24 w-24 rounded-3xl overflow-hidden mb-8 border-4 border-white/20 shadow-xl">
              {specialist.image ? (
                <img src={getImageUrl(specialist.image)} alt={specialist.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-white/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-black mb-2">Запись на сессию</h2>
            <p className="text-primary-foreground/80 mb-8 font-medium">Вы выбрали специалиста:</p>
            
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 mb-8">
              <h3 className="text-xl font-bold mb-1">{specialist.name}</h3>
              <div className="flex items-center gap-1 mb-3 opacity-90">
                <Star className="h-3 w-3 fill-white text-white" />
                <span className="text-xs font-bold">{specialist.rating}</span>
                <span className="text-[10px] font-medium opacity-70">({specialist.reviews} отзывов)</span>
              </div>
              <p className="text-sm opacity-80 mb-4">{specialist.specialty}</p>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="h-4 w-4" />
                <span>{specialist.price} ₽ / сессия</span>
              </div>
            </div>

            <div className="space-y-4 text-sm font-medium opacity-80">
              <p>• Длительность сессии: 50 минут</p>
              <p>• Формат: {specialist.format}</p>
              <p>• Локация: {specialist.location}</p>
            </div>
          </div>
          
          {/* Calendar & Form Side */}
          <div className="lg:col-span-3 p-12">
            {/* Stepper */}
            <div className="mb-12">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = currentStep > step.number
                  const isCurrent = currentStep === step.number

                  return (
                    <div key={step.number} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        {/* Step Circle */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all relative z-10 ${
                            isCompleted
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                              : isCurrent
                              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>

                        {/* Step Title */}
                        <span
                          className={`mt-3 text-xs font-bold text-center transition-all ${
                            isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>

                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-1 transition-all ${
                            currentStep > step.number ? 'bg-green-500' : 'bg-muted'
                          }`}
                          style={{ transform: 'translateY(-50%)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Step 1: Date Selection */}
              {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-black text-foreground">Выберите дату и время</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomTime(!useCustomTime)
                      setSelectedDate('')
                      setSelectedTime('')
                      setCustomDate('')
                      setCustomTime('')
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                      useCustomTime 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {useCustomTime ? 'Выбрать из доступных' : 'Предложить свое время'}
                  </button>
                </div>
                
                {!useCustomTime ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableDates.length > 0 ? (
                      availableDates.map(date => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date)
                            setSelectedTime('')
                          }}
                          className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                            selectedDate === date 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-muted bg-white hover:border-primary/20'
                          }`}
                        >
                          {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <p className="text-sm font-medium">Нет доступных дат</p>
                        <p className="text-xs mt-2">Попробуйте предложить свое время</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">Дата</label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => {
                          setCustomDate(e.target.value)
                          setCustomTime('')
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">Время (московское)</label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">Укажите удобное для вас время, специалист подтвердит его</p>
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                {!useCustomTime && selectedDate && specialist.slots[selectedDate] && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top duration-300">
                    <label className="block text-sm font-bold text-foreground mb-4">Выберите время (московское)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {specialist.slots[selectedDate].map((time: string) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            selectedTime === time
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-muted bg-white hover:border-primary/20'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1 Navigation */}
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => canProceedToStep2() && setCurrentStep(2)}
                    disabled={!canProceedToStep2()}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Далее
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <label className="block text-sm font-black text-foreground">Контактные данные</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="Ваше имя"
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="+7 (900) 000-00-00"
                    />
                  </div>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all h-24 resize-none"
                    placeholder="Кратко опишите ваш запрос (необязательно)"
                  />

                  {/* Step 2 Navigation */}
                  <div className="flex gap-3 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-muted text-foreground px-8 py-3 rounded-2xl font-bold hover:bg-muted/80 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => canProceedToStep3() && setCurrentStep(3)}
                      disabled={!canProceedToStep3()}
                      className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Далее
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <label className="block text-sm font-black text-foreground mb-6">Подтверждение записи</label>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-3xl p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-muted-foreground mb-1">Дата и время</p>
                        <p className="text-lg font-black text-foreground">
                          {(useCustomTime ? customDate : selectedDate) &&
                            new Date(useCustomTime ? customDate : selectedDate).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                        </p>
                        <p className="text-sm font-bold text-primary">{useCustomTime ? customTime : selectedTime}</p>
                        {useCustomTime && (
                          <p className="text-xs text-muted-foreground mt-1">Требует подтверждения специалиста</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-muted-foreground mb-1">Контактные данные</p>
                        <p className="text-lg font-black text-foreground">{formData.name}</p>
                        <p className="text-sm font-bold text-muted-foreground">{formData.phone}</p>
                        {formData.message && (
                          <p className="text-sm text-muted-foreground mt-2 italic">«{formData.message}»</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Wallet className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-muted-foreground mb-1">Стоимость сессии</p>
                        <p className="text-2xl font-black text-foreground">{specialist.price} ₽</p>
                        <p className="text-xs text-muted-foreground mt-1">Оплата после подтверждения</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Error */}
                  {bookingError && (
                    <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-destructive mb-1">Ошибка бронирования</p>
                        <p className="text-xs text-destructive/80 font-medium">{bookingError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingError(null)}
                        className="text-destructive/50 hover:text-destructive transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 3 Navigation */}
                  <div className="flex gap-3 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-muted text-foreground px-8 py-3 rounded-2xl font-bold hover:bg-muted/80 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Подтвердить запись
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
        </div>
      </div>
    </div>
  </div>
)
}

const Diagnostic = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Привет! Я ваш ИИ-ассистент в Hearty. Чтобы подобрать идеального психолога или коуча, давайте попробуем вместе сформулировать ваш запрос. Что вас сейчас беспокоит больше всего?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      // AI endpoint not implemented - using mock response
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockReply = 'Спасибо за интерес к AI диагностике! Эта функция временно недоступна и будет добавлена в ближайшее время. Пока вы можете выбрать специалиста из каталога или записаться на консультацию.'
      setMessages([...newMessages, { role: 'ai', content: mockReply }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
  <div className="max-w-4xl mx-auto px-4 py-20">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-primary transition-all mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Назад на главную
      </Link>
      <div className="text-center mb-12">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black mb-4">Предварительная диагностика</h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">
          Этот разговор поможет нам понять суть вашего запроса и подобрать специалиста, который лучше всего подходит именно вам.
        </p>
      </div>

      <div className="bg-white border-2 border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div 
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto space-y-6 scroll-smooth"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-[1.5rem] font-medium text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                  : 'bg-muted text-foreground rounded-tl-none border border-border'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted p-4 rounded-2xl animate-pulse text-[10px] font-black uppercase text-muted-foreground">
                Ассистент думает...
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-border">
          <div className="flex gap-3">
          <input 
            type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Опишите свои чувства или ситуацию..." 
              className="flex-1 bg-muted border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
)
}

const DashboardSelector = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect based on user role
    if (user?.role === 'CLIENT') {
      navigate('/dashboard/client', { replace: true })
    } else if (user?.role === 'SPECIALIST') {
      navigate('/dashboard/specialist', { replace: true })
    } else if (user?.role === 'ADMIN') {
      navigate('/dashboard/admin', { replace: true })
    }
  }, [user, navigate])

  // Show selector only if role is not determined yet (shouldn't happen normally)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Перенаправление...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-foreground mb-4">Личный кабинет</h1>
        <p className="text-muted-foreground font-medium">Выберите тип вашего кабинета</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          to="/dashboard/client"
          className="bg-white border-2 border-border rounded-[3rem] p-12 shadow-xl hover:shadow-2xl transition-all hover:border-primary/50 group"
        >
          <div className="text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-all">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-4">Кабинет клиента</h2>
            <p className="text-muted-foreground font-medium leading-relaxed mb-6">
              Управляйте своими записями, просматривайте историю сессий и общайтесь со специалистами
            </p>
            <div className="bg-primary text-white px-6 py-3 rounded-2xl font-bold inline-block group-hover:scale-105 transition-all">
              Войти как клиент
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/specialist"
          className="bg-white border-2 border-border rounded-[3rem] p-12 shadow-xl hover:shadow-2xl transition-all hover:border-primary/50 group"
        >
          <div className="text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-all">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-4">Кабинет специалиста</h2>
            <p className="text-muted-foreground font-medium leading-relaxed mb-6">
              Управляйте расписанием, записями клиентов, отзывами и профилем
            </p>
            <div className="bg-primary text-white px-6 py-3 rounded-2xl font-bold inline-block group-hover:scale-105 transition-all">
              Войти как специалист
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

const NotFound = () => {
  usePageTitle('Страница не найдена')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-black text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Страница не найдена</h2>
        <p className="text-lg text-muted-foreground mb-8">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30"
          >
            На главную
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-white border-2 border-border px-8 py-3 rounded-full font-bold hover:border-primary/30 transition-all"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}

const ClientDashboard = () => {
  usePageTitle('Кабинет клиента')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'messages'>('bookings')
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const clientName = 'Марина' // Mock имя клиента

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])

  useEffect(() => {
    // Mock данные для клиента
    const mockBookings = [
      { id: 1, specialistName: 'Алексей Иванов', specialistId: 1, date: '2025-12-20', time: '10:00', status: 'confirmed', specialty: 'Психолог, Гештальт-терапевт' },
      { id: 2, specialistName: 'Мария Петрова', specialistId: 2, date: '2025-12-22', time: '14:00', status: 'pending', specialty: 'Коуч, Бизнес-консультант' }
    ]
    setTimeout(() => {
      setBookings(mockBookings)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (activeTab === 'messages') {
      fetch(`${API_URL}/chat/rooms`)
        .then(res => res.json())
        .then(data => setChats(data.rooms))
        .catch(console.error)
    }
  }, [activeTab, clientName])

  useEffect(() => {
    if (selectedChat) {
      fetch(`${API_URL}/chat/rooms/${selectedChat.specialistId}/messages`)
        .then(res => res.json())
        .then(setChatMessages)
        .catch(console.error)
    }
  }, [selectedChat, clientName])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedChat) return
    
    const messageText = chatInput
    setChatInput('')
    setIsTyping(true)
    
    try {
      const res = await fetch(`${API_URL}/chat/rooms/${selectedChat.specialistId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      })
      const data = await res.json()
      if (data.success) {
        setChatMessages([...chatMessages, data.message])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { text: string; color: string } } = {
      'confirmed': { text: 'Подтверждена', color: 'bg-green-100 text-green-600' },
      'pending': { text: 'Ожидает подтверждения', color: 'bg-orange-100 text-orange-600' },
      'completed': { text: 'Завершена', color: 'bg-blue-100 text-blue-600' },
      'cancelled': { text: 'Отменена', color: 'bg-gray-100 text-gray-600' }
    }
    return labels[status] || { text: status, color: 'bg-muted text-muted-foreground' }
  }

  if (loading) return <div className="p-20 text-center">Загрузка кабинета...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">Добрый день!</h1>
          <p className="text-muted-foreground font-medium">Ваш личный кабинет клиента</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white p-1 rounded-2xl border border-border flex">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
            >
              Записи
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'messages' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
            >
              Сообщения
              {chats.some(c => c.unreadCount > 0) && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {chats.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </button>
          </div>
          <a 
            href="https://my.linkeon.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-2xl font-bold text-sm hover:bg-muted transition-all"
          >
            <User className="h-4 w-4 text-primary" />
            Подключить профиль Linkeon
          </a>
        </div>
      </div>
      
      {activeTab === 'bookings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-foreground">Мои записи</h2>
            
            {bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-border text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold text-muted-foreground">У вас пока нет записей</p>
                <Link to="/specialists" className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all">
                  Записаться к специалисту
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const status = getStatusLabel(booking.status)
                  return (
                    <div key={booking.id} className="bg-white p-6 rounded-3xl border border-border hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-black text-foreground text-lg mb-1">{booking.specialistName}</h3>
                          <p className="text-sm text-muted-foreground">{booking.specialty}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {new Date(booking.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {booking.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20">
              <h3 className="text-xl font-black mb-4">Быстрые действия</h3>
              <div className="space-y-3">
                <Link 
                  to="/specialists"
                  className="block bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-2xl font-bold transition-all text-center"
                >
                  Найти специалиста
                </Link>
                <Link 
                  to="/diagnostic"
                  className="block bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-2xl font-bold transition-all text-center"
                >
                  Предварительная диагностика
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-border p-6 shadow-sm">
              <h2 className="text-2xl font-black text-foreground mb-6">Чаты</h2>
              {chats.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">Нет активных чатов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <button
                      key={chat.specialistId}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selectedChat?.specialistId === chat.specialistId
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border bg-white hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {chat.specialistImage ? (
                          <img 
                            src={getImageUrl(chat.specialistImage)} 
                            alt={chat.specialistName}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary">
                            {chat.specialistName[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-black text-foreground">{chat.specialistName}</h3>
                          <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedChat ? (
              <div className="bg-white rounded-[2rem] border border-border shadow-sm flex flex-col h-[600px]">
                <div className="p-6 border-b border-border flex items-center gap-4">
                  {selectedChat.specialistImage ? (
                    <img 
                      src={getImageUrl(selectedChat.specialistImage)} 
                      alt={selectedChat.specialistName}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary">
                      {selectedChat.specialistName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-foreground">{selectedChat.specialistName}</h3>
                  </div>
                </div>
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth"
                >
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${
                        msg.sender === 'client'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none border border-border'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-full animate-pulse text-[10px] font-black uppercase text-muted-foreground">
                        Печатает...
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-border">
        <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Напишите сообщение..."
                      className="flex-1 bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isTyping}
                      className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
          </div>
        </div>
      </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-border p-12 shadow-sm text-center flex items-center justify-center h-[600px]">
                <div>
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold text-muted-foreground">Выберите чат для общения</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SpecialistDashboard = () => {
  usePageTitle('Кабинет специалиста')
  const [stats, setStats] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'profile' | 'reviews' | 'clients'>('overview')
  const [clientViewMode, setClientViewMode] = useState<'notes' | 'chat'>('notes')
  const [chats, setChats] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isTyping])
  const [pendingReviews, setPendingReviews] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientNotes, setClientNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [showAddClientForm, setShowAddClientForm] = useState(false)
  const [showEditClientForm, setShowEditClientForm] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  })
  const [savingClient, setSavingClient] = useState(false)
  const [editingDate, setEditingDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [savingSlots, setSavingSlots] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    phone: '',
    email: '',
    instagram: '',
    telegram: '',
    vk: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [showCreateBookingForm, setShowCreateBookingForm] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [showNewClientInBooking, setShowNewClientInBooking] = useState(false)
  const [newClientInBooking, setNewClientInBooking] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [creatingClientInBooking, setCreatingClientInBooking] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    status: 'confirmed'
  })

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Convert Sunday (0) to 7 for easier calculation
    const startDay = startingDayOfWeek === 0 ? 7 : startingDayOfWeek
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < startDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setEditingDate(today.toISOString().split('T')[0])
  }

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, specialistsRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/specialist/1/dashboard`),
        fetch(`${API_URL}/bookings?specialistId=1`),
        fetch(`${API_URL}/specialists`),
        fetch(`${API_URL}/reviews/specialist/1?status=pending`),
        // NOTES_DISABLED: fetch(`${API_URL}/notes/specialist/1/clients`)
      ])
      const statsData = await statsRes.json()
      const bookingsData = await bookingsRes.json()
      const specialistsData = await specialistsRes.json()
      const reviewsData = await reviewsRes.json()
      // NOTES_DISABLED: const clientsData = await clientsRes.json()

      setStats(statsData)
      setBookings(bookingsData)
      setSpecialist(specialistsData.specialists.find((s: any) => s.id === 1))
      setPendingReviews(reviewsData)
      setClients([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadClientNotes = async (clientName: string) => {
    setLoadingNotes(true)
    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Notes feature disabled for client:', clientName)
      setClientNotes([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNotes(false)
    }
  }

  const handleSelectClient = async (client: any) => {
    if (!client || !client.name) return
    setSelectedClient(client)
    setShowAddClientForm(false)
    setShowEditClientForm(false)
    setClientViewMode('notes')
    await loadClientNotes(client.name)
  }

  const handleGoToMessages = async (client: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!client || !client.name) return
    setSelectedClient(client)
    setShowAddClientForm(false)
    setShowEditClientForm(false)
    setClientViewMode('chat')
    await loadClientNotes(client.name)
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || !selectedClient || !selectedClient.name) return

    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Add note disabled:', newNote)
      alert('Функция заметок временно недоступна')
    } catch (err) {
      console.error(err)
      alert('Ошибка при добавлении заметки')
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Удалить эту заметку?')) return
    if (!selectedClient || !selectedClient.name) return

    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Delete note disabled:', noteId)
      alert('Функция заметок временно недоступна')
    } catch (err) {
      console.error(err)
      alert('Ошибка при удалении заметки')
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      alert('Имя и телефон обязательны')
      return
    }

    setSavingClient(true)
    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Add client disabled:', clientForm)
      alert('Функция управления клиентами временно недоступна')
    } catch (err) {
      console.error(err)
      alert('Ошибка при добавлении клиента')
    } finally {
      setSavingClient(false)
    }
  }

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      alert('Имя и телефон обязательны')
      return
    }

    setSavingClient(true)
    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Edit client disabled:', clientForm)
      alert('Функция управления клиентами временно недоступна')
    } catch (err) {
      console.error(err)
      alert('Ошибка при обновлении клиента')
    } finally {
      setSavingClient(false)
    }
  }

  const handleStartEditClient = () => {
    if (!selectedClient) return
    setClientForm({
      name: selectedClient.name,
      phone: selectedClient.phone,
      email: selectedClient.email || '',
      notes: selectedClient.notes || ''
    })
    setShowEditClientForm(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === 'clients') {
      fetch(`${API_URL}/chat/rooms`)
        .then(res => res.json())
        .then(data => setChats(data.rooms))
        .catch(console.error)
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedClient && selectedClient.name && clientViewMode === 'chat') {
      fetch(`${API_URL}/chat/rooms/${encodeURIComponent(selectedClient.name)}/messages`)
        .then(res => res.json())
        .then(setChatMessages)
        .catch(console.error)
    }
  }, [selectedClient, clientViewMode])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedClient || !selectedClient.name) return
    
    const messageText = chatInput
    setChatInput('')
    setIsTyping(true)
    
    try {
      const res = await fetch(`${API_URL}/chat/rooms/${encodeURIComponent(selectedClient.name)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      })
      const data = await res.json()
      if (data.success) {
        setChatMessages([...chatMessages, data.message])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleApproveReview = async (reviewId: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${reviewId}/approve`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setPendingReviews(pendingReviews.filter(r => r.id !== reviewId))
        fetchData() // Refresh specialist data to update reviews
        alert('Отзыв одобрен и опубликован!')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при одобрении отзыва')
    }
  }

  const handleRejectReview = async (reviewId: number) => {
    if (!confirm('Вы уверены, что хотите отклонить этот отзыв?')) return
    
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${reviewId}/reject`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setPendingReviews(pendingReviews.filter(r => r.id !== reviewId))
        alert('Отзыв отклонен')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при отклонении отзыва')
    }
  }

  const toggleSlot = async (time: string) => {
    if (!specialist) return
    const currentSlots = specialist.slots[editingDate] || []
    const newSlots = currentSlots.includes(time)
      ? currentSlots.filter((t: string) => t !== time)
      : [...currentSlots, time].sort()

    setSavingSlots(true)
    try {
      const res = await fetch(`${API_URL}/specialists/1/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: editingDate, slots: newSlots })
      })
      const data = await res.json()
      if (data.success) {
        setSpecialist({ ...specialist, slots: data.slots })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingSlots(false)
    }
  }

  const syncWithGoogleCalendar = () => {
    // Создаем iCal файл со всеми встречами
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Hearty Platform//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n'
    
    bookings.forEach((booking: any) => {
      if (booking.status === 'confirmed' || booking.status === 'pending') {
        const [hours, minutes] = booking.time.split(':')
        const startDate = new Date(booking.date)
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        const endDate = new Date(startDate)
        endDate.setHours(startDate.getHours() + 1) // Сессия длится 1 час
        
        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        }
        
        icalContent += `BEGIN:VEVENT\n`
        icalContent += `UID:${booking.id}@hearty.pro\n`
        icalContent += `DTSTART:${formatDate(startDate)}\n`
        icalContent += `DTEND:${formatDate(endDate)}\n`
        icalContent += `SUMMARY:Сессия с ${booking.clientName || 'клиентом'}\n`
        icalContent += `DESCRIPTION:Сессия с ${booking.clientName || 'клиентом'}. Статус: ${getStatusLabel(booking.status)}\n`
        icalContent += `STATUS:CONFIRMED\n`
        icalContent += `END:VEVENT\n`
      }
    })
    
    icalContent += 'END:VCALENDAR'
    
    // Создаем blob и скачиваем файл
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'hearty-calendar.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    alert('Календарь экспортирован! Импортируйте файл hearty-calendar.ics в Google Calendar.')
  }

  const getBookingsForDate = (date: string) => {
    return bookings.filter((booking: any) => booking.date === date)
  }

  const handleCreateClientInBooking = async () => {
    if (!newClientInBooking.name.trim() || !newClientInBooking.phone.trim()) {
      alert('Заполните имя и телефон клиента')
      return
    }

    setCreatingClientInBooking(true)
    try {
      // NOTES_DISABLED: Feature not implemented on backend
      console.log('Create client in booking disabled:', newClientInBooking)
      alert('Функция управления клиентами временно недоступна')
    } catch (err) {
      console.error(err)
      alert('Ошибка при создании клиента')
    } finally {
      setCreatingClientInBooking(false)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingForm.clientName || !bookingForm.clientName.trim()) {
      alert('Выберите клиента или создайте нового')
      return
    }
    
    const clientName = bookingForm.clientName.trim()

    setCreatingBooking(true)
    try {
      const newBooking = {
        id: Date.now(), // Временный ID, в реальном приложении будет генерироваться на сервере
        clientName: clientName,
        date: bookingForm.date,
        time: bookingForm.time,
        status: bookingForm.status,
        specialistId: 1
      }

      // Отправляем на сервер
      const res = await fetch(`${API_URL}/bookings?specialistId=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      })
      
      if (res.ok) {
        const data = await res.json()
        setBookings([...bookings, data.booking || newBooking])
        setShowCreateBookingForm(false)
        setBookingForm({
          clientName: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          status: 'confirmed'
        })
        setShowNewClientInBooking(false)
        setNewClientInBooking({ name: '', phone: '', email: '' })
        alert('Встреча успешно создана!')
      } else {
        throw new Error('Ошибка при создании встречи')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при создании встречи')
    } finally {
      setCreatingBooking(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !specialist) return

    const formData = new FormData()
    formData.append('photo', file)

    setUploadingPhoto(true)
    try {
      const res = await fetch(`${API_URL}/upload/specialist/image`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setSpecialist({ ...specialist, image: data.image })
        alert('Фото успешно обновлено!')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при загрузке фото')
    } finally {
      setUploadingPhoto(false)
    }
  }

  useEffect(() => {
    if (specialist) {
      setProfileForm({
        phone: specialist.phone || '',
        email: specialist.email || '',
        instagram: specialist.socialLinks?.instagram || '',
        telegram: specialist.socialLinks?.telegram || '',
        vk: specialist.socialLinks?.vk || ''
      })
    }
  }, [specialist])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialist) return

    setSavingProfile(true)
    try {
      const socialLinks = {
        instagram: profileForm.instagram || undefined,
        telegram: profileForm.telegram || undefined,
        vk: profileForm.vk || undefined
      }
      // Remove undefined values
      Object.keys(socialLinks).forEach(key => {
        if (socialLinks[key as keyof typeof socialLinks] === undefined) {
          delete socialLinks[key as keyof typeof socialLinks]
        }
      })

      const res = await fetch(`${API_URL}/specialists/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profileForm.phone,
          email: profileForm.email,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        setSpecialist({ ...specialist, ...data.specialist })
        setEditingProfile(false)
        alert('Профиль успешно обновлен!')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при сохранении профиля')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleBookingStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
        // Refresh stats
        const statsRes = await fetch(`${API_URL}/analytics/specialist/1/dashboard`)
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка при изменении статуса')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'new': 'Новая',
      'confirmed': 'Подтверждена',
      'completed': 'Завершена',
      'cancelled': 'Отменена'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'new': { bg: 'bg-orange-100', text: 'text-orange-600' },
      'confirmed': { bg: 'bg-green-100', text: 'text-green-600' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-600' }
    }
    return colors[status] || { bg: 'bg-muted', text: 'text-muted-foreground' }
  }

  const filteredBookings = bookingStatusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === bookingStatusFilter)

  if (loading || !specialist) return <div className="p-20 text-center">Загрузка кабинета...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">Добрый день, {specialist.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground font-medium">Управление вашим профилем и расписанием.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="bg-white p-1 rounded-2xl border border-border flex gap-1 min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
              >
                Обзор
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
              >
                Расписание
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
              >
                Профиль
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'reviews' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
              >
                Отзывы
                {pendingReviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('clients')
                  setSelectedClient(null)
                  setClientViewMode('notes')
                }}
                className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'clients' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary'}`}
              >
                Клиенты
                {chats.some(c => c.unreadCount > 0) && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {chats.reduce((sum, c) => sum + c.unreadCount, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
          <a 
            href="https://my.linkeon.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-2xl font-bold text-sm hover:bg-muted transition-all"
          >
            <User className="h-4 w-4 text-primary" />
            Подключить профиль Linkeon
          </a>
          <Link to="/tools" className="flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-2xl font-bold text-sm hover:bg-muted transition-all">
            <Sparkles className="h-4 w-4 text-primary" />
            Агент Екатерина
          </Link>
        </div>
      </div>
      
      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Новые заявки', value: stats.newRequests, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Всего сессий', value: stats.totalSessions, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Ваш рейтинг', value: stats.rating, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { label: 'Доход (₽)', value: stats.earned.toLocaleString(), icon: Wallet, color: 'text-primary', bg: 'bg-primary/5' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
                <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-black text-foreground">Записи</h2>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'new', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setBookingStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        bookingStatusFilter === status
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {status === 'all' ? 'Все' : getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
              
              {filteredBookings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-border text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold text-muted-foreground">Нет записей</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {bookingStatusFilter === 'all' 
                      ? 'Записи появятся здесь, когда клиенты запишутся на сессию'
                      : `Нет записей со статусом "${getStatusLabel(bookingStatusFilter)}"`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const statusColors = getStatusColor(booking.status)
                    return (
                      <div key={booking.id} className="bg-white p-6 rounded-3xl border border-border hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center text-primary font-black text-xl flex-shrink-0">
                              {(booking.name || booking.clientName || '?')[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-foreground mb-1">{booking.name || booking.clientName || 'Клиент'}</h3>
                              <p className="text-xs font-bold text-muted-foreground mb-2">{booking.phone || 'Нет телефона'}</p>
                              {booking.message && (
                                <p className="text-[10px] text-muted-foreground italic">«{booking.message}»</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2 text-sm font-black text-foreground mb-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(booking.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {booking.time}
                            </div>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap pt-4 border-t border-border">
                          {booking.status !== 'confirmed' && (
                            <button
                              onClick={() => handleBookingStatusChange(booking.id, 'confirmed')}
                              className="px-4 py-2 bg-green-100 text-green-600 rounded-xl text-xs font-bold hover:bg-green-200 transition-all"
                            >
                              Подтвердить
                            </button>
                          )}
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleBookingStatusChange(booking.id, 'completed')}
                              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-200 transition-all"
                            >
                              Завершить
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm('Вы уверены, что хотите отменить эту запись?')) {
                                  handleBookingStatusChange(booking.id, 'cancelled')
                                }
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                            >
                              Отменить
                            </button>
                          )}
                          {booking.status === 'cancelled' && (
                            <button
                              onClick={() => handleBookingStatusChange(booking.id, 'new')}
                              className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl text-xs font-bold hover:bg-orange-200 transition-all"
                            >
                              Восстановить
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-black text-foreground">Linkeon Insight</h2>
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
                <Sparkles className="absolute top-[-10px] right-[-10px] h-24 w-24 text-white/10" />
                <h3 className="text-xl font-black mb-4 relative z-10">Анализ профиля</h3>
                <p className="text-sm text-primary-foreground/90 font-medium leading-relaxed relative z-10 mb-6">
                  Ваш энергетический настрой «Спокойная уверенность» на 95% совпадает с запросами клиентов по теме «Выгорание». 
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 relative z-10">
                  <p className="text-[10px] font-black uppercase mb-2">Совет от Linkeon:</p>
                  <p className="text-xs italic opacity-80">
                    «Попробуйте сделать упор на ваши ценности баланса в следующем посте — это привлечет еще больше лояльной аудитории».
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'profile' ? (
        <div className="bg-white rounded-[3rem] border border-border p-12 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-foreground mb-4">Ваш профиль</h2>
            <p className="text-muted-foreground font-medium">Здесь вы можете обновить свою фотографию и личные данные.</p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              <div className="h-48 w-48 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 shadow-xl">
                <img 
                  src={getImageUrl(specialist.image)} 
                  alt={specialist.name} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                />
              </div>
              <label className="absolute bottom-[-10px] right-[-10px] bg-primary text-white p-4 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all hover:bg-primary/90">
                <Upload className="h-5 w-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase text-primary">Загрузка...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-6 pt-6">
              {!editingProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Имя специалиста</label>
                      <div className="bg-muted p-4 rounded-2xl border border-border font-bold text-foreground">
                        {specialist.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Специализация</label>
                      <div className="bg-muted p-4 rounded-2xl border border-border font-bold text-foreground">
                        {specialist.specialty}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">О себе</label>
                    <div className="bg-muted p-6 rounded-3xl border border-border font-medium text-foreground leading-relaxed text-sm">
                      {specialist.description}
                    </div>
                  </div>

                  {(specialist.phone || specialist.email || specialist.socialLinks) && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-black text-foreground">Контакты</h3>
                      {specialist.phone && (
                        <div className="flex items-center gap-3 bg-muted p-4 rounded-2xl border border-border">
                          <span className="text-xs font-black uppercase text-muted-foreground w-20">Телефон:</span>
                          <span className="font-bold text-foreground">{specialist.phone}</span>
                        </div>
                      )}
                      {specialist.email && (
                        <div className="flex items-center gap-3 bg-muted p-4 rounded-2xl border border-border">
                          <span className="text-xs font-black uppercase text-muted-foreground w-20">Email:</span>
                          <span className="font-bold text-foreground">{specialist.email}</span>
                        </div>
                      )}
                      {specialist.socialLinks && (
                        <div className="space-y-2">
                          <span className="text-xs font-black uppercase text-muted-foreground ml-4 block">Социальные сети:</span>
                          <div className="bg-muted p-4 rounded-2xl border border-border space-y-2">
                            {specialist.socialLinks.instagram && (
                              <a href={specialist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="block text-primary font-bold hover:underline">
                                Instagram: {specialist.socialLinks.instagram}
                              </a>
                            )}
                            {specialist.socialLinks.telegram && (
                              <a href={specialist.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="block text-primary font-bold hover:underline">
                                Telegram: {specialist.socialLinks.telegram}
                              </a>
                            )}
                            {specialist.socialLinks.vk && (
                              <a href={specialist.socialLinks.vk} target="_blank" rel="noopener noreferrer" className="block text-primary font-bold hover:underline">
                                ВКонтакте: {specialist.socialLinks.vk}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 pt-4">
                    <a 
                      href="https://my.linkeon.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <User className="h-5 w-5" />
                      Подключить профиль Linkeon
                    </a>
                    <button 
                      onClick={() => setEditingProfile(true)}
                      className="flex-1 bg-white border-2 border-border text-foreground py-4 rounded-2xl font-black hover:bg-muted transition-all"
                    >
                      Редактировать контакты
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-foreground">Контактная информация</h3>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Мобильный телефон</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+7 (900) 000-00-00"
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-black text-foreground">Социальные сети</h3>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Instagram</label>
                      <input
                        type="url"
                        value={profileForm.instagram}
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/your_profile"
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Telegram</label>
                      <input
                        type="url"
                        value={profileForm.telegram}
                        onChange={(e) => setProfileForm({ ...profileForm, telegram: e.target.value })}
                        placeholder="https://t.me/your_profile"
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">ВКонтакте</label>
                      <input
                        type="url"
                        value={profileForm.vk}
                        onChange={(e) => setProfileForm({ ...profileForm, vk: e.target.value })}
                        placeholder="https://vk.com/your_profile"
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {savingProfile ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false)
                        // Reset form to current values
                        setProfileForm({
                          phone: specialist.phone || '',
                          email: specialist.email || '',
                          instagram: specialist.socialLinks?.instagram || '',
                          telegram: specialist.socialLinks?.telegram || '',
                          vk: specialist.socialLinks?.vk || ''
                        })
                      }}
                      className="px-6 bg-white border-2 border-border text-foreground py-4 rounded-2xl font-black hover:bg-muted transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="bg-white rounded-[3rem] border border-border p-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2">Управление отзывами</h2>
            <p className="text-muted-foreground font-medium">
              Здесь вы можете просмотреть и одобрить отзывы от клиентов
            </p>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
              <p className="text-xl font-bold text-muted-foreground">Нет отзывов на модерации</p>
              <p className="text-sm text-muted-foreground mt-2">Все отзывы обработаны</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingReviews.map((review: any) => (
                <div key={review.id} className="bg-white border-2 border-border rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-lg">
                        {review.author[0] || 'А'}
                      </div>
                      <div>
                        <h3 className="font-black text-foreground text-lg">{review.author || 'Анонимный клиент'}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-base text-foreground leading-relaxed mb-6 italic">
                    «{review.text}»
                  </p>
        <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveReview(review.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Check className="h-5 w-5" />
                      Одобрить и опубликовать
                    </button>
                    <button
                      onClick={() => handleRejectReview(review.id)}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-border text-foreground px-6 py-4 rounded-2xl font-black hover:bg-muted transition-all"
                    >
                      <XCircle className="h-5 w-5" />
                      Отклонить
                    </button>
          </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'clients' ? (
        !selectedClient && !showAddClientForm && !showEditClientForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Clients List - Grid View */}
            {clients.length === 0 ? (
              <div className="col-span-full bg-white rounded-[2rem] border border-border p-12 shadow-sm text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <p className="text-lg font-bold text-muted-foreground mb-2">Пока нет клиентов</p>
                <button
                  onClick={() => {
                    setShowAddClientForm(true)
                    setClientForm({ name: '', phone: '', email: '', notes: '' })
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-4"
                >
                  Добавить клиента
                </button>
              </div>
            ) : (
              clients.filter(client => client && client.name).map((client, idx) => {
                const clientChat = chats.find(c => c.clientName === client.name)
                const hasUnreadMessages = clientChat && clientChat.unreadCount > 0
                
                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl border-2 transition-all relative cursor-pointer hover:shadow-lg ${
                      hasUnreadMessages
                        ? 'border-orange-400 bg-orange-50/50'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    {hasUnreadMessages && (
                      <div className="absolute top-3 right-3 h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${
                          hasUnreadMessages 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {client.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-foreground flex items-center gap-2 mb-1">
                            {client.name || 'Без имени'}
                            {hasUnreadMessages && clientChat && (
                              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {clientChat.unreadCount}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground">{client.phone || 'Нет телефона'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>{client.totalSessions || 0} сессий</span>
                        {client.notesCount > 0 && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                            {client.notesCount} заметок
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGoToMessages(client, e)
                        }}
                        className="w-full bg-primary text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Перейти к сообщениям
                      </button>
                    </div>
                  </div>
                )
              })
            )}
            <div
              className="bg-white rounded-2xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[200px]"
              onClick={() => {
                setShowAddClientForm(true)
                setClientForm({ name: '', phone: '', email: '', notes: '' })
              }}
            >
              <PlusCircle className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-bold text-muted-foreground">Добавить клиента</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-border shadow-sm">
            {/* Back Button */}
            {(selectedClient || showAddClientForm || showEditClientForm) && (
              <div className="p-6 border-b border-border">
                <button
                  onClick={() => {
                    setSelectedClient(null)
                    setShowAddClientForm(false)
                    setShowEditClientForm(false)
                    setClientViewMode('notes')
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Назад к списку клиентов
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Clients List */}
              <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-[2rem] border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-foreground">Мои клиенты</h2>
                <button
                  onClick={() => {
                    setShowAddClientForm(true)
                    setSelectedClient(null)
                    setShowEditClientForm(false)
                    setClientForm({ name: '', phone: '', email: '', notes: '' })
                  }}
                  className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all"
                  title="Добавить клиента"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-6">Пока нет клиентов</p>
                  <button
                    onClick={() => {
                      setShowAddClientForm(true)
                      setSelectedClient(null)
                      setClientForm({ name: '', phone: '', email: '', notes: '' })
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Добавить клиента
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.filter(client => client && client.name).map((client, idx) => {
                    const clientChat = chats.find(c => c.clientName === client.name)
                    const hasUnreadMessages = clientChat && clientChat.unreadCount > 0
                    
                    return (
                      <div
                        key={idx}
                        className={`w-full p-4 rounded-2xl border-2 transition-all relative ${
                          selectedClient?.name === client.name
                            ? hasUnreadMessages
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-primary bg-primary/5 shadow-md'
                            : hasUnreadMessages
                              ? 'border-orange-400 bg-orange-50/50 hover:border-orange-500'
                              : 'border-border bg-white hover:border-primary/30'
                        }`}
                      >
                        {hasUnreadMessages && (
                          <div className="absolute top-2 right-2 h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                        <button
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${
                              hasUnreadMessages 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {client.name?.[0] || '?'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-black text-foreground flex items-center gap-2">
                                {client.name || 'Без имени'}
                                {hasUnreadMessages && clientChat && (
                                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {clientChat.unreadCount}
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-muted-foreground">{client.phone || 'Нет телефона'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>{client.totalSessions || 0} сессий</span>
                            {client.notesCount > 0 && (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                                {client.notesCount} заметок
                              </span>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleGoToMessages(client, e)}
                          className="w-full bg-primary text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Перейти к сообщениям
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => {
                  setShowAddClientForm(true)
                  setSelectedClient(null)
                  setShowEditClientForm(false)
                  setClientForm({ name: '', phone: '', email: '', notes: '' })
                }}
                className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Добавить клиента
              </button>
        </div>
      </div>

          {/* Client Details & Notes */}
          <div className="lg:col-span-2">
            {showAddClientForm ? (
              <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-foreground">Добавить клиента</h2>
                  <button
                    onClick={() => {
                      setShowAddClientForm(false)
                      setClientForm({ name: '', phone: '', email: '', notes: '' })
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleAddClient} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Имя *</label>
          <input 
            type="text" 
                      required
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="Имя клиента"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="+7 (900) 000-00-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Заметки</label>
                    <textarea
                      value={clientForm.notes}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all h-32 resize-none"
                      placeholder="Дополнительная информация о клиенте"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={savingClient}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {savingClient ? 'Сохранение...' : 'Добавить клиента'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddClientForm(false)
                        setClientForm({ name: '', phone: '', email: '', notes: '' })
                      }}
                      className="px-6 bg-white border-2 border-border text-foreground py-4 rounded-2xl font-black hover:bg-muted transition-all"
                    >
                      Отмена
          </button>
        </div>
                </form>
      </div>
            ) : showEditClientForm && selectedClient ? (
              <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-foreground">Редактировать клиента</h2>
                  <button
                    onClick={() => {
                      setShowEditClientForm(false)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
    </div>
                <form onSubmit={handleEditClient} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Имя *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="Имя клиента"
                    />
  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="+7 (900) 000-00-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-foreground mb-2">Заметки</label>
                    <textarea
                      value={clientForm.notes}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all h-32 resize-none"
                      placeholder="Дополнительная информация о клиенте"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={savingClient}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {savingClient ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditClientForm(false)
                      }}
                      className="px-6 bg-white border-2 border-border text-foreground py-4 rounded-2xl font-black hover:bg-muted transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedClient ? (
              <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-2xl">
                        {selectedClient.name?.[0] || '?'}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-foreground">{selectedClient.name || 'Без имени'}</h2>
                        <p className="text-muted-foreground font-medium">{selectedClient.phone || 'Нет телефона'}</p>
                        {selectedClient.email && (
                          <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleStartEditClient}
                      className="flex items-center gap-2 bg-white border-2 border-border text-foreground px-4 py-2 rounded-xl font-black hover:bg-muted transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      Редактировать
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted p-4 rounded-2xl">
                      <p className="text-xs font-black uppercase text-muted-foreground mb-1">Всего сессий</p>
                      <p className="text-2xl font-black text-foreground">{selectedClient.totalSessions}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-2xl">
                      <p className="text-xs font-black uppercase text-muted-foreground mb-1">Последняя сессия</p>
                      <p className="text-lg font-black text-foreground">
                        {selectedClient.lastSession 
                          ? new Date(selectedClient.lastSession).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                          : 'Нет сессий'}
                      </p>
                    </div>
                  </div>
                  {selectedClient.notes && (
                    <div className="bg-muted p-4 rounded-2xl mb-6">
                      <p className="text-xs font-black uppercase text-muted-foreground mb-2">Заметки</p>
                      <p className="text-sm text-foreground font-medium">{selectedClient.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-foreground">
                      {clientViewMode === 'notes' ? 'Заметки о клиенте' : 'Сообщения с клиентом'}
                    </h3>
                    <div className="bg-white p-1 rounded-xl border border-border flex">
                      <button
                        onClick={() => setClientViewMode('notes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          clientViewMode === 'notes'
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        Заметки
                      </button>
                      <button
                        onClick={() => setClientViewMode('chat')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                          clientViewMode === 'chat'
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        Сообщения
                        {chats.find(c => c.clientName === selectedClient.name)?.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-secondary rounded-full flex items-center justify-center text-[8px] font-black text-white">
                            {chats.find(c => c.clientName === selectedClient.name)?.unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {clientViewMode === 'notes' ? (
                    <>
                      <form onSubmit={handleAddNote} className="mb-6">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Добавить заметку о клиенте..."
                      className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all h-24 resize-none mb-3"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-3 rounded-xl font-black hover:bg-primary/90 transition-all"
                    >
                      Добавить заметку
                    </button>
                  </form>

                  {loadingNotes ? (
                    <div className="text-center py-12">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Загрузка заметок...</p>
                    </div>
                  ) : clientNotes.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-2xl">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">Нет заметок о клиенте</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientNotes.map((note: any) => (
                        <div key={note.id} className="bg-muted p-6 rounded-2xl border border-border">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <p className="text-sm text-foreground font-medium leading-relaxed flex-1">
                              {note.text}
                            </p>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                    </>
                  ) : (
                    <div className="bg-white rounded-[2rem] border border-border shadow-sm flex flex-col h-[500px]">
                      <div 
                        ref={chatContainerRef}
                        className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth"
                      >
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-sm text-muted-foreground">Нет сообщений</p>
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'specialist' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${
                                msg.sender === 'specialist'
                                  ? 'bg-primary text-white rounded-tr-none'
                                  : 'bg-muted text-foreground rounded-tl-none border border-border'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))
                        )}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-muted px-4 py-2 rounded-full animate-pulse text-[10px] font-black uppercase text-muted-foreground">
                              Печатает...
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 border-t border-border">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Напишите сообщение..."
                            className="flex-1 bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || isTyping}
                            className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-border p-12 shadow-sm text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-black text-foreground mb-2">Выберите клиента</h3>
                <p className="text-sm text-muted-foreground">Выберите клиента из списка, чтобы просмотреть детали и заметки</p>
              </div>
            )}
          </div>
    </div>
  </div>
)
      ) : (
        <div className="bg-white rounded-[3rem] border border-border overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-6 md:p-10 border-r border-border bg-muted/30">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-xl hover:bg-white transition-all"
                  title="Предыдущий месяц"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h2 className="text-xl md:text-2xl font-black text-foreground text-center">
                  {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-xl hover:bg-white transition-all"
                  title="Следующий месяц"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground rotate-180" />
                </button>
              </div>
              
              <button
                onClick={goToToday}
                className="w-full mb-4 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
              >
                Сегодня
              </button>

              <button
                onClick={syncWithGoogleCalendar}
                className="w-full mb-4 px-4 py-2 bg-white border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Синхронизировать с Google Calendar
              </button>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} className="text-center text-xs font-black text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }
                  
                  const iso = day.toISOString().split('T')[0]
                  const isSelected = editingDate === iso
                  const isToday = iso === new Date().toISOString().split('T')[0]
                  const slotsCount = (specialist.slots[iso] || []).length
                  const dayBookings = getBookingsForDate(iso)
                  const bookingsCount = dayBookings.length
                  const isPast = day < new Date() && !isToday
                  
                  return (
                    <button
                      key={iso}
                      onClick={() => !isPast && setEditingDate(iso)}
                      disabled={isPast}
                      className={`aspect-square p-1 rounded-xl border-2 text-xs font-bold transition-all relative ${
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-md'
                          : isPast
                          ? 'border-transparent bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                          : isToday
                          ? 'border-primary/30 bg-primary/5 text-foreground hover:border-primary/50'
                          : 'border-transparent bg-white text-foreground hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{day.getDate()}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {slotsCount > 0 && (
                            <span className={`text-[8px] ${
                              isSelected ? 'text-white/80' : 'text-primary font-black'
                            }`}>
                              {slotsCount} сл.
                            </span>
                          )}
                          {bookingsCount > 0 && (
                            <span className={`text-[8px] ${
                              isSelected ? 'text-white/80' : 'text-green-600 font-black'
                            }`}>
                              {bookingsCount} встреч
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2 p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-foreground">Свободные слоты на {new Date(editingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</h2>
                <div className="flex items-center gap-3">
                  {savingSlots && <span className="text-[10px] font-black uppercase text-primary animate-pulse">Сохранение...</span>}
                  <button
                    onClick={() => {
                      setShowCreateBookingForm(true)
                      setBookingForm({
                        clientName: '',
                        date: editingDate,
                        time: '10:00',
                        status: 'confirmed'
                      })
                      setShowNewClientInBooking(false)
                      setNewClientInBooking({ name: '', phone: '', email: '' })
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Создать встречу
                  </button>
                </div>
              </div>

              {showCreateBookingForm && (
                <div className="mb-8 bg-white border-2 border-border p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-foreground">Создать встречу</h3>
                    <button
                      onClick={() => {
                        setShowCreateBookingForm(false)
                        setBookingForm({
                          clientName: '',
                          date: new Date().toISOString().split('T')[0],
                          time: '10:00',
                          status: 'confirmed'
                        })
                        setShowNewClientInBooking(false)
                        setNewClientInBooking({ name: '', phone: '', email: '' })
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateBooking} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-black text-foreground">Клиент *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewClientInBooking(!showNewClientInBooking)
                            if (showNewClientInBooking) {
                              setNewClientInBooking({ name: '', phone: '', email: '' })
                            }
                          }}
                          className="text-xs text-primary hover:underline font-bold"
                        >
                          {showNewClientInBooking ? 'Выбрать существующего' : 'Создать нового'}
                        </button>
                      </div>
                      {showNewClientInBooking ? (
                        <div className="space-y-3 p-4 bg-muted rounded-xl border-2 border-primary/20">
                          <input
                            type="text"
                            required
                            value={newClientInBooking.name}
                            onChange={(e) => setNewClientInBooking({ ...newClientInBooking, name: e.target.value })}
                            className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                            placeholder="Имя клиента *"
                          />
                          <input
                            type="tel"
                            required
                            value={newClientInBooking.phone}
                            onChange={(e) => setNewClientInBooking({ ...newClientInBooking, phone: e.target.value })}
                            className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                            placeholder="Телефон *"
                          />
                          <input
                            type="email"
                            value={newClientInBooking.email}
                            onChange={(e) => setNewClientInBooking({ ...newClientInBooking, email: e.target.value })}
                            className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                            placeholder="Email (необязательно)"
                          />
                          <button
                            type="button"
                            onClick={handleCreateClientInBooking}
                            disabled={creatingClientInBooking}
                            className="w-full bg-primary text-white py-2 px-4 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            {creatingClientInBooking ? 'Создание...' : 'Создать клиента'}
                          </button>
                        </div>
                      ) : (
                        <select
                          required
                          value={bookingForm.clientName}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              clientName: e.target.value
                            })
                          }}
                          className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        >
                          <option value="">Выберите клиента</option>
                          {clients.filter(client => client.name).map(client => (
                            <option key={client.name} value={client.name}>
                              {client.name} {client.phone && `(${client.phone})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-foreground mb-2">Дата *</label>
                        <input
                          type="date"
                          required
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-foreground mb-2">Время *</label>
                        <select
                          required
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-foreground mb-2">Статус</label>
                      <select
                        value={bookingForm.status}
                        onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                        className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      >
                        <option value="confirmed">Подтверждена</option>
                        <option value="pending">Ожидает подтверждения</option>
                        <option value="completed">Завершена</option>
                        <option value="cancelled">Отменена</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={creatingBooking}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-black hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {creatingBooking ? 'Создание...' : 'Создать встречу'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateBookingForm(false)
                          setBookingForm({
                            clientName: '',
                            date: new Date().toISOString().split('T')[0],
                            time: '10:00',
                            status: 'confirmed'
                          })
                          setShowNewClientInBooking(false)
                          setNewClientInBooking({ name: '', phone: '', email: '' })
                        }}
                        className="px-6 bg-white border-2 border-border text-foreground py-3 rounded-xl font-black hover:bg-muted transition-all"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(() => {
                const dayBookings = getBookingsForDate(editingDate)
                if (dayBookings.length > 0) {
                  return (
                    <div className="mb-8">
                      <h3 className="text-lg font-black text-foreground mb-4">Встречи на этот день</h3>
                      <div className="space-y-3">
                        {dayBookings.map((booking: any) => {
                          const statusLabel = getStatusLabel(booking.status)
                          const statusColor = getStatusColor(booking.status)
                          return (
                            <div key={booking.id} className="bg-white border-2 border-border p-4 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-black text-foreground mb-1">{booking.clientName || 'Клиент'}</h4>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {booking.time}
                                    </div>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {timeSlots.map(time => {
                  const isSelected = (specialist.slots[editingDate] || []).includes(time)
                  return (
                    <button
                      key={time}
                      onClick={() => toggleSlot(time)}
                      disabled={savingSlots}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'border-border bg-white text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>

              <div className="mt-12 p-6 bg-muted rounded-3xl border border-border">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-sm mb-1">Как это работает?</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Выберите время, в которое вы готовы проводить сессии. Клиенты увидят эти окна на вашей витрине и смогут записаться в один клик. Все изменения сохраняются автоматически.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const App = () => {
  // Auth routes are available at /register/client and /register/specialist
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/specialists" element={<SpecialistsList />} />
              <Route path="/specialist/:id" element={<SpecialistProfile />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="/tools" element={<AITools />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register/client" element={<RegisterClient />} />
              <Route path="/register/specialist" element={<RegisterSpecialist />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardSelector />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/client" element={
                <ProtectedRoute requiredRole="CLIENT">
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/specialist" element={
                <ProtectedRoute requiredRole="SPECIALIST">
                  <SpecialistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/specialist/analytics/:specialistId" element={
                <ProtectedRoute requiredRole="SPECIALIST">
                  <SpecialistAnalyticsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/book/:id" element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />

              {/* Test/Dev routes */}
              <Route path="/test-chat" element={<ChatTestPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster position="top-right" />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

