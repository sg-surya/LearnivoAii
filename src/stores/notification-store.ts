
"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (toast: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (toast) => {
    const newNotification: Notification = {
      ...toast,
      id: uuidv4(),
      read: false,
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (id) => {
    set((state) => {
      const notificationExists = state.notifications.some(n => n.id === id && !n.read);
      if (notificationExists) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.unreadCount - 1,
        };
      }
      return state;
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));
