import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface PopularTimesData {
  dayOfWeek: {
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    Sunday: number;
  };
  hourOfDay: Record<string, number>;
  mostPopularDay: string;
  mostPopularHour: string;
}

export interface PopularTimesProps {
  data: PopularTimesData;
  loading?: boolean;
}

/**
 * PopularTimes - Heatmap visualization of popular booking times
 */
export const PopularTimes = ({
  data,
  loading = false
}: PopularTimesProps) => {
  const dayTranslations: Record<string, string> = {
    Monday: 'Пн',
    Tuesday: 'Вт',
    Wednesday: 'Ср',
    Thursday: 'Чт',
    Friday: 'Пт',
    Saturday: 'Сб',
    Sunday: 'Вс'
  };

  const dayTranslationsFull: Record<string, string> = {
    Monday: 'Понедельник',
    Tuesday: 'Вторник',
    Wednesday: 'Среда',
    Thursday: 'Четверг',
    Friday: 'Пятница',
    Saturday: 'Суббота',
    Sunday: 'Воскресенье'
  };

  const maxDayValue = useMemo(() => {
    return Math.max(...Object.values(data.dayOfWeek));
  }, [data.dayOfWeek]);

  const maxHourValue = useMemo(() => {
    return Math.max(...Object.values(data.hourOfDay));
  }, [data.hourOfDay]);

  const getColorIntensity = (value: number, maxValue: number): string => {
    if (maxValue === 0) return 'bg-gray-100';

    const intensity = (value / maxValue) * 100;

    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 20) return 'bg-blue-100';
    if (intensity < 40) return 'bg-blue-200';
    if (intensity < 60) return 'bg-blue-300';
    if (intensity < 80) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  const getTextColor = (value: number, maxValue: number): string => {
    if (maxValue === 0) return 'text-gray-700';

    const intensity = (value / maxValue) * 100;
    return intensity >= 60 ? 'text-white' : 'text-gray-900';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Популярные времена</CardTitle>
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

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Популярные времена</CardTitle>
          <CardDescription>Нет данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>Данные отсутствуют</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hours = Object.keys(data.hourOfDay).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Популярные времена</CardTitle>
        <CardDescription>
          Тепловая карта загруженности по дням недели и времени
        </CardDescription>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-600">Самый популярный день</p>
            <p className="text-lg font-bold text-blue-600">
              {dayTranslationsFull[data.mostPopularDay] || data.mostPopularDay}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Самое популярное время</p>
            <p className="text-lg font-bold text-blue-600">
              {data.mostPopularHour}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day of Week Heatmap */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            По дням недели
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(data.dayOfWeek).map(([day, count]) => (
              <div key={day} className="text-center">
                <div
                  className={`
                    rounded-lg p-4 transition-colors duration-200
                    ${getColorIntensity(count, maxDayValue)}
                    ${getTextColor(count, maxDayValue)}
                  `}
                  title={`${dayTranslationsFull[day]}: ${count} бронирований`}
                >
                  <div className="text-xs font-medium mb-1">
                    {dayTranslations[day]}
                  </div>
                  <div className="text-lg font-bold">
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hour of Day Heatmap */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            По времени суток
          </h4>
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {hours.map((hour) => {
              const count = data.hourOfDay[hour];
              return (
                <div key={hour} className="text-center">
                  <div
                    className={`
                      rounded-lg p-3 transition-colors duration-200
                      ${getColorIntensity(count, maxHourValue)}
                      ${getTextColor(count, maxHourValue)}
                    `}
                    title={`${hour}: ${count} бронирований`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {hour.split(':')[0]}h
                    </div>
                    <div className="text-sm font-bold">
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600">Меньше</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
          </div>
          <span className="text-xs text-gray-600">Больше</span>
        </div>
      </CardContent>
    </Card>
  );
};
