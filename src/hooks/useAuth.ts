import { useCallback, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole, User } from '@/types';

export const useAuth = () => {
  const { currentUser, users, login, logout, switchRole, getUsersByRole, getUsersByRegion, getUserById } =
    useUserStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        login(user.id);
      } catch {
        console.error('Failed to parse stored user');
      }
    }
  }, [login]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!currentUser) return false;
      if (Array.isArray(role)) {
        return role.includes(currentUser.role);
      }
      return currentUser.role === role;
    },
    [currentUser]
  );

  const canCreateRecall = useCallback((): boolean => {
    return hasRole('pharma');
  }, [hasRole]);

  const canSubmitRecovery = useCallback((): boolean => {
    return hasRole(['distributor', 'store']);
  }, [hasRole]);

  const canViewDashboard = useCallback((): boolean => {
    return hasRole('pharma');
  }, [hasRole]);

  const canExport = useCallback((): boolean => {
    return hasRole('pharma');
  }, [hasRole]);

  const canCloseTask = useCallback((): boolean => {
    return hasRole('pharma');
  }, [hasRole]);

  const canEditRecall = useCallback((): boolean => {
    return hasRole('pharma');
  }, [hasRole]);

  const canViewRecovery = useCallback((): boolean => {
    return hasRole(['pharma', 'distributor', 'store']);
  }, [hasRole]);

  const handleLogin = useCallback(
    (userId: string) => {
      login(userId);
    },
    [login]
  );

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem('currentUser');
  }, [logout]);

  const handleSwitchRole = useCallback(
    (userId: string) => {
      switchRole(userId);
    },
    [switchRole]
  );

  return {
    currentUser,
    users,
    isAuthenticated: !!currentUser,
    hasRole,
    canCreateRecall,
    canSubmitRecovery,
    canViewDashboard,
    canExport,
    canCloseTask,
    canEditRecall,
    canViewRecovery,
    login: handleLogin,
    logout: handleLogout,
    switchRole: handleSwitchRole,
    getUsersByRole,
    getUsersByRegion,
    getUserById,
  };
};
