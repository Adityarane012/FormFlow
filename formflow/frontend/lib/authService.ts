import bcrypt from "bcryptjs";
import * as mockDb from "./mockDatabase";

const SESSION_KEY = "formflow_session";

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export const registerUser = async (name: string, email: string, password: string): Promise<UserSession> => {
  const existing = mockDb.findUserByEmail(email);
  if (existing) {
    throw new Error("User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = mockDb.saveUser({
    name,
    email,
    passwordHash,
  });

  const session: UserSession = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
};

export const loginUser = async (email: string, password: string): Promise<UserSession> => {
  const user = mockDb.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const session: UserSession = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getCurrentUser = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};
