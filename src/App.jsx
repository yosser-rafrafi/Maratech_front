import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import FormateurDashboard from './pages/FormateurDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
import Successful from './pages/Successful';
import Unsuccessful from './pages/Unsuccessful';
import PendingApproval from './pages/PendingApproval';
import ResponsableDashboard from './pages/ResponsableDashboard';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import AttendancePage from './pages/AttendancePage';
import StudentDashboard from './pages/StudentDashboard';
import StudentFormations from './pages/StudentFormations';
import StudentFormationDetails from './pages/StudentFormationDetails';
import StudentHistory from './pages/StudentHistory';
import StudentSessionDetails from './pages/StudentSessionDetails';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AccessibilityWidget from './components/AccessibilityWidget';

import './App.css';

// Home redirect component
const Home = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user.role === 'formateur') {
    return <Navigate to="/formateur" replace />;
  } else if (user.role === 'Responsable') {
    return <Navigate to="/responsable" replace />;
  } else if (user.role === 'student' || user.role === 'élève') {
    return <Navigate to="/student-dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/formateur"
              element={
                <PrivateRoute allowedRoles={['formateur', 'admin']}>
                  <FormateurDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/responsable"
              element={
                <PrivateRoute allowedRoles={['Responsable', 'admin']}>
                  <ResponsableDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/participant"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <ParticipantDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/student-dashboard"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/student-formations"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <StudentFormations />
                </PrivateRoute>
              }
            />

            <Route
              path="/student-formation/:id"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <StudentFormationDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/student-history"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <StudentHistory />
                </PrivateRoute>
              }
            />

            <Route
              path="/student-session/:id"
              element={
                <PrivateRoute allowedRoles={['student', 'élève', 'admin']}>
                  <StudentSessionDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <PrivateRoute allowedRoles={['Responsable', 'formateur', 'admin', 'student', 'élève']}>
                  <Calendar />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['Responsable', 'formateur', 'admin', 'student', 'élève']}>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/attendance/:sessionId"
              element={
                <PrivateRoute allowedRoles={['formateur', 'admin']}>
                  <AttendancePage />
                </PrivateRoute>
              }
            />

            <Route path="/success" element={<Successful />} />
            <Route path="/unsuccessful" element={<Unsuccessful />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AccessibilityWidget />
        </AuthProvider>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
