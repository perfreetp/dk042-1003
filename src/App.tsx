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
import { useOperationLogStore } from '@/store/useOperationLogStore';
import { mockOperationLogs } from '@/data/mockOperationLogs';
import { useInternalNoteStore } from '@/store/useInternalNoteStore';
import { mockInternalNotes } from '@/data/mockInternalNotes';
import { useEffect } from 'react';
import { loadFromStorage } from '@/utils/persistUtils';

export default function App() {
  const { setUsers, currentUser, login } = useUserStore();
  const { setRecalls } = useRecallStore();
  const { setBatches } = useBatchStore();
  const { setNotifications } = useNotificationStore();
  const { setRecoveryRecords } = useRecoveryStore();
  const { setOperationLogs } = useOperationLogStore();
  const { setNotes } = useInternalNoteStore();

  useEffect(() => {
    const storedRecalls = loadFromStorage('recalls', null);
    const storedNotifications = loadFromStorage('notifications', null);
    const storedBatches = loadFromStorage('batches', null);
    const storedRecoveryRecords = loadFromStorage('recoveryRecords', null);
    const storedUsers = loadFromStorage('users', null);
    const storedOperationLogs = loadFromStorage('operationLogs', null);
    const storedInternalNotes = loadFromStorage('internalNotes', null);

    if (storedUsers && storedUsers.length > 0) {
      setUsers(storedUsers);
    } else {
      setUsers(mockUsers);
    }

    if (storedRecalls && storedRecalls.length > 0) {
      setRecalls(storedRecalls);
    } else {
      setRecalls(mockRecalls);
    }

    if (storedBatches && storedBatches.length > 0) {
      setBatches(storedBatches);
    } else {
      setBatches(mockBatches);
    }

    if (storedNotifications && storedNotifications.length > 0) {
      setNotifications(storedNotifications);
    } else {
      setNotifications(mockNotifications);
    }

    if (storedRecoveryRecords && storedRecoveryRecords.length > 0) {
      setRecoveryRecords(storedRecoveryRecords);
    } else {
      setRecoveryRecords(mockRecoveryRecords);
    }

    if (storedOperationLogs && storedOperationLogs.length > 0) {
      setOperationLogs(storedOperationLogs);
    } else {
      setOperationLogs(mockOperationLogs);
    }

    if (storedInternalNotes && storedInternalNotes.length > 0) {
      setNotes(storedInternalNotes);
    } else {
      setNotes(mockInternalNotes);
    }

    if (!currentUser) {
      login('u001');
    }
  }, []);

  return <AppRouter />;
}
