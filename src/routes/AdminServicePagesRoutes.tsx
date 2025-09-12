import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ServicePagesManager from '@/components/admin/ServicePagesManager';
import ServicePageEditor from '@/components/admin/ServiceContentEditor';

const AdminServicePagesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ServicePagesManager />} />
      <Route path="new" element={<ServicePageEditor serviceType="essay-writing" />} />
      <Route path="edit/:id" element={<ServicePageEditor serviceType="essay-writing" />} />
    </Routes>
  );
};

export default AdminServicePagesRoutes;