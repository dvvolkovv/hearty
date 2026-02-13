import { Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface RatingsBreakdownData {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface RatingsBreakdownProps {
  data: RatingsBreakdownData;
  loading?: boolean;
}

/**
 * RatingsBreakdown - Displays rating distribution and recent reviews
 */
export const RatingsBreakdown = ({
  data,
  loading = false
}: RatingsBreakdownProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Рейтинги</CardTitle>
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

  if (!data || data.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Рейтинги</CardTitle>
          <CardDescription>Пока нет отзывов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>Отзывы отсутствуют</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPercentage = (count: number): number => {
    return data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рейтинги и отзывы</CardTitle>
        <CardDescription>
          Распределение оценок и последние отзывы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Distribution */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl font-bold text-gray-900">
                {data.averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(data.averageRating), 'lg')}
                <p className="text-sm text-gray-600 mt-1">
                  {data.totalReviews} отзывов
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = data.distribution[rating as keyof typeof data.distribution];
                const percentage = getPercentage(count);

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-gray-700">
                        {rating}
                      </span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Последние отзывы
            </h4>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.client.firstName} {review.client.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(review.createdAt), 'd MMMM yyyy', {
                          locale: ru
                        })}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}

              {data.recentReviews.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  Нет недавних отзывов
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
