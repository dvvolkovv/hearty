import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface BookingsTimelineData {
  date: string;
  completed: number;
  cancelled: number;
  pending: number;
  noShow: number;
}

export interface BookingsTimelineProps {
  data: BookingsTimelineData[];
  period: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

/**
 * BookingsTimeline - Stacked bar chart showing booking statuses over time
 */
export const BookingsTimeline = ({
  data,
  period,
  loading = false
}: BookingsTimelineProps) => {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.date, period),
      total: item.completed + item.cancelled + item.pending + item.noShow
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

  const totals = useMemo(() => {
    return formattedData.reduce(
      (acc, item) => ({
        completed: acc.completed + item.completed,
        cancelled: acc.cancelled + item.cancelled,
        pending: acc.pending + item.pending,
        noShow: acc.noShow + item.noShow,
        total: acc.total + item.total
      }),
      { completed: 0, cancelled: 0, pending: 0, noShow: 0, total: 0 }
    );
  }, [formattedData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{data.formattedDate}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium text-green-600">Завершено:</span>{' '}
            {data.completed}
          </p>
          <p className="text-sm">
            <span className="font-medium text-yellow-600">В ожидании:</span>{' '}
            {data.pending}
          </p>
          <p className="text-sm">
            <span className="font-medium text-red-600">Отменено:</span>{' '}
            {data.cancelled}
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-600">Не явились:</span>{' '}
            {data.noShow}
          </p>
          <p className="text-sm font-medium border-t border-gray-200 pt-1 mt-1">
            Всего: {data.total}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Бронирования</CardTitle>
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
          <CardTitle>Бронирования</CardTitle>
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
        <CardTitle>Бронирования</CardTitle>
        <CardDescription>
          Статус бронирований по периодам
        </CardDescription>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Завершено</p>
            <p className="text-xl font-bold text-green-600">{totals.completed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">В ожидании</p>
            <p className="text-xl font-bold text-yellow-600">{totals.pending}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Отменено</p>
            <p className="text-xl font-bold text-red-600">{totals.cancelled}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Не явились</p>
            <p className="text-xl font-bold text-gray-600">{totals.noShow}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  completed: 'Завершено',
                  pending: 'В ожидании',
                  cancelled: 'Отменено',
                  noShow: 'Не явились'
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="completed" stackId="a" fill="#10b981" />
            <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
            <Bar dataKey="cancelled" stackId="a" fill="#ef4444" />
            <Bar dataKey="noShow" stackId="a" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
