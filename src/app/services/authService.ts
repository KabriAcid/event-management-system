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

export type AuthErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "ROLE_MISMATCH"
  | "ACCOUNT_EXISTS";

export class AuthServiceError extends Error {
  code: AuthErrorCode;
  data?: Record<string, string>;

  constructor(
    code: AuthErrorCode,
    message: string,
    data?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthServiceError";
    this.code = code;
    this.data = data;
  }
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
const PASSWORD_OVERRIDE_STORAGE_KEY = "eventflow.mock.auth.password.overrides";
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

const readPasswordOverrides = (): Record<string, string> => {
  return safeJsonParse<Record<string, string>>(
    localStorage.getItem(PASSWORD_OVERRIDE_STORAGE_KEY),
    {},
  );
};

const writePasswordOverrides = (overrides: Record<string, string>) => {
  localStorage.setItem(
    PASSWORD_OVERRIDE_STORAGE_KEY,
    JSON.stringify(overrides),
  );
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

const resolvePassword = (user: StoredMockUser): string => {
  const overrides = readPasswordOverrides();
  const normalizedEmail = user.email.toLowerCase();
  return overrides[normalizedEmail] ?? user.password;
};

const isDefaultUser = (user: StoredMockUser): boolean => {
  return DEFAULT_USERS.some(
    (defaultUser) =>
      defaultUser.email.toLowerCase() === user.email.toLowerCase(),
  );
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
    const userByEmail = allUsers().find(
      (candidate) => candidate.email.toLowerCase() === email,
    );

    if (!userByEmail) {
      throw new AuthServiceError(
        "ACCOUNT_NOT_FOUND",
        "No account found for this email.",
      );
    }

    if (resolvePassword(userByEmail) !== input.password) {
      throw new AuthServiceError("INVALID_PASSWORD", "Incorrect password.");
    }

    if (userByEmail.role !== input.role) {
      throw new AuthServiceError(
        "ROLE_MISMATCH",
        `This account is registered as ${userByEmail.role}.`,
        { expectedRole: userByEmail.role },
      );
    }

    return createSession(toPublicUser(userByEmail));
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    await delay(900);

    const email = input.email.trim().toLowerCase();
    const users = allUsers();
    const existing = users.find(
      (candidate) => candidate.email.toLowerCase() === email,
    );

    if (existing) {
      throw new AuthServiceError(
        "ACCOUNT_EXISTS",
        "An account with this email already exists.",
      );
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

  getAccountRoleByEmail(email: string): UserRole | null {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return null;
    }

    const user = allUsers().find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    return user?.role ?? null;
  },

  updateCurrentUserPassword(
    currentPassword: string,
    newPassword: string,
  ): void {
    const session = readSession();

    if (!session?.user?.email) {
      throw new AuthServiceError(
        "ACCOUNT_NOT_FOUND",
        "No active session found.",
      );
    }

    const normalizedEmail = session.user.email.toLowerCase();
    const user = allUsers().find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    if (!user) {
      throw new AuthServiceError(
        "ACCOUNT_NOT_FOUND",
        "Could not locate this account.",
      );
    }

    if (resolvePassword(user) !== currentPassword) {
      throw new AuthServiceError(
        "INVALID_PASSWORD",
        "Current password is incorrect.",
      );
    }

    if (isDefaultUser(user)) {
      const overrides = readPasswordOverrides();
      overrides[normalizedEmail] = newPassword;
      writePasswordOverrides(overrides);
      return;
    }

    const customUsers = readCustomUsers();
    const index = customUsers.findIndex(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    if (index < 0) {
      throw new AuthServiceError(
        "ACCOUNT_NOT_FOUND",
        "Could not update password for this account.",
      );
    }

    const nextUsers = [...customUsers];
    nextUsers[index] = { ...nextUsers[index], password: newPassword };
    writeCustomUsers(nextUsers);
  },
};
