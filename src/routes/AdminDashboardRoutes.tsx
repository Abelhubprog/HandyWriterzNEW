import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import ServicePagesManager from '@/components/admin/ServicePageManager';
import ServicePageEditor from '@/components/admin/ServiceContentEditor';
import { ServiceType } from '@/types/content';

/**
 * Admin Service Pages Routes Component
 * 
 * This component defines all routes related to service page management in the admin dashboard.
 * It's designed to be easily integrated into the main admin routing system.
 */

// Wrapper component to handle service type parameter
const ServiceEditorWrapper: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  
  // Default to academic-writing if no service type specified
  const validServiceType = (serviceType as ServiceType) || 'academic-writing';
  
  return <ServicePageEditor serviceType={validServiceType} />;
};

const AdminServicePagesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ServicePagesManager />} />
      <Route path="/new/:serviceType" element={<ServiceEditorWrapper />} />
      <Route path="/edit/:serviceType/:id" element={<ServiceEditorWrapper />} />
      {/* Fallback routes with default service type */}
      <Route path="/new" element={<ServicePageEditor serviceType="academic-writing" />} />
      <Route path="/edit/:id" element={<ServicePageEditor serviceType="academic-writing" />} />
    </Routes>
  );
};

export default AdminServicePagesRoutes;
