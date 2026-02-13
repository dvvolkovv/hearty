import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import type { User } from '../../api/admin';
import { banUser, unbanUser } from '../../api/admin';

export interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * UsersTable - Admin table for user management
 */
export const UsersTable = ({ users, loading = false, onRefresh }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error('Укажите причину блокировки');
      return;
    }

    setActionLoading(true);
    try {
      await banUser(selectedUser.id, banReason);
      toast.success(`Пользователь ${selectedUser.firstName} ${selectedUser.lastName} заблокирован`);
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Не удалось заблокировать пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await unbanUser(selectedUser.id);
      toast.success(`Пользователь ${selectedUser.firstName} ${selectedUser.lastName} разблокирован`);
      setShowUnbanModal(false);
      setSelectedUser(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to unban user:', error);
      toast.error('Не удалось разблокировать пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="purple">Админ</Badge>;
      case 'SPECIALIST':
        return <Badge variant="info">Специалист</Badge>;
      case 'CLIENT':
        return <Badge variant="default">Клиент</Badge>;
      default:
        return <Badge variant="gray">{role}</Badge>;
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
            <TableHead>Пользователь</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата регистрации</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableEmpty>
              Пользователи не найдены
            </TableEmpty>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.email}
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  {user.bannedAt ? (
                    <div>
                      <Badge variant="error">Заблокирован</Badge>
                      {user.banReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.banReason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="success">Активен</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {format(parseISO(user.createdAt), 'd MMMM yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.bannedAt ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUnbanModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Разблокировать
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                        disabled={user.role === 'ADMIN'}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Заблокировать
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Ban Modal */}
      <Modal isOpen={showBanModal} onClose={() => setShowBanModal(false)}>
        <ModalHeader onClose={() => setShowBanModal(false)}>
          Заблокировать пользователя
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Вы собираетесь заблокировать:</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина блокировки *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Укажите причину блокировки..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>Внимание:</strong> Заблокированный пользователь потеряет доступ к платформе.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBanModal(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={handleBan}
            loading={actionLoading}
            disabled={!banReason.trim()}
          >
            <Ban className="w-4 h-4 mr-2" />
            Заблокировать
          </Button>
        </ModalFooter>
      </Modal>

      {/* Unban Modal */}
      <Modal isOpen={showUnbanModal} onClose={() => setShowUnbanModal(false)}>
        <ModalHeader onClose={() => setShowUnbanModal(false)}>
          Разблокировать пользователя
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Вы собираетесь разблокировать:</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </p>
              </div>

              {selectedUser.banReason && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Причина блокировки:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedUser.banReason}</p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  Пользователь снова получит полный доступ к платформе.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUnbanModal(false)}>
            Отмена
          </Button>
          <Button
            variant="success"
            onClick={handleUnban}
            loading={actionLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Разблокировать
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
