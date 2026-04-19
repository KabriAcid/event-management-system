import { type ReactElement, useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EventList } from "./components/EventList";
import { Attendees } from "./components/Attendees";
import { Settings } from "./components/Settings";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { AttendeeDashboard } from "./components/AttendeeDashboard";
import { CreateEventPage } from "./components/CreateEventPage";
import { Menu, Calendar } from "lucide-react";
import { Toaster } from "sonner";
import { authService, type AuthUser } from "./services/authService";

type OrganizerTab = "dashboard" | "events" | "attendees" | "settings";

const defaultPathByRole: Record<AuthUser["role"], string> = {
  organizer: "/organizer/dashboard",
  attendee: "/attendee/discover",
};

function getOrganizerTab(pathname: string): OrganizerTab {
  if (pathname.includes("/events")) {
    return "events";
  }

  if (pathname.includes("/attendees")) {
    return "attendees";
  }

  if (pathname.includes("/settings")) {
    return "settings";
  }

  return "dashboard";
}

function ProtectedRoute({
  user,
  role,
  isAuthReady,
  children,
}: {
  user: AuthUser | null;
  role: AuthUser["role"];
  isAuthReady: boolean;
  children: ReactElement;
}) {
  if (!isAuthReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  return children;
}

function OrganizerLayout({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const activeTab = getOrganizerTab(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-10 shadow-sm">
        <Sidebar
          activeTab={activeTab}
          onNavigate={() => setIsMobileMenuOpen(false)}
          onLogout={onLogout}
        />
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">EventFlow</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-300">
            <Sidebar
              activeTab={activeTab}
              onNavigate={() => setIsMobileMenuOpen(false)}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                Welcome, {user.name}
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AttendeeRouteView({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.endsWith("/tickets")
    ? "tickets"
    : "discover";

  return (
    <AttendeeDashboard
      user={user}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={(tab) => navigate(`/attendee/${tab}`)}
    />
  );
}

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = authService.getCurrentSession();

    if (session?.user) {
      setUser(session.user);
    }

    setIsAuthReady(true);
  }, []);

  const handleLogin = (nextUser: AuthUser) => {
    setUser(nextUser);
    navigate(defaultPathByRole[nextUser.role], { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onGetStarted={() => navigate("/auth")}
              onLogin={() => navigate("/auth")}
            />
          }
        />
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to={defaultPathByRole[user.role]} replace />
            ) : (
              <AuthPage onLogin={handleLogin} onBack={() => navigate("/")} />
            )
          }
        />

        <Route
          path="/organizer"
          element={
            <ProtectedRoute
              user={user}
              role="organizer"
              isAuthReady={isAuthReady}
            >
              <OrganizerLayout
                user={user as AuthUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="attendees" element={<Attendees />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/attendee"
          element={<Navigate to="/attendee/discover" replace />}
        />
        <Route
          path="/attendee/discover"
          element={
            <ProtectedRoute
              user={user}
              role="attendee"
              isAuthReady={isAuthReady}
            >
              <AttendeeRouteView
                user={user as AuthUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/tickets"
          element={
            <ProtectedRoute
              user={user}
              role="attendee"
              isAuthReady={isAuthReady}
            >
              <AttendeeRouteView
                user={user as AuthUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            user ? (
              <Navigate to={defaultPathByRole[user.role]} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}
