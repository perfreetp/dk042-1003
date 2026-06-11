import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { mockUsers, getCurrentUser } from '@/data/mockUsers';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';

const initialUsers = loadFromStorage<User[]>('users', mockUsers);

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (userId: string) => void;
  getUsersByRole: (role: UserRole) => User[];
  getUsersByRegion: (region: string) => User[];
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: getCurrentUser(),
  users: initialUsers,
  loading: false,
  error: null,

  setUsers: (users: User[]) => {
    set({ users });
    saveToStorage('users', users);
  },

  login: (userId: string) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) {
      set({ currentUser: user });
    }
  },

  logout: () => {
    set({ currentUser: null });
  },

  switchRole: (userId: string) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) {
      set({ currentUser: user });
    }
  },

  getUsersByRole: (role: UserRole) => {
    return get().users.filter((u) => u.role === role);
  },

  getUsersByRegion: (region: string) => {
    return get().users.filter((u) => u.region === region);
  },

  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id);
  },
}));
