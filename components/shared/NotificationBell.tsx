'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Bell, X, Info, CheckCircle as SuccessIcon, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';
import { Notification } from '@/types';

const fetchUnreadNotifications = async () => {
  const response = await api.get<{ data: Notification[] }>('/notifications', {
    params: { statut: 'non_lu', per_page: 5 },
  });
  return response.data;
};

const markAsRead = async (id: number) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'il y a quelques secondes';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 172800) return 'hier';
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = user?.roles?.[0]?.slug || 'employe';

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 30000,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData?.data ?? [];
  const unreadCount = notifications.length;

  // Shake animation when new notification arrives
  useEffect(() => {
    if (unreadCount > previousCount && previousCount > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    setPreviousCount(unreadCount);
  }, [unreadCount, previousCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    readMutation.mutate(notification.id);
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    setIsOpen(false);
  };

  const handleViewAll = () => {
    router.push(`/${role}/notifications`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${
          isShaking ? 'animate-shake' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <span className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-300" size={32} />
                <p className="mt-2 text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const { icon: Icon, color, bg } = getIconByType(notification.type);

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} ${color} flex-shrink-0`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{notification.titre}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{getRelativeTime(notification.created_at || '')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Voir toutes les notifications
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
