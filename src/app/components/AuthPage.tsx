// app/components/AuthPage.tsx

import { useState } from "react";
import {
  User,
  Calendar,
  ArrowLeft,
  Mail,
  Lock,
  UserCircle,
  Briefcase,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import {
  authService,
  AuthServiceError,
  type AuthUser,
  type UserRole,
} from "../services/authService";
import { attendeeService } from "../services/attendeeService";

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("attendee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const suggestRoleFromEmail = (nextEmail: string) => {
    if (!isLogin) {
      return;
    }

    const detectedRole = authService.getAccountRoleByEmail(nextEmail);

    if (detectedRole && detectedRole !== role) {
      setRole(detectedRole);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for registration
    if (!isLogin) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (name.trim().length < 2) {
        toast.error("Please enter your full name.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const session = await authService.login({ email, password, role });
        toast.success(`Welcome back, ${session.user.name}!`);
        onLogin(session.user);
      } else {
        const session = await authService.register({
          name: name.trim(),
          email,
          password,
          role,
        });
        
        toast.success(`Account created successfully! Welcome, ${session.user.name}!`);
        onLogin(session.user);
      }
    } catch (error) {
      let message =
        error instanceof Error
          ? error.message
          : "Unable to authenticate. Please try again.";

      if (error instanceof AuthServiceError && error.code === "ROLE_MISMATCH") {
        const expectedRole = error.data?.expectedRole as UserRole | undefined;

        if (expectedRole) {
          setRole(expectedRole);
          message = `${error.message} Switched role to ${expectedRole}.`;
        }
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    // Reset form when switching modes
    setRole("attendee");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="text-white w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Join thousands of event lovers in Nigeria
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          {/* Role Selection - Show for both login and registration */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setRole("attendee")}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  role === "attendee"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <UserCircle className={clsx(
                  "w-6 h-6",
                  role === "attendee" ? "text-indigo-600" : "text-gray-400"
                )} />
                <span className={clsx(
                  "text-sm font-medium",
                  role === "attendee" ? "text-indigo-700" : "text-gray-600"
                )}>
                  Attendee
                </span>
                <span className="text-xs text-gray-400">Discover & buy tickets</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  role === "organizer"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <Briefcase className={clsx(
                  "w-6 h-6",
                  role === "organizer" ? "text-indigo-600" : "text-gray-400"
                )} />
                <span className={clsx(
                  "text-sm font-medium",
                  role === "organizer" ? "text-indigo-700" : "text-gray-600"
                )}>
                  Organizer
                </span>
                <span className="text-xs text-gray-400">Create & manage events</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Registration-only fields */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Your full name as it will appear on tickets</p>
              </div>
            )}

            {/* Email field - common */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    const nextEmail = e.target.value;
                    setEmail(nextEmail);
                    suggestRoleFromEmail(nextEmail);
                  }}
                />
              </div>
            </div>

            {/* Password fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>
              )}
            </div>

            {/* Confirm password - registration only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create free account"
                )}
              </button>
            </div>
          </form>

          {/* Role benefits section for registration */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">As a {role === "attendee" ? "attendee" : "organizer"}, you'll get:</p>
              <div className="space-y-1.5">
                {role === "attendee" ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Access to exclusive events and early bird tickets
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Secure ticket storage and QR codes
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Event reminders and calendar integration
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Create and manage unlimited events
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Real-time ticket sales analytics
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Export attendee data and insights
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Switch between Login and Sign Up - Now at the bottom */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={switchMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {isLogin ? "Sign up for free" : "Sign in instead"}
              </button>
            </p>
          </div>

          {/* Back button */}
          <div className="mt-4">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}