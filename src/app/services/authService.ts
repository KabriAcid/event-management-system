export type UserRole = "organizer" | "attendee";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface StoredMockUser extends AuthUser {
  password: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

interface LoginInput {
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const SESSION_STORAGE_KEY = "eventflow.mock.auth.session";
const USER_STORAGE_KEY = "eventflow.mock.auth.users";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_USERS: StoredMockUser[] = [
  {
    id: "u-org-001",
    name: "Event Organizer",
    email: "organizer@eventflow.demo",
    password: "demo123",
    role: "organizer",
  },
  {
    id: "u-att-001",
    name: "Happy Attendee",
    email: "attendee@eventflow.demo",
    password: "demo123",
    role: "attendee",
  },
];

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readCustomUsers = (): StoredMockUser[] => {
  return safeJsonParse<StoredMockUser[]>(
    localStorage.getItem(USER_STORAGE_KEY),
    [],
  );
};

const writeCustomUsers = (users: StoredMockUser[]) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

const readSession = (): AuthSession | null => {
  return safeJsonParse<AuthSession | null>(
    localStorage.getItem(SESSION_STORAGE_KEY),
    null,
  );
};

const writeSession = (session: AuthSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const toPublicUser = (user: StoredMockUser): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const allUsers = (): StoredMockUser[] => {
  return [...DEFAULT_USERS, ...readCustomUsers()];
};

const createSession = (user: AuthUser): AuthSession => {
  const session: AuthSession = {
    token: `mock_${Math.random().toString(36).slice(2)}`,
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  writeSession(session);
  return session;
};

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    await delay(800);

    const email = input.email.trim().toLowerCase();
    const user = allUsers().find(
      (candidate) =>
        candidate.email.toLowerCase() === email &&
        candidate.password === input.password &&
        candidate.role === input.role,
    );

    if (!user) {
      throw new Error("Invalid credentials for selected role.");
    }

    return createSession(toPublicUser(user));
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    await delay(900);

    const email = input.email.trim().toLowerCase();
    const users = allUsers();
    const existing = users.find(
      (candidate) => candidate.email.toLowerCase() === email,
    );

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: StoredMockUser = {
      id: `u-custom-${Date.now()}`,
      name: input.name.trim(),
      email,
      password: input.password,
      role: input.role,
    };

    const customUsers = readCustomUsers();
    writeCustomUsers([...customUsers, newUser]);

    return createSession(toPublicUser(newUser));
  },

  getCurrentSession(): AuthSession | null {
    const session = readSession();

    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      this.logout();
      return null;
    }

    return session;
  },

  logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
