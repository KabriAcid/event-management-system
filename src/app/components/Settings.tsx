// app/components/Settings.tsx

import {
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Lock,
  ShieldCheck,
  Clock3,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authService, AuthServiceError, type AuthUser } from "../services/authService";

type SettingsTab = "Profile" | "Security" | "Notifications" | "Billing";

const SETTINGS_STORAGE_KEY = "eventflow.mock.settings.security";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  autoLogoutMinutes: string;
}

const getInitialSecuritySettings = (): SecuritySettings => {
  const fallback: SecuritySettings = {
    twoFactorEnabled: false,
    loginAlerts: true,
    autoLogoutMinutes: "60",
  };

  try {
    const parsed = JSON.parse(
      localStorage.getItem(SETTINGS_STORAGE_KEY) || "null",
    );
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    return {
      twoFactorEnabled: Boolean(parsed.twoFactorEnabled),
      loginAlerts: Boolean(parsed.loginAlerts),
      autoLogoutMinutes:
        typeof parsed.autoLogoutMinutes === "string"
          ? parsed.autoLogoutMinutes
          : fallback.autoLogoutMinutes,
    };
  } catch {
    return fallback;
  }
};

const saveSecuritySettings = (settings: SecuritySettings) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsTab>("Profile");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
  });
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    getInitialSecuritySettings(),
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dormantTabs: SettingsTab[] = ["Notifications", "Billing"];

  // Load current user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const session = authService.getCurrentSession();
    if (session?.user) {
      setCurrentUser(session.user);
      // Load saved profile data from localStorage if exists
      const savedProfile = localStorage.getItem(`eventflow.profile.${session.user.id}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileForm({
          name: parsed.name || session.user.name,
          email: parsed.email || session.user.email,
          bio: parsed.bio || "",
        });
      } else {
        setProfileForm({
          name: session.user.name,
          email: session.user.email,
          bio: "",
        });
      }
    }
  };

  const handleTabClick = (tab: SettingsTab) => {
    setActiveSection(tab);

    if (dormantTabs.includes(tab)) {
      toast.info("Coming soon: this section is currently under development.");
    }
  };

  const handleProfileSave = () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Save profile data to localStorage
      const profileData = {
        name: profileForm.name,
        email: profileForm.email,
        bio: profileForm.bio,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`eventflow.profile.${currentUser.id}`, JSON.stringify(profileData));
      
      // Update the user's name in auth if changed
      // Note: In a real app, you'd update the auth system too
      toast.success("Profile settings saved successfully.");
      setLoading(false);
    }, 700);
  };

  const handleSecuritySave = () => {
    // Check if password change is requested
    const hasPasswordChange = passwordForm.currentPassword || 
                              passwordForm.newPassword || 
                              passwordForm.confirmPassword;
    
    if (hasPasswordChange) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error("Complete all password fields to change your password.");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New password and confirmation do not match.");
        return;
      }

      try {
        authService.updateCurrentUserPassword(
          passwordForm.currentPassword,
          passwordForm.newPassword,
        );
        saveSecuritySettings(securitySettings);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password and security preferences updated.");
      } catch (error) {
        const message = error instanceof AuthServiceError
          ? error.message
          : "Unable to update your security settings.";
        toast.error(message);
      }
    } else {
      // Just save security settings
      saveSecuritySettings(securitySettings);
      toast.success("Security preferences saved.");
    }
  };

  const handleSave = () => {
    if (activeSection === "Notifications" || activeSection === "Billing") {
      toast.info("This section is coming soon.");
      return;
    }

    if (activeSection === "Profile") {
      handleProfileSave();
    } else if (activeSection === "Security") {
      handleSecuritySave();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account preferences and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          {(
            ["Profile", "Security", "Notifications", "Billing"] as SettingsTab[]
          ).map((item) => (
            <button
              key={item}
              onClick={() => handleTabClick(item)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item === activeSection
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              } ${dormantTabs.includes(item) ? "opacity-60" : ""}`}
            >
              {item}
              {dormantTabs.includes(item) && (
                <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400">
                  coming soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          {activeSection === "Profile" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      value={currentUser.role === "organizer" ? "Event Organizer" : "Attendee"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us about yourself..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>
                <div className="pt-2 text-xs text-gray-400">
                  Member since: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "Security" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Password Change Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-gray-400" />
                  Change Password
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          placeholder="Enter new password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Password must be at least 6 characters</p>
                </div>
              </div>

              {/* Account Protection Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-gray-400" />
                  Account Protection
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <span>
                      <div className="text-sm font-medium text-gray-900">
                        Two-Factor Authentication
                      </div>
                      <div className="text-xs text-gray-500">
                        Add an extra layer of security to your account.
                      </div>
                    </span>
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <span>
                      <div className="text-sm font-medium text-gray-900">
                        Login Alerts
                      </div>
                      <div className="text-xs text-gray-500">
                        Get notified when someone logs into your account.
                      </div>
                    </span>
                    <input
                      type="checkbox"
                      checked={securitySettings.loginAlerts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          loginAlerts: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <div className="p-3 border border-gray-100 rounded-lg">
                    <label className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <Clock3 className="w-4 h-4 mr-1.5 text-gray-400" />
                      Auto Logout
                    </label>
                    <select
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={securitySettings.autoLogoutMinutes}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          autoLogoutMinutes: e.target.value,
                        })
                      }
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Session will expire after inactivity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section - Coming Soon */}
          {(activeSection === "Notifications" || activeSection === "Billing") && (
            <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center animate-in fade-in">
              {activeSection === "Notifications" ? (
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              ) : (
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {activeSection} Settings
              </h3>
              <p className="text-gray-500 mt-2 mb-4">
                This feature is coming soon!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-xs text-indigo-600">
                🚀 Under active development
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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