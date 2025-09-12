import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLogin from '@/pages/auth/admin-login';

// Page imports
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import ContentList from './pages/content/ContentList';
import ContentEditor from './pages/content/ContentEditor';
import Categories from './pages/content/Categories';
import ServicesPage from './pages/content/ServicesPage';
import ServiceEditor from './pages/content/ServiceEditor';
import UsersList from './pages/users/UsersList';
import UserEditor from './pages/users/UserEditor';
import Analytics from './pages/Analytics';
import Settings from "./settings";
import NotFound from "@/pages/not-found";

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
    <p className="text-lg text-gray-700 mb-6">You don't have permission to access this page.</p>
    <button 
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Go Back
    </button>
  </div>
);

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/auth/admin-login" replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        } />

        {/* Orders Management */}
        <Route path="orders" element={
          <ErrorBoundary>
            <Orders />
          </ErrorBoundary>
        } />

        {/* Messages Management */}
        <Route path="messages" element={
          <ErrorBoundary>
            <Messages />
          </ErrorBoundary>
        } />

        {/* Content Management */}
        <Route path="content">
          <Route index element={
            <ErrorBoundary>
              <ContentList />
            </ErrorBoundary>
          } />
          <Route path="new" element={
            <ErrorBoundary>
              <ContentEditor />
            </ErrorBoundary>
          } />
          <Route path=":id" element={
            <ErrorBoundary>
              <ContentEditor />
            </ErrorBoundary>
          } />
          <Route path="categories" element={
            <ErrorBoundary>
              <Categories />
            </ErrorBoundary>
          } />
        </Route>

        {/* Categories Management */}
        <Route path="categories" element={
          <ErrorBoundary>
            <Categories />
          </ErrorBoundary>
        } />

        {/* Services Management */}
        <Route path="services">
          <Route index element={
            <ErrorBoundary>
              <ServicesPage />
            </ErrorBoundary>
          } />
          <Route path="new" element={
            <ErrorBoundary>
              <ServiceEditor />
            </ErrorBoundary>
          } />
          <Route path="edit/:service" element={
            <ErrorBoundary>
              <ServiceEditor />
            </ErrorBoundary>
          } />

          {/* Service-specific Content Management */}
          <Route path=":service" element={
            <ErrorBoundary>
              <ContentList />
            </ErrorBoundary>
          } />
          <Route path=":service/new" element={
            <ErrorBoundary>
              <ContentEditor />
            </ErrorBoundary>
          } />
          <Route path=":service/:id" element={
            <ErrorBoundary>
              <ContentEditor />
            </ErrorBoundary>
          } />
        </Route>

        {/* User Management */}
        <Route path="users">
          <Route index element={
            <ProtectedRoute requireAdmin={true}>
              <ErrorBoundary>
                <UsersList />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="new" element={
            <ProtectedRoute requireAdmin={true}>
              <ErrorBoundary>
                <UserEditor />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path=":id" element={
            <ProtectedRoute requireAdmin={true}>
              <ErrorBoundary>
                <UserEditor />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
        </Route>

        <Route path="analytics" element={
          <ErrorBoundary>
            <Analytics />
          </ErrorBoundary>
        } />
        <Route path="settings" element={
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
