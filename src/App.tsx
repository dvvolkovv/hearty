import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, User, Menu, X, Heart, Sparkles, Calendar, Send, Star, Shield, Zap, Target, FileText, Upload, Briefcase, Rocket, Compass, BatteryCharging, CloudLightning, Users, Smile, Anchor, Wallet, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'

// Constants
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://backendhearty-test.up.railway.app/api'
  if (url.startsWith('http')) return url
  return `https://${url}`
}
const API_URL = getApiUrl()
const BASE_URL = API_URL.replace('/api', '')
console.log('Final API URL:', API_URL)

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) return imagePath
  return `${BASE_URL}${imagePath}`
}

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FFFDFB] font-sans text-[#2D241E]">
      <nav className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-[#F5E6DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Heart className="h-6 w-6 text-primary fill-primary/20" />
            </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Hearty</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/specialists" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Витрина</Link>
              <Link to="/onboarding" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Стать специалистом</Link>
              <Link 
                to="/dashboard"
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Личный кабинет
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <Link to="/specialists" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Витрина</Link>
            <Link to="/onboarding" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Для специалистов</Link>
            <Link 
              to="/dashboard" 
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Личный кабинет
            </Link>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="border-t bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-bold">Hearty</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 Hearty Platform. Часть экосистемы Linkeon.</p>
        </div>
      </footer>
    </div>
  )
}

// Pages
const Landing = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/specialists')
  }

  return (
  <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
          <Sparkles className="h-4 w-4" />
          Новый стандарт подбора психолога
        </div>
        <h1 className="text-6xl font-black tracking-tight mb-8 leading-[1.1]">
          Найдите своего идеального <br />
          психолога или коуча
      </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Поиск специалистов на основе глубокого профилирования Linkeon. 
          Ваше ментальное здоровье — наш приоритет.
        </p>
        
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-3 bg-white rounded-3xl shadow-2xl border-[#F5E6DA] border">
            <div className="flex-1 flex items-center px-4 gap-3 bg-[#FAF3ED] rounded-2xl">
              <Search className="text-[#8B7361] h-5 w-5" />
          <input 
            type="text" 
                placeholder="Что вас беспокоит? (напр. стресс, выгорание)" 
                className="w-full py-4 bg-transparent outline-none text-sm font-medium text-[#4A3B2F]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
          />
        </div>
            <button type="submit" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30">
          Найти
        </button>
          </form>
          
          <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#F5E6DA] w-fit mx-auto animate-in fade-in slide-in-from-top duration-700">
            <span className="text-sm font-medium text-[#8B7361]">Или</span>
            <Link 
              to="/diagnostic" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-all font-bold text-sm group"
            >
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              пройдите предварительную сессию с ИИ ассистентом
              <span className="text-xs font-medium opacity-60">(чтобы точнее сформулировать запрос)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32">
        <div className="bg-[#FAF3ED] p-8 rounded-[2rem] border border-[#F5E6DA] hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Target className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-[#2D241E]">Точный мэтчинг</h3>
          <p className="text-sm text-[#8B7361] font-medium leading-relaxed">
            Технология Linkeon анализирует ваши ценности, а не только симптомы.
          </p>
        </div>
        
        <div className="bg-[#FAF3ED] p-8 rounded-[2rem] border border-[#F5E6DA] hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Shield className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-[#2D241E]">Анонимность</h3>
          <p className="text-sm text-[#8B7361] font-medium leading-relaxed">
            Ищите и выбирайте специалиста без обязательной регистрации.
          </p>
        </div>

        <div className="bg-[#FAF3ED] p-8 rounded-[2rem] border border-[#F5E6DA] hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Zap className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-black mb-3 text-[#2D241E]">AI-проверка</h3>
          <p className="text-sm text-[#8B7361] font-medium leading-relaxed">
            Каждый психолог прошел глубокое интервью с агентом Linkeon.
          </p>
        </div>

        <div className="bg-[#FAF3ED] p-8 rounded-[2rem] border border-[#F5E6DA] hover:shadow-xl transition-all">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Heart className="text-primary h-6 w-6 fill-primary/10" />
          </div>
          <h3 className="text-lg font-black mb-3 text-[#2D241E]">Бережный подход</h3>
          <p className="text-sm text-[#8B7361] font-medium leading-relaxed">
            Минимум барьеров и стресса при поиске своего специалиста.
          </p>
        </div>
      </div>

      {/* Popular Requests Section */}
      <div className="mb-32">
        <h2 className="text-3xl font-black text-[#2D241E] mb-6 text-center">С чем мы помогаем</h2>
        <p className="text-center text-[#8B7361] mb-12 font-medium">Выберите направление, которое вам сейчас ближе</p>
        
        <div className="space-y-16">
          {/* Coaching Row */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-4">
              <span className="bg-primary/10 px-4 py-1 rounded-full">Коучинг</span>
              <div className="h-px flex-1 bg-primary/10"></div>
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/specialists?filter=Бизнес" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Briefcase className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Бизнес и Карьера</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Рост в доходе</li>
                <li className="flex items-center gap-2">• Синдром самозванца</li>
                <li className="flex items-center gap-2">• Лидерство</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Эффективность" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Rocket className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Эффективность</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Тайм-менеджмент</li>
                <li className="flex items-center gap-2">• Work-life balance</li>
                <li className="flex items-center gap-2">• Цели</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Личность" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Compass className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Личность</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Предназначение</li>
                <li className="flex items-center gap-2">• Самооценка</li>
                <li className="flex items-center gap-2">• Выбор пути</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Выгорание" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <BatteryCharging className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Ресурс</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Энергия</li>
                <li className="flex items-center gap-2">• Выгорание</li>
                <li className="flex items-center gap-2">• Привычки</li>
              </ul>
            </Link>
          </div>
        </div>

        {/* Psychology Row */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#8B7361] mb-8 flex items-center gap-4">
            <span className="bg-[#FAF3ED] px-4 py-1 rounded-full">Психология</span>
            <div className="h-px flex-1 bg-[#F5E6DA]"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/specialists?filter=Тревога" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <CloudLightning className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Состояния</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Тревога и страхи</li>
                <li className="flex items-center gap-2">• Депрессия</li>
                <li className="flex items-center gap-2">• Апатия</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Отношения" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Users className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Отношения</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Конфликты в паре</li>
                <li className="flex items-center gap-2">• Расставание</li>
                <li className="flex items-center gap-2">• Границы</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=Самооценка" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Smile className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">Самоценность</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
                <li className="flex items-center gap-2">• Неуверенность</li>
                <li className="flex items-center gap-2">• Самопринятие</li>
                <li className="flex items-center gap-2">• Поиск себя</li>
              </ul>
            </Link>

            <Link to="/specialists?filter=События" className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6DA] hover:border-primary/30 transition-all group">
              <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <Anchor className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#2D241E]">События</h3>
              <ul className="space-y-3 text-sm font-medium text-[#8B7361]">
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
  const [specialists, setSpecialists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter')

  useEffect(() => {
    fetch(`${API_URL}/specialists`)
      .then(res => res.json())
      .then(data => {
        if (filter) {
          const filtered = data.filter((sp: any) => {
            const searchStr = filter.toLowerCase()
            return (
              sp.specialty.toLowerCase().includes(searchStr) || 
              sp.tags.some((tag: string) => tag.toLowerCase().includes(searchStr)) ||
              sp.description.toLowerCase().includes(searchStr) ||
              sp.format.toLowerCase().includes(searchStr)
            )
          })
          setSpecialists(filtered)
        } else {
          setSpecialists(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [filter])

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-black text-[#2D241E]">
            {filter ? `Специалисты: ${filter}` : 'Наши специалисты'}
          </h2>
          <p className="text-[#8B7361] font-medium mt-2">Подобраны на основе ваших ценностей и запросов.</p>
    </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {["Все", "Онлайн", "Лично", "Бизнес", "Эффективность", "Личность", "Выгорание", "Тревога", "Отношения", "Самооценка"].map(tag => (
            <Link
              key={tag}
              to={tag === "Все" ? "/specialists" : `/specialists?filter=${tag}`}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all border-2 ${
                (tag === "Все" && !filter) || filter === tag
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white border-[#F5E6DA] text-[#8B7361] hover:border-primary/30'
              }`}
            >
          {tag}
            </Link>
          ))}
        </div>
      </div>

      {specialists.length === 0 && !loading ? (
        <div className="text-center py-20">
          <p className="text-xl font-bold text-[#8B7361]">К сожалению, по вашему запросу ничего не найдено.</p>
          <Link to="/specialists" className="text-primary font-bold hover:underline mt-4 inline-block">
            Посмотреть всех специалистов
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-[#FAF3ED] animate-pulse rounded-[2.5rem]" />)
          ) : (
            specialists.map(sp => (
              <div key={sp.id} className="bg-white border-white border-2 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group relative flex flex-col shadow-xl shadow-black/5">
                <Link to={`/specialist/${sp.id}`} className="flex-1">
                  <div className="absolute top-0 right-0 p-6">
                    <div className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      Доступен
                    </div>
                  </div>
                  <div className="h-20 w-20 rounded-2xl overflow-hidden mb-8 group-hover:scale-110 transition-transform">
                    {sp.image ? (
                      <img src={getImageUrl(sp.image)} alt={sp.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{sp.name}</h3>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{sp.rating}</span>
                    <span className="text-xs text-muted-foreground font-medium">({sp.reviews} отзывов)</span>
                  </div>
                  <p className="text-sm text-primary font-bold mb-4">{sp.specialty}</p>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed line-clamp-3">
                    {sp.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {sp.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[11px] font-bold bg-muted px-2 py-1 rounded-md text-muted-foreground uppercase">{tag}</span>
                    ))}
                  </div>
                </Link>

                <div className="border-t pt-8 mt-auto">
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] font-black text-[#8B7361] uppercase mb-1">Стоимость</span>
                        <span className="text-2xl font-black text-[#2D241E]">{sp.price} ₽</span>
                      </div>
                      <Link 
                        to={`/specialist/${sp.id}`}
                        className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
                      >
                        Подробнее
                      </Link>
                    </div>
                    <Link 
                      to={`/book/${sp.id}`}
                      className="w-full bg-black text-white py-4 rounded-2xl text-center text-sm font-black hover:bg-primary transition-all shadow-lg shadow-black/10"
                    >
                      Записаться на сессию
                    </Link>
                  </div>
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
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Здравствуйте! Я Linkeon. Моя задача — заглянуть за рамки ваших дипломов. Расскажите, в чем заключается ваша истинная философия работы? Какие ценности и какой энергетический настрой вы приносите в каждую сессию?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(`${API_URL}/ai/linkeon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'ai', content: data.reply }])
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
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[#F5E6DA] rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center">
                    <Upload className="h-5 w-5 text-[#8B7361] group-hover:text-primary mb-2" />
                    <span className="text-[10px] font-bold text-[#8B7361] group-hover:text-primary uppercase">Загрузить PDF</span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </label>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2">Профессиональное эссе</label>
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[#F5E6DA] rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center">
                    <FileText className="h-5 w-5 text-[#8B7361] group-hover:text-primary mb-2" />
                    <span className="text-[10px] font-bold text-[#8B7361] group-hover:text-primary uppercase">Загрузить эссе</span>
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

          <div className="flex-1 p-8 overflow-y-auto space-y-6">
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
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generateContent = async () => {
    if (!topic) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/ai/ekaterina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })
      const data = await res.json()
      setResult(data.post)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-black mb-4">Агент Екатерина</h1>
        <p className="text-muted-foreground font-medium">Ваш персональный ассистент по генерации контента</p>
      </div>

      <div className="bg-white border-2 border-primary/5 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="mb-8">
          <label className="block text-sm font-black uppercase text-muted-foreground mb-3">О чем хотите написать?</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Напр: Как справиться с тревогой перед выступлением" 
              className="flex-1 bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none transition-all"
            />
            <button 
              onClick={generateContent}
              disabled={loading}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Создаю...' : 'Создать'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-muted/30 p-8 rounded-[2rem] border-2 border-dashed border-primary/10 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">Черновик поста</span>
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                Копировать
              </button>
            </div>
            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap italic text-foreground/80">
              {result}
            </p>
          </div>
        )}
    </div>
  </div>
)
}

const SpecialistProfile = () => {
  const { id } = useParams()
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/specialists`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((s: any) => s.id === parseInt(id || '0'))
        setSpecialist(found)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-20 text-center">Загрузка профиля...</div>
  if (!specialist) return <div className="p-20 text-center">Специалист не найден</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <Link 
        to="/specialists" 
        className="inline-flex items-center gap-2 text-[#8B7361] font-bold hover:text-primary transition-all mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Назад в витрину
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Photo & Base Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] border border-[#F5E6DA] p-8 shadow-xl shadow-black/5 sticky top-24">
            <div className="h-64 w-full rounded-[2.5rem] overflow-hidden mb-8 border-4 border-primary/10">
              <img 
                src={getImageUrl(specialist.image)} 
                alt={specialist.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-black text-[#2D241E] mb-2">{specialist.name}</h1>
            <p className="text-primary font-bold mb-6">{specialist.specialty}</p>
            
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-black">{specialist.rating}</span>
              <span className="text-sm text-[#8B7361] font-medium">({specialist.reviews} отзывов)</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-[#F5E6DA]">
                <span className="text-[10px] font-black uppercase text-[#8B7361]">Стоимость</span>
                <span className="font-black text-xl">{specialist.price} ₽</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#F5E6DA]">
                <span className="text-[10px] font-black uppercase text-[#8B7361]">Формат</span>
                <span className="font-bold text-sm">{specialist.format}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#F5E6DA]">
                <span className="text-[10px] font-black uppercase text-[#8B7361]">Город</span>
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
            <h2 className="text-2xl font-black text-[#2D241E] mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              О специалисте
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-[#F5E6DA] p-10 shadow-sm leading-relaxed text-[#2D241E]/80 font-medium">
              <p className="mb-6">{specialist.fullDescription || specialist.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-8">
                {specialist.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] font-black bg-[#FAF3ED] px-4 py-2 rounded-xl text-[#8B7361] uppercase border border-[#F5E6DA]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {specialist.education && (
            <section>
              <h2 className="text-2xl font-black text-[#2D241E] mb-6 flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                Образование
              </h2>
              <div className="bg-white rounded-[2.5rem] border border-[#F5E6DA] p-10 shadow-sm space-y-4">
                {specialist.education.map((edu: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <p className="font-bold text-[#2D241E]/70">{edu}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#2D241E] flex items-center gap-3">
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
                <div key={review.id} className="bg-white rounded-[2.5rem] border border-[#F5E6DA] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary">
                        {review.author[0]}
                      </div>
                      <span className="font-black text-[#2D241E]">{review.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#8B7361] leading-relaxed italic">
                    «{review.text}»
                  </p>
                </div>
              ))}
            </div>
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
  const [booked, setBooked] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })

  useEffect(() => {
    fetch(`${API_URL}/specialists`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((s: any) => s.id === parseInt(id || '0'))
        setSpecialist(found)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return
    setLoading(true)
    try {
      await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, specialistId: id, date: selectedDate, time: selectedTime })
      })
      setBooked(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !specialist) return <div className="p-20 text-center">Загрузка...</div>
  if (!specialist && !loading) return <div className="p-20 text-center">Специалист не найден</div>

  const availableDates = Object.keys(specialist.slots || {})

  if (booked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-green-100">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black mb-4">Вы записаны!</h2>
          <p className="text-muted-foreground font-medium mb-2">
            Дата: <span className="text-foreground font-bold">{selectedDate}</span>, время: <span className="text-foreground font-bold">{selectedTime}</span>
          </p>
          <p className="text-muted-foreground font-medium mb-10">
            {specialist.name} свяжется с вами для подтверждения.
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
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Date Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-4">1. Выберите доступную дату</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableDates.map(date => (
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
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="animate-in fade-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black uppercase text-muted-foreground mb-4">2. Выберите время (московское)</label>
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

              {/* Personal Info */}
              {selectedTime && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black uppercase text-muted-foreground">3. Контактные данные</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      placeholder="Ваше имя"
                    />
                    <input 
                      required
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
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Отправка...' : 'Подтвердить запись'}
                  </button>
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

  const handleSend = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(`${API_URL}/ai/diagnostic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'ai', content: data.reply }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black mb-4">Предварительная диагностика</h1>
        <p className="text-[#8B7361] font-medium max-w-lg mx-auto">
          Этот разговор поможет нам понять суть вашего запроса и подобрать специалиста, который лучше всего подходит именно вам.
        </p>
      </div>

      <div className="bg-white border-2 border-[#F5E6DA] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-[1.5rem] font-medium text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                  : 'bg-[#FAF3ED] text-[#2D241E] rounded-tl-none border border-[#F5E6DA]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#FAF3ED] p-4 rounded-2xl animate-pulse text-[10px] font-black uppercase text-[#8B7361]">
                Ассистент думает...
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-[#F5E6DA]">
          <div className="flex gap-3">
          <input 
            type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Опишите свои чувства или ситуацию..." 
              className="flex-1 bg-[#FAF3ED] border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none transition-all"
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

const SpecialistDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'profile'>('overview')
  const [editingDate, setEditingDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [savingSlots, setSavingSlots] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, specialistsRes] = await Promise.all([
        fetch(`${API_URL}/specialists/1/stats`),
        fetch(`${API_URL}/specialists/1/bookings`),
        fetch(`${API_URL}/specialists`)
      ])
      const statsData = await statsRes.json()
      const bookingsData = await bookingsRes.json()
      const specialistsData = await specialistsRes.json()
      
      setStats(statsData)
      setBookings(bookingsData)
      setSpecialist(specialistsData.find((s: any) => s.id === 1))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleSlot = async (time: string) => {
    if (!specialist) return
    const currentSlots = specialist.slots[editingDate] || []
    const newSlots = currentSlots.includes(time)
      ? currentSlots.filter((t: string) => t !== time)
      : [...currentSlots, time].sort()

    setSavingSlots(true)
    try {
      const res = await fetch(`${API_URL}/specialists/1/slots`, {
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !specialist) return

    const formData = new FormData()
    formData.append('photo', file)

    setUploadingPhoto(true)
    try {
      const res = await fetch(`${API_URL}/specialists/1/upload-photo`, {
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

  if (loading || !specialist) return <div className="p-20 text-center">Загрузка кабинета...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#2D241E] mb-2">Добрый день, {specialist.name.split(' ')[0]}!</h1>
          <p className="text-[#8B7361] font-medium">Управление вашим профилем и расписанием.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-1 rounded-2xl border border-[#F5E6DA] flex">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#8B7361] hover:text-primary'}`}
            >
              Обзор
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#8B7361] hover:text-primary'}`}
            >
              Расписание
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#8B7361] hover:text-primary'}`}
            >
              Профиль
            </button>
          </div>
          <Link to="/tools" className="flex items-center gap-2 bg-white border border-[#F5E6DA] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#FAF3ED] transition-all">
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
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#F5E6DA] shadow-sm">
                <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-[#8B7361] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-[#2D241E]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-black text-[#2D241E]">Ближайшие записи</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white p-6 rounded-3xl border border-[#F5E6DA] hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-[#FAF3ED] rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                        {booking.name[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-[#2D241E]">{booking.name}</h3>
                        <p className="text-xs font-bold text-[#8B7361]">{booking.phone}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 italic">«{booking.message}»</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm font-black text-[#2D241E] mb-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(booking.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {booking.time}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        booking.status === 'new' ? 'bg-orange-100 text-orange-600' : 
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {booking.status === 'new' ? 'Новая' : booking.status === 'confirmed' ? 'Подтверждена' : 'Завершена'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-black text-[#2D241E]">Linkeon Insight</h2>
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
        <div className="bg-white rounded-[3rem] border border-[#F5E6DA] p-12 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#2D241E] mb-4">Ваш профиль</h2>
            <p className="text-[#8B7361] font-medium">Здесь вы можете обновить свою фотографию и личные данные.</p>
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#8B7361] ml-4">Имя специалиста</label>
                  <div className="bg-[#FAF3ED] p-4 rounded-2xl border border-[#F5E6DA] font-bold text-[#2D241E]">
                    {specialist.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#8B7361] ml-4">Специализация</label>
                  <div className="bg-[#FAF3ED] p-4 rounded-2xl border border-[#F5E6DA] font-bold text-[#2D241E]">
                    {specialist.specialty}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#8B7361] ml-4">О себе</label>
                <div className="bg-[#FAF3ED] p-6 rounded-3xl border border-[#F5E6DA] font-medium text-[#2D241E] leading-relaxed text-sm">
                  {specialist.description}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  Редактировать данные
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-[#F5E6DA] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-10 border-r border-[#F5E6DA] bg-[#FAF3ED]/30">
              <h2 className="text-2xl font-black text-[#2D241E] mb-6 text-center">Выбор даты</h2>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                  const d = new Date()
                  d.setDate(d.getDate() + offset)
                  const iso = d.toISOString().split('T')[0]
                  return (
                    <button
                      key={iso}
                      onClick={() => setEditingDate(iso)}
                      className={`w-full p-4 rounded-2xl border-2 text-sm font-bold transition-all flex justify-between items-center ${
                        editingDate === iso 
                          ? 'border-primary bg-primary/5 text-primary shadow-md' 
                          : 'border-transparent bg-white hover:border-[#F5E6DA]'
                      }`}
                    >
                      <span>{d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                      <span className="text-[10px] opacity-60">
                        {(specialist.slots[iso] || []).length} окон
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2 p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#2D241E]">Свободные слоты на {new Date(editingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</h2>
                {savingSlots && <span className="text-[10px] font-black uppercase text-primary animate-pulse">Сохранение...</span>}
              </div>
              
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
                          : 'border-[#F5E6DA] bg-white text-[#8B7361] hover:border-primary/40'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>

              <div className="mt-12 p-6 bg-[#FAF3ED] rounded-3xl border border-[#F5E6DA]">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#2D241E] text-sm mb-1">Как это работает?</h4>
                    <p className="text-xs text-[#8B7361] font-medium leading-relaxed">
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
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/specialists" element={<SpecialistsList />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/tools" element={<AITools />} />
          <Route path="/book/:id" element={<Booking />} />
          <Route path="/specialist/:id" element={<SpecialistProfile />} />
          <Route path="/dashboard" element={<SpecialistDashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

