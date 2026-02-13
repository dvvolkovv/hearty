import { useState } from 'react';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import type { Specialist } from '../../api/admin';
import { approveSpecialist, rejectSpecialist, suspendSpecialist } from '../../api/admin';

export interface SpecialistsModerationProps {
  specialists: Specialist[];
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * SpecialistsModeration - Admin component for specialist moderation
 */
export const SpecialistsModeration = ({
  specialists,
  loading = false,
  onRefresh
}: SpecialistsModerationProps) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    if (!selectedSpecialist) return;

    setActionLoading(true);
    try {
      await approveSpecialist(selectedSpecialist.id);
      toast.success(`Специалист ${selectedSpecialist.user.firstName} ${selectedSpecialist.user.lastName} одобрен`);
      setShowApproveModal(false);
      setSelectedSpecialist(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to approve specialist:', error);
      toast.error('Не удалось одобрить специалиста');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSpecialist) return;

    setActionLoading(true);
    try {
      await rejectSpecialist(selectedSpecialist.id, reason || undefined);
      toast.success(`Специалист ${selectedSpecialist.user.firstName} ${selectedSpecialist.user.lastName} отклонен`);
      setShowRejectModal(false);
      setReason('');
      setSelectedSpecialist(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to reject specialist:', error);
      toast.error('Не удалось отклонить специалиста');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedSpecialist) return;

    setActionLoading(true);
    try {
      await suspendSpecialist(selectedSpecialist.id, reason || undefined);
      toast.success(`Специалист ${selectedSpecialist.user.firstName} ${selectedSpecialist.user.lastName} приостановлен`);
      setShowSuspendModal(false);
      setReason('');
      setSelectedSpecialist(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to suspend specialist:', error);
      toast.error('Не удалось приостановить специалиста');
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
      case 'SUSPENDED':
        return <Badge variant="gray">Приостановлен</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
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
            <TableHead>Специализация</TableHead>
            <TableHead>Опыт</TableHead>
            <TableHead>Стоимость</TableHead>
            <TableHead>Рейтинг</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specialists.length === 0 ? (
            <TableEmpty>
              Специалисты не найдены
            </TableEmpty>
          ) : (
            specialists.map((specialist) => (
              <TableRow key={specialist.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {specialist.user.firstName} {specialist.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {specialist.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{specialist.specialty}</span>
                </TableCell>
                <TableCell>
                  {specialist.experience} {specialist.experience === 1 ? 'год' : 'лет'}
                </TableCell>
                <TableCell>
                  {specialist.hourlyRate.toLocaleString('ru-RU')} ₽/час
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{specialist.rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">
                      {specialist.totalReviews} отзывов
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(specialist.status)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {specialist.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedSpecialist(specialist);
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
                            setSelectedSpecialist(specialist);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}

                    {specialist.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSpecialist(specialist);
                          setShowSuspendModal(true);
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Приостановить
                      </Button>
                    )}

                    {(specialist.status === 'REJECTED' || specialist.status === 'SUSPENDED') && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedSpecialist(specialist);
                          setShowApproveModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Активировать
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
          Одобрить специалиста
        </ModalHeader>
        <ModalBody>
          {selectedSpecialist && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Вы собираетесь одобрить:</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedSpecialist.user.firstName} {selectedSpecialist.user.lastName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedSpecialist.specialty} • {selectedSpecialist.experience} лет опыта
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  После одобрения специалист появится в поиске и сможет принимать заявки.
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
          Отклонить специалиста
        </ModalHeader>
        <ModalBody>
          {selectedSpecialist && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Вы собираетесь отклонить:</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedSpecialist.user.firstName} {selectedSpecialist.user.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина отклонения (опционально)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Укажите причину отклонения..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  Специалист не сможет принимать заявки до повторного одобрения.
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

      {/* Suspend Modal */}
      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)}>
        <ModalHeader onClose={() => setShowSuspendModal(false)}>
          Приостановить специалиста
        </ModalHeader>
        <ModalBody>
          {selectedSpecialist && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Вы собираетесь приостановить:</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedSpecialist.user.firstName} {selectedSpecialist.user.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина приостановки (опционально)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Укажите причину приостановки..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  Специалист временно не сможет принимать новые заявки.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
            Отмена
          </Button>
          <Button
            variant="secondary"
            onClick={handleSuspend}
            loading={actionLoading}
          >
            <Ban className="w-4 h-4 mr-2" />
            Приостановить
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
