
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EventList } from "./components/EventList";
import { Attendees } from "./components/Attendees";
import { Settings } from "./components/Settings";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { AttendeeDashboard } from "./components/AttendeeDashboard";
import { Menu, Calendar } from "lucide-react";
import { Toaster } from "sonner";

type UserRole = 'organizer' | 'attendee';

interface User {
  name: string;
  role: UserRole;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [user, setUser] = useState<User | null>(null);
  
  // Organizer State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (role: UserRole, name: string) => {
    setUser({ name, role });
    setView('app');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setActiveTab("dashboard");
  };

  const renderOrganizerContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "events": return <EventList />;
      case "attendees": return <Attendees />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  const renderContent = () => {
    if (view === 'landing') {
      return <LandingPage onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} />;
    }

    if (view === 'auth') {
      return <AuthPage onLogin={handleLogin} onBack={() => setView('landing')} />;
    }

    if (user?.role === 'attendee') {
      return <AttendeeDashboard user={user} onLogout={handleLogout} />;
    }

    // Organizer View
    return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-10 shadow-sm">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">EventFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-300">
               <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} onLogout={handleLogout} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header for Organizer Dashboard to show user info/logout */}
            <div className="flex justify-end mb-6">
               <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">
                    Welcome, {user?.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign Out
                  </button>
               </div>
            </div>
            
            {renderOrganizerContent()}
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      {renderContent()}
    </>
  );
}
