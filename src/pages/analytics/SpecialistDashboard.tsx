import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, subDays, startOfMonth } from 'date-fns';
import { TrendingUp, Users, Star, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

// API imports
import {
  getSpecialistDashboard,
  getSpecialistEarnings,
  getSpecialistBookingsTimeline,
  getSpecialistRatingsBreakdown,
  getSpecialistPopularTimes,
  type DateRangeFilter,
  type SpecialistDashboardData,
  type EarningsData,
  type BookingsTimelineData,
  type RatingsBreakdownData,
  type PopularTimesData
} from '../../api/analytics';

// Component imports
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { EarningsChart } from '../../components/analytics/EarningsChart';
import { BookingsTimeline } from '../../components/analytics/BookingsTimeline';
import { RatingsBreakdown } from '../../components/analytics/RatingsBreakdown';
import { PopularTimes } from '../../components/analytics/PopularTimes';

/**
 * SpecialistDashboard - Main analytics dashboard for specialists
 * Shows earnings, bookings, ratings, and time analytics
 */
export const SpecialistDashboard = () => {
  const { specialistId } = useParams<{ specialistId: string }>();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Date range state (default: last 30 days)
  const [dateRange, setDateRange] = useState<DateRangeFilter>(() => ({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  }));

  // Data state
  const [dashboardData, setDashboardData] = useState<SpecialistDashboardData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [bookingsData, setBookingsData] = useState<BookingsTimelineData | null>(null);
  const [ratingsData, setRatingsData] = useState<RatingsBreakdownData | null>(null);
  const [popularTimesData, setPopularTimesData] = useState<PopularTimesData | null>(null);

  // Load all analytics data
  useEffect(() => {
    if (!specialistId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [dashboard, earnings, bookings, ratings, popularTimes] = await Promise.all([
          getSpecialistDashboard(specialistId, dateRange),
          getSpecialistEarnings(specialistId, period, dateRange),
          getSpecialistBookingsTimeline(specialistId, period, dateRange),
          getSpecialistRatingsBreakdown(specialistId, dateRange),
          getSpecialistPopularTimes(specialistId, dateRange)
        ]);

        setDashboardData(dashboard);
        setEarningsData(earnings);
        setBookingsData(bookings);
        setRatingsData(ratings);
        setPopularTimesData(popularTimes);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        toast.error('Не удалось загрузить аналитику');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [specialistId, dateRange, period]);

  // Quick date range presets
  const setDatePreset = (preset: 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    let from: Date;

    switch (preset) {
      case 'week':
        from = subDays(today, 7);
        break;
      case 'month':
        from = startOfMonth(today);
        break;
      case 'quarter':
        from = subDays(today, 90);
        break;
      case 'year':
        from = subDays(today, 365);
        break;
      default:
        from = subDays(today, 30);
    }

    setDateRange({
      from: format(from, 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
  };

  if (!specialistId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Specialist ID не указан</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Аналитика
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Статистика и метрики вашей работы
              </p>
            </div>

            {/* Date Range Presets */}
            <div className="flex gap-2">
              <button
                onClick={() => setDatePreset('week')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                7 дней
              </button>
              <button
                onClick={() => setDatePreset('month')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Месяц
              </button>
              <button
                onClick={() => setDatePreset('quarter')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                3 месяца
              </button>
              <button
                onClick={() => setDatePreset('year')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Год
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Общий доход
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {dashboardData.totalEarnings.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Завершено сессий
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {dashboardData.completedBookings}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      из {dashboardData.totalBookings} всего
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Средний рейтинг
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {dashboardData.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.totalReviews} отзывов
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Повторные клиенты
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(dashboardData.repeatClientRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Показатель лояльности
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Period Selector */}
        <div className="mb-6">
          <Tabs defaultValue="daily" onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="daily">По дням</TabsTrigger>
              <TabsTrigger value="weekly">По неделям</TabsTrigger>
              <TabsTrigger value="monthly">По месяцам</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {earningsData && (
            <EarningsChart
              data={earningsData.data}
              period={period}
              totalEarnings={earningsData.totalEarnings}
              averagePerBooking={earningsData.averagePerBooking}
              loading={loading}
            />
          )}

          {bookingsData && (
            <BookingsTimeline
              data={bookingsData.data}
              period={period}
              loading={loading}
            />
          )}
        </div>

        {/* Ratings and Popular Times */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {ratingsData && (
            <RatingsBreakdown
              data={ratingsData}
              loading={loading}
            />
          )}

          {popularTimesData && (
            <PopularTimes
              data={popularTimesData}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
