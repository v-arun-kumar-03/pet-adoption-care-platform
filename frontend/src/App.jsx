// src/App.jsx
// All frontend routes are defined here.

import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pets from './pages/Pets';
import PetDetails from './pages/PetDetails';
import AdopterDashboard from './pages/AdopterDashboard';
import ShelterDashboard from './pages/ShelterDashboard';
import MyPets from './pages/MyPets';
import PetForm from './pages/PetForm';
import ShelterApplications from './pages/ShelterApplications';
import PetRecords from './pages/PetRecords';
import Reminders from './pages/Reminders';
import Verification from './pages/Verification';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Scroll to the top when navigating to a new page.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// /dashboard sends each role to its own dashboard.
function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'shelter') return <Navigate to="/shelter" replace />;
  return <Navigate to="/adopter" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetails />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/adopter"
            element={
              <ProtectedRoute roles={['adopter']}>
                <AdopterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter"
            element={
              <ProtectedRoute roles={['shelter']}>
                <ShelterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/pets"
            element={
              <ProtectedRoute roles={['shelter']}>
                <MyPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/pets/new"
            element={
              <ProtectedRoute roles={['shelter']}>
                <PetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/pets/:id/edit"
            element={
              <ProtectedRoute roles={['shelter']}>
                <PetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/pets/:id/records"
            element={
              <ProtectedRoute roles={['shelter']}>
                <PetRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/applications"
            element={
              <ProtectedRoute roles={['shelter']}>
                <ShelterApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/reminders"
            element={
              <ProtectedRoute roles={['shelter']}>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter/verification"
            element={
              <ProtectedRoute roles={['shelter']}>
                <Verification />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
