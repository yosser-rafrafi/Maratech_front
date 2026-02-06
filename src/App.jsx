import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import FormateurDashboard from './pages/FormateurDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
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
  } else {
    return <Navigate to="/participant" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
            path="/participant"
            element={
              <PrivateRoute allowedRoles={['participant', 'formateur', 'admin']}>
                <ParticipantDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
