import { useState } from "react";
import {
  User,
  Calendar,
  ArrowLeft,
  Mail,
  Lock,
  UserCircle,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import {
  authService,
  type AuthUser,
  type UserRole,
} from "../services/authService";

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("organizer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        toast.success("Account created successfully.");
        onLogin(session.user);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to authenticate. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isLogin ? "Sign in to your account" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? "start your journey" : "sign in to existing account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setRole("organizer")}
              className={clsx(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                role === "organizer"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Organizer
            </button>
            <button
              onClick={() => setRole("attendee")}
              className={clsx(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                role === "attendee"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Attendee
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    minLength={2}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </div>
          </form>

          {isLogin && (
            <div className="mt-4 rounded-md bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-900">
              <p className="font-semibold">Demo login credentials</p>
              <p>Organizer: organizer@eventflow.demo / demo123</p>
              <p>Attendee: attendee@eventflow.demo / demo123</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-900"
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
