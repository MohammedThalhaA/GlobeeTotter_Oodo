import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import TripEdit from './pages/TripEdit';
import TripBudget from './pages/TripBudget';
import TripCalendar from './pages/TripCalendar';
import CitySearch from './pages/CitySearch';
import CityDetail from './pages/CityDetail';
import PublicTrip from './pages/PublicTrip';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SidebarLayout from './layouts/SidebarLayout';
import { Loader2 } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route wrapper (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

// Sidebar Layout for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarLayout>
            {children}
        </SidebarLayout>
    );
};

// Layout with Navbar (legacy/public)
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <main>{children}</main>
        </div>
    );
};

// Auth Layout (no navbar)
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <AuthLayout>
                            <Auth />
                        </AuthLayout>
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <AuthLayout>
                            <Auth />
                        </AuthLayout>
                    </PublicRoute>
                }
            />
            <Route
                path="/admin/login"
                element={
                    <AuthLayout>
                        <AdminLogin />
                    </AuthLayout>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <AuthLayout>
                        <ForgotPassword />
                    </AuthLayout>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <AuthLayout>
                        <ResetPassword />
                    </AuthLayout>
                }
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <Dashboard />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <MyTrips />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips/create"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <CreateTrip />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips/:id"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <TripDetail />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips/:id/edit"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <TripEdit />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/explore"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <CitySearch />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cities/:id"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <CityDetail />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips/:id/budget"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <TripBudget />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trips/:id/calendar"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <TripCalendar />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <Profile />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />

            {/* Public Trip View (no auth required) */}
            <Route path="/share/:id" element={<PublicTrip />} />

            {/* Admin Dashboard */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AdminDashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Fallback */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
                            <p className="text-slate-500 mb-4">Page not found</p>
                            <a href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
                                Go to Dashboard
                            </a>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
