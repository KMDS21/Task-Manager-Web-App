import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Placeholder page components for initial build test
const TempPage = ({ title }) => (
  <div className="container p-8">
    <h1 className="text-2xl font-bold">{title} Page</h1>
    <p className="text-muted-foreground mt-2">Frontend structure built and ready!</p>
  </div>
);

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <TempPage title="Login" />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <TempPage title="Register" />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TempPage title="Dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TempPage title="Tasks List" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <TempPage title="Admin Dashboard" />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

