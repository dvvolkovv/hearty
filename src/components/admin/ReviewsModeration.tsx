import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import type { Review } from '../../api/admin';
import { approveReview, rejectReview } from '../../api/admin';

export interface ReviewsModerationProps {
  reviews: Review[];
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * ReviewsModeration - Admin component for review moderation
 */
export const ReviewsModeration = ({
  reviews,
  loading = false,
  onRefresh
}: ReviewsModerationProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    try {
      await approveReview(selectedReview.id);
      toast.success('Отзыв одобрен');
      setShowApproveModal(false);
      setSelectedReview(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to approve review:', error);
      toast.error('Не удалось одобрить отзыв');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    try {
      await rejectReview(selectedReview.id, reason || undefined);
      toast.success('Отзыв отклонен');
      setShowRejectModal(false);
      setReason('');
      setSelectedReview(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to reject review:', error);
      toast.error('Не удалось отклонить отзыв');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Одобрен</Badge>;
      case 'PENDING':
        return <Badge variant="warning">На рассмотрении</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Отклонен</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead>Специалист</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Рейтинг</TableHead>
            <TableHead>Комментарий</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length === 0 ? (
            <TableEmpty>
              Отзывы не найдены
            </TableEmpty>
          ) : (
            reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {review.specialist.user.firstName} {review.specialist.user.lastName}
                  </div>
                </TableCell>
                <TableCell>
                  {review.client.user.firstName} {review.client.user.lastName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium">{review.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {review.comment ? (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {review.comment}
                      </p>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Без комментария
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(parseISO(review.createdAt), 'd MMM yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  {getStatusBadge(review.status)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {review.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowApproveModal(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}

                    {review.status === 'REJECTED' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowApproveModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Одобрить
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Approve Modal */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)}>
        <ModalHeader onClose={() => setShowApproveModal(false)}>
          Одобрить отзыв
        </ModalHeader>
        <ModalBody>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Отзыв от:</p>
                <p className="font-medium text-gray-900">
                  {selectedReview.client.user.firstName} {selectedReview.client.user.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Специалист:</p>
                <p className="font-medium text-gray-900">
                  {selectedReview.specialist.user.firstName} {selectedReview.specialist.user.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Рейтинг:</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium">{selectedReview.rating} из 5</span>
                </div>
              </div>

              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Комментарий:</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  Отзыв будет опубликован и повлияет на рейтинг специалиста.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowApproveModal(false)}>
            Отмена
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            loading={actionLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Одобрить
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <ModalHeader onClose={() => setShowRejectModal(false)}>
          Отклонить отзыв
        </ModalHeader>
        <ModalBody>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Отзыв от:</p>
                <p className="font-medium text-gray-900">
                  {selectedReview.client.user.firstName} {selectedReview.client.user.lastName}
                </p>
              </div>

              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Комментарий:</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина отклонения (опционально)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Нарушение правил, спам, оскорбления..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  Отзыв не будет опубликован и не повлияет на рейтинг.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRejectModal(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={actionLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Отклонить
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
