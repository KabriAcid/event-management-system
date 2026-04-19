import {
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Lock,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authService, AuthServiceError } from "../services/authService";

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
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    getInitialSecuritySettings(),
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dormantTabs: SettingsTab[] = ["Notifications", "Billing"];

  const handleTabClick = (tab: SettingsTab) => {
    setActiveSection(tab);

    if (dormantTabs.includes(tab)) {
      toast("Coming soon: this section is currently dormant.");
    }
  };

  const handleSave = () => {
    if (activeSection === "Notifications" || activeSection === "Billing") {
      toast("This section is dormant for now.");
      return;
    }

    setLoading(true);

    if (activeSection === "Profile") {
      setTimeout(() => {
        setLoading(false);
        toast.success("Profile settings saved successfully.");
      }, 700);
      return;
    }

    if (
      !passwordForm.currentPassword &&
      !passwordForm.newPassword &&
      !passwordForm.confirmPassword
    ) {
      saveSecuritySettings(securitySettings);
      setTimeout(() => {
        setLoading(false);
        toast.success("Security preferences saved.");
      }, 600);
      return;
    }

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setLoading(false);
      toast.error("Complete all password fields to change your password.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setLoading(false);
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setLoading(false);
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
      setTimeout(() => {
        setLoading(false);
        toast.success("Password and security preferences updated.");
      }, 600);
    } catch (error) {
      setLoading(false);
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Unable to update your security settings.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account preferences and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          {(
            ["Profile", "Security", "Notifications", "Billing"] as SettingsTab[]
          ).map((item) => (
            <button
              key={item}
              onClick={() => handleTabClick(item)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                item === activeSection
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              } ${dormantTabs.includes(item) ? "opacity-70" : ""}`}
            >
              {item}
              {dormantTabs.includes(item) && (
                <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400">
                  dormant
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
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
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@eventflow.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "Security" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-gray-400" />
                  Password
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-gray-400" />
                  Account Protection
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <span>
                      <div className="text-sm font-medium text-gray-900">
                        Enable 2FA (demo)
                      </div>
                      <div className="text-xs text-gray-500">
                        Require second-step verification at login.
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

                  <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <span>
                      <div className="text-sm font-medium text-gray-900">
                        Login Alerts
                      </div>
                      <div className="text-xs text-gray-500">
                        Notify when your account signs in.
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
                    <label className="text-sm font-medium text-gray-900 flex items-center mb-1">
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSection === "Notifications" ||
            activeSection === "Billing") && (
            <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center animate-in fade-in">
              {activeSection === "Notifications" ? (
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              ) : (
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {activeSection} Settings
              </h3>
              <p className="text-gray-500 mt-2">
                This tab is intentionally dormant for now.
              </p>
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
