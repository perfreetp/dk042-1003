import { AppRouter } from '@/router';
import { useUserStore } from '@/store/useUserStore';
import { mockUsers } from '@/data/mockUsers';
import { mockRecalls } from '@/data/mockRecalls';
import { mockBatches } from '@/data/mockBatches';
import { mockNotifications } from '@/data/mockNotifications';
import { mockRecoveryRecords } from '@/data/mockRecoveryRecords';
import { useRecallStore } from '@/store/useRecallStore';
import { useBatchStore } from '@/store/useBatchStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { useEffect } from 'react';

export default function App() {
  const { setUsers, currentUser, login } = useUserStore();
  const { setRecalls } = useRecallStore();
  const { setBatches } = useBatchStore();
  const { setNotifications } = useNotificationStore();
  const { setRecoveryRecords } = useRecoveryStore();

  useEffect(() => {
    setUsers(mockUsers);
    setRecalls(mockRecalls);
    setBatches(mockBatches);
    setNotifications(mockNotifications);
    setRecoveryRecords(mockRecoveryRecords);

    if (!currentUser) {
      login('user-1');
    }
  }, []);

  return <AppRouter />;
}
