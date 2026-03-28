
import { User, Bell, Shield, CreditCard, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Settings() {
  const [activeSection, setActiveSection] = useState('Profile');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and system settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          {['Profile', 'Notifications', 'Security', 'Billing'].map((item) => (
            <button 
              key={item} 
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item === activeSection ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeSection === 'Profile' && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" defaultValue="User" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" defaultValue="admin@eventflow.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                   <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tell us about yourself..." />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-gray-400" />
                Notifications
              </h2>
              <div className="space-y-3">
                {['Email me when someone registers', 'Email me when an event is sold out', 'Weekly digest', 'Marketing emails'].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <input id={`notif-${i}`} type="checkbox" defaultChecked={i === 0} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <label htmlFor={`notif-${i}`} className="ml-2 text-sm text-gray-600 cursor-pointer">{item}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for other sections */}
          {(activeSection !== 'Profile' && activeSection !== 'Notifications') && (
            <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center animate-in fade-in">
               <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900">{activeSection} Settings</h3>
               <p className="text-gray-500 mt-2">This section is currently under development.</p>
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
