'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/shared/PageHeader';
import { Bell, CheckCircle, Trash2, X, Info, CheckCircle as SuccessIcon, AlertTriangle, AlertCircle } from 'lucide-react';
import { Notification } from '@/types';

const fetchNotifications = async (params?: any) => {
  const response = await api.get<{ data: Notification[] }>('/notifications', { params });
  return response.data.data;
};

const markAsRead = async (id: number) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

const deleteNotification = async (id: number) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'il y a quelques secondes';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} heure${Math.floor(seconds / 3600) > 1 ? 's' : ''}`;
  if (seconds < 172800) return 'hier';
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getIconByType = (type: string) => {
  switch (type) {
    case 'success':
      return { icon: SuccessIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 'warning':
    case 'alerte':
      return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' };
    case 'error':
      return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
    case 'info':
    default:
      return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
  }
};

export default function NotificationsList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => fetchNotifications({ page, per_page: 20 }),
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData ?? [];
  const meta = (notificationsData as any)?.meta;
  const unreadCount = notifications.filter((n) => !n.is_read && !n.lu && n.statut !== 'lu').length;

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const aUnread = !a.is_read && !a.lu && a.statut !== 'lu';
      const bUnread = !b.is_read && !b.lu && b.statut !== 'lu';
      
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    });
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read && !notification.lu && notification.statut !== 'lu') {
      readMutation.mutate(notification.id);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
        icon={<Bell size={28} className="text-purple-600" />}
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Tout marquer comme lu
            </button>
          )
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-gray-300" size={48} />
            <p className="mt-4 text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedNotifications.map((notification) => {
              const isUnread = !notification.is_read && !notification.lu && notification.statut !== 'lu';
              const { icon: Icon, color, bg } = getIconByType(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${color} flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.titre}
                          </p>
                          <p className={`mt-1 text-sm ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {getRelativeTime(notification.created_at || '')}
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notification.id);
                          }}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Supprimer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {meta.last_page}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.last_page || 1, p + 1))}
            disabled={page === (meta.last_page || 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
