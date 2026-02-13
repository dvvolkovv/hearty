import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, Star, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

// API imports
import {
  getPlatformStats,
  getUsers,
  getSpecialists,
  getReviews,
  type User,
  type Specialist,
  type Review,
  type PlatformStats
} from '../../api/admin';

// Component imports
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { UsersTable } from '../../components/admin/UsersTable';
import { SpecialistsModeration } from '../../components/admin/SpecialistsModeration';
import { ReviewsModeration } from '../../components/admin/ReviewsModeration';
import { Button } from '../../components/ui/Button';

/**
 * AdminDashboard - Main admin panel
 * Platform statistics, user management, specialist moderation, review moderation
 */
export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'specialists' | 'reviews'>('overview');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState<{ role?: 'CLIENT' | 'SPECIALIST' | 'ADMIN'; search?: string }>({});

  // Specialists state
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [specialistFilter, setSpecialistFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | undefined>('PENDING');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>('PENDING');

  // Load platform stats
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
        toast.error('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Load users when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, userFilters]);

  // Load specialists when tab changes
  useEffect(() => {
    if (activeTab === 'specialists') {
      loadSpecialists();
    }
  }, [activeTab, specialistFilter]);

  // Load reviews when tab changes
  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab, reviewFilter]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsers({ limit: 50, ...userFilters });
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Не удалось загрузить пользователей');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSpecialists = async () => {
    setSpecialistsLoading(true);
    try {
      const data = await getSpecialists({ limit: 50, status: specialistFilter });
      setSpecialists(data.specialists);
    } catch (error) {
      console.error('Failed to load specialists:', error);
      toast.error('Не удалось загрузить специалистов');
    } finally {
      setSpecialistsLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviews({ limit: 50, status: reviewFilter });
      setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Не удалось загрузить отзывы');
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Панель администратора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Управление платформой Hearty
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">
              Пользователи
              {stats && stats.totalUsers > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {stats.totalUsers}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="specialists">
              Специалисты
              {stats && stats.pendingSpecialists > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingSpecialists}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Отзывы
              {stats && stats.pendingReviews > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingReviews}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Всего пользователей
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.totalUsers}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Специалистов: {stats.totalSpecialists} • Клиентов: {stats.totalClients}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            На модерации
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.pendingSpecialists}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Специалистов ожидают проверки
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Всего бронирований
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.totalBookings}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Активность платформы
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
                            Общий доход
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.totalRevenue.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Весь период работы
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Отзывы на проверке
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats.pendingReviews}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Требуют модерации
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Быстрые действия</CardTitle>
                    <CardDescription>Основные задачи администратора</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('specialists')}
                      >
                        <UserCheck className="w-5 h-5 mr-2" />
                        Модерация специалистов ({stats.pendingSpecialists})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('reviews')}
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Модерация отзывов ({stats.pendingReviews})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('users')}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        Управление пользователями
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Управление пользователями</CardTitle>
                    <CardDescription>Все пользователи платформы</CardDescription>
                  </div>
                  <Button onClick={loadUsers} size="sm">
                    Обновить
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userFilters.role || ''}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value as any || undefined })}
                  >
                    <option value="">Все роли</option>
                    <option value="CLIENT">Клиенты</option>
                    <option value="SPECIALIST">Специалисты</option>
                    <option value="ADMIN">Администраторы</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <UsersTable
                  users={users}
                  loading={usersLoading}
                  onRefresh={loadUsers}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specialists Tab */}
          <TabsContent value="specialists">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Модерация специалистов</CardTitle>
                    <CardDescription>Одобрение и управление специалистами</CardDescription>
                  </div>
                  <Button onClick={loadSpecialists} size="sm">
                    Обновить
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={specialistFilter || ''}
                    onChange={(e) => setSpecialistFilter(e.target.value as any || undefined)}
                  >
                    <option value="">Все статусы</option>
                    <option value="PENDING">На рассмотрении</option>
                    <option value="APPROVED">Одобрены</option>
                    <option value="REJECTED">Отклонены</option>
                    <option value="SUSPENDED">Приостановлены</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <SpecialistsModeration
                  specialists={specialists}
                  loading={specialistsLoading}
                  onRefresh={loadSpecialists}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Модерация отзывов</CardTitle>
                    <CardDescription>Проверка и одобрение отзывов</CardDescription>
                  </div>
                  <Button onClick={loadReviews} size="sm">
                    Обновить
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={reviewFilter || ''}
                    onChange={(e) => setReviewFilter(e.target.value as any || undefined)}
                  >
                    <option value="">Все статусы</option>
                    <option value="PENDING">На рассмотрении</option>
                    <option value="APPROVED">Одобрены</option>
                    <option value="REJECTED">Отклонены</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <ReviewsModeration
                  reviews={reviews}
                  loading={reviewsLoading}
                  onRefresh={loadReviews}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
