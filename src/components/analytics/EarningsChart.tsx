import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface EarningsChartData {
  date: string;
  earnings: number;
  bookings: number;
}

export interface EarningsChartProps {
  data: EarningsChartData[];
  period: 'daily' | 'weekly' | 'monthly';
  totalEarnings: number;
  averagePerBooking: number;
  loading?: boolean;
}

/**
 * EarningsChart - Displays earnings trends over time
 */
export const EarningsChart = ({
  data,
  period,
  totalEarnings,
  averagePerBooking,
  loading = false
}: EarningsChartProps) => {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.date, period),
      earningsFormatted: `${item.earnings.toLocaleString('ru-RU')} ₽`
    }));
  }, [data, period]);

  const formatDate = (dateString: string, period: string): string => {
    const date = parseISO(dateString);

    switch (period) {
      case 'daily':
        return format(date, 'd MMM', { locale: ru });
      case 'weekly':
        return format(date, 'd MMM', { locale: ru });
      case 'monthly':
        return format(date, 'LLL yyyy', { locale: ru });
      default:
        return dateString;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{data.formattedDate}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-blue-600">Доход:</span>{' '}
            {data.earnings.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium text-green-600">Сессий:</span>{' '}
            {data.bookings}
          </p>
          {data.bookings > 0 && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Средняя:</span>{' '}
              {(data.earnings / data.bookings).toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Доход</CardTitle>
          <CardDescription>Загрузка данных...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Доход</CardTitle>
          <CardDescription>Нет данных за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>Данные отсутствуют</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Доход</CardTitle>
        <CardDescription>
          Динамика заработка за период
        </CardDescription>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-600">Общий доход</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalEarnings.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Средняя стоимость сессии</p>
            <p className="text-2xl font-bold text-gray-900">
              {averagePerBooking.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
