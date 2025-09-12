import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { DatabaseProvider } from '@/contexts/DatabaseConnectionContext';
import AdminRoutes from './Routes';
import { Toaster } from '@/components/ui/toast/toaster';

/**
 * Admin application wrapper for the HandyWriterz platform
 * The component wraps all admin pages with necessary providers and routing
 */
const Admin: React.FC = () => {
  return (
    <ClerkProvider>
      <DatabaseProvider>
        <Routes>
          <Route path="*" element={<AdminRoutes />} />
        </Routes>
        <Toaster />
      </DatabaseProvider>
    </ClerkProvider>
  );
};

export default Admin; 