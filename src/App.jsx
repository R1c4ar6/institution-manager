import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import StudentDetail from './components/StudentDetail';
import Layout from './components/Layout';

// function ProtectedRoute({ children }) {
//   const { employee, loading } = useAuth();
  
//   if (loading) return <div>Loading...</div>;
//   return employee ? children : <Navigate to="/login" />;
// }

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={
            // <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            // </ProtectedRoute>
          } />
          <Route path="/students" element={
            // <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            // </ProtectedRoute>
          } />
          <Route path="/students/:id" element={
            // <ProtectedRoute>
              <Layout>
                <StudentDetail />
              </Layout>
            // </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;