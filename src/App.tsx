import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import theme from './theme';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { NovaChat } from './components/NovaChat';

// Pages
import LoginPage from './pages/LoginPage';
import EquipmentCatalogPage from './pages/EquipmentCatalogPage';
import CheckoutCheckinPage from './pages/CheckoutCheckinPage';
import ReservationsPage from './pages/ReservationsPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StorageManagementPage from './pages/StorageManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MeetingRoomsPage from './pages/MeetingRoomsPage';
import LabsPage from './pages/LabsPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminStorageManagementPage from './pages/AdminStorageManagementPage';
import AdminEquipmentPage from './pages/AdminEquipmentPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianHistoryPage from './pages/TechnicianHistoryPage';
import TechnicianPartsPage from './pages/TechnicianPartsPage';
import GuestDashboardPage from './pages/GuestDashboardPage';
import GuestEquipmentPage from './pages/GuestEquipmentPage';
import GuestRoomsPage from './pages/GuestRoomsPage';
import GuestLabsPage from './pages/GuestLabsPage';
import EngineerMeetingRoomsPage from './pages/EngineerMeetingRoomsPage';
import EngineerLabsPage from './pages/EngineerLabsPage';
import AdminActivityLogPage from './pages/AdminActivityLogPage';

// Types
import { User } from './types';

interface ProtectedRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
  requiredRoles?: string[];
  userRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, isAuthenticated, requiredRoles, userRole }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={userRole === 'admin' ? '/admin' : userRole === 'technician' ? '/technician' : userRole === 'guest' ? '/guest' : '/analytics'} />;
  }

  return <>{element}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode; user: User | null; onLogout: () => void; onSearch?: (query: string) => void }> = ({
  children,
  user,
  onLogout,
  onSearch,
}) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar user={user} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={user ? { name: user.name, email: user.email, role: user.role, avatar: user.avatar } : undefined} onLogout={onLogout} onSearch={onSearch} />
        <Box sx={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    // Clear user-specific chat history and notifications based on current user
    if (user) {
      const userChatKey = `nova_chat_history_${user.id || user.email || 'default'}`;
      const userNotificationsKey = `nova_notifications_${user.id || user.email || 'default'}`;
      localStorage.removeItem(userChatKey);
      localStorage.removeItem(userNotificationsKey);
    }

    // Clear global auth data
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('nova_welcome_seen');
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement global search functionality
  };

  // Listen for storage changes (when localStorage is updated from another tab/page)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check immediately in case the storage was updated synchronously
    const checkUserState = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    };

    // Call immediately and periodically
    const interval = setInterval(checkUserState, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician' : user.role === 'guest' ? '/guest' : '/analytics'} /> : <LoginPage />}
          />

          <Route
            path="/equipment"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout} onSearch={handleSearch}>
                    <EquipmentCatalogPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <CheckoutCheckinPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/reservations"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <ReservationsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/engineer/meetings"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'lab-manager']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <EngineerMeetingRoomsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/engineer/labs"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'lab-manager']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <EngineerLabsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin', 'technician']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <ChatbotPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AnalyticsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/storage"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                requiredRoles={['engineer', 'admin']}
                userRole={user?.role}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <StorageManagementPage />
                  </MainLayout>
                }
              />
            }
          />

          {/* Root redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician' : user.role === 'guest' ? '/guest' : '/analytics') : '/login'} />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AdminDashboardPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/meetings"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <MeetingRoomsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/labs"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <LabsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <UserManagementPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AdminAnalyticsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/storage"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AdminStorageManagementPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/equipment"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AdminEquipmentPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['admin']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <AdminActivityLogPage />
                  </MainLayout>
                }
              />
            }
          />

          {/* Technician Routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['technician']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <TechnicianDashboardPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/technician/history"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['technician']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <TechnicianHistoryPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/technician/parts"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['technician']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <TechnicianPartsPage />
                  </MainLayout>
                }
              />
            }
          />

          {/* Guest Routes */}
          <Route
            path="/guest"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['guest']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <GuestDashboardPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/guest/equipment"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['guest']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <GuestEquipmentPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/guest/meetings"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['guest']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <GuestRoomsPage />
                  </MainLayout>
                }
              />
            }
          />

          <Route
            path="/guest/labs"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                userRole={user?.role}
                requiredRoles={['guest']}
                element={
                  <MainLayout user={user} onLogout={handleLogout}>
                    <GuestLabsPage />
                  </MainLayout>
                }
              />
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician' : user.role === 'guest' ? '/guest' : '/analytics') : '/login'} />}
          />
        </Routes>

        {/* Nova AI Chat Widget - Appears on all pages */}
        <NovaChat />
      </Router>
    </ThemeProvider>
  );
};

export default App;
