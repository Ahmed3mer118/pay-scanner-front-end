import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { I18nProvider, useI18n } from './context/I18nContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Transfers from './pages/Transfers';
import TransferDetail from './pages/TransferDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <div className="loading-screen">{t('common.loading')}</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { dir } = useI18n();
  return (
    <>
      <Toaster
        position={dir === 'rtl' ? 'top-left' : 'top-right'}
        toastOptions={{ duration: 3000 }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="transfers/:id" element={<TransferDetail />} />
          <Route path="upload" element={<Upload />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => (
  <I18nProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </I18nProvider>
);

export default App;
