import { create } from 'zustand';

interface NotificationsState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  increment: () => set({ unreadCount: get().unreadCount + 1 }),
  decrement: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
}));
