
import { Calendar, Home, Users, Settings, LogOut, PlusCircle } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "attendees", label: "Attendees", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-6 flex items-center space-x-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Calendar className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900">EventFlow</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={clsx(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
              activeTab === item.id
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className={clsx("w-5 h-5", activeTab === item.id ? "text-indigo-600" : "text-gray-400")} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
         <button className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 shadow-sm font-medium">
          <PlusCircle className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      <div className="p-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
