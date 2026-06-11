import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { RecallList } from '@/pages/RecallList';
import { RecallCreate } from '@/pages/RecallCreate';
import { RecallDetail } from '@/pages/RecallDetail';
import { BatchManagement } from '@/pages/BatchManagement';
import { NotificationManagement } from '@/pages/NotificationManagement';
import { RecoveryList } from '@/pages/RecoveryList';
import { RecoverySubmit } from '@/pages/RecoverySubmit';
import { Dashboard } from '@/pages/Dashboard';
import { Archive } from '@/pages/Archive';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RecallList />} />
          <Route path="/recalls" element={<RecallList />} />
          <Route path="/recalls/create" element={<RecallCreate />} />
          <Route path="/recalls/:id" element={<RecallDetail />} />
          <Route path="/batches" element={<BatchManagement />} />
          <Route path="/notifications" element={<NotificationManagement />} />
          <Route path="/recovery" element={<RecoveryList />} />
          <Route path="/recovery/submit/:notificationId" element={<RecoverySubmit />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};
