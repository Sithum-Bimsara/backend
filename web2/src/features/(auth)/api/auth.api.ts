import { api } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";

import type {
  LoginDto,
  RegisterUserDto,
  RegisterMerchantDto,
  RegisterUserApiDto,
  RegisterMerchantApiDto,
  AddRoleDto,
} from "../dtos/auth.dto";

import type {
  ILoginResponse,
  IUserRegisterResponse,
  IMerchantRegisterResponse,
  IAddRoleResponse,
  IGetMeResponse,
} from "../types/auth.types";

//////////////////////////////////////////////////////
// SUPABASE LOGIN
//////////////////////////////////////////////////////

const signInWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  if (!data.session) {
    throw new Error("No session returned");
  }

  return data.session.access_token;
};

//////////////////////////////////////////////////////
// SUPABASE SIGNUP
//////////////////////////////////////////////////////

const signUpWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  if (!data.user) {
    throw new Error("User creation failed");
  }

  return data.user.id;
};

//////////////////////////////////////////////////////
// SUPABASE GOOGLE SIGN-IN
//////////////////////////////////////////////////////

export const signInWithGoogle = async (intent: 'login' | 'register_user' | 'register_merchant') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?intent=${intent}`
    }
  });

  if (error) throw new Error(error.message);
  // Function automatically redirects to Google, no return value needed
};

//////////////////////////////////////////////////////
// CHECK IF USER EXISTS IN SUPABASE
// Try to sign in — if it works, user exists
//////////////////////////////////////////////////////

const checkSupabaseUserExists = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
};

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

export const loginUser = async (data: LoginDto): Promise<ILoginResponse> => {
  const token = await signInWithSupabase(data.email, data.password);

  const res = await api.post("/auth/login", {
    token,
  });

  return res.data;
};

//////////////////////////////////////////////////////
// REGISTER USER
// 1. Try sign-in first (handles cross-registration)
// 2. If not exists, sign up with Supabase
// 3. Send to backend
//////////////////////////////////////////////////////

export const registerUser = async (
  data: RegisterUserDto
): Promise<IUserRegisterResponse> => {

  // Check if user already exists in Supabase (cross-registration)
  const existingId = await checkSupabaseUserExists(data.email, data.password);

  let supabaseUserId: string;

  if (existingId) {
    // User already in Supabase — just register as traveller in our DB
    supabaseUserId = existingId;
  } else {
    // New user — sign up with Supabase
    supabaseUserId = await signUpWithSupabase(data.email, data.password);
  }

  const { password: _password, ...rest } = data;

  const payload: RegisterUserApiDto = {
    ...rest,
    supabaseUserId,
  };

  const res = await api.post("/auth/register/user", payload);

  return res.data;
};

//////////////////////////////////////////////////////
// REGISTER MERCHANT
// 1. Try sign-in first (handles cross-registration)
// 2. If not exists, sign up with Supabase
// 3. Send to backend — no business fields
//////////////////////////////////////////////////////

export const registerMerchant = async (
  data: RegisterMerchantDto
): Promise<IMerchantRegisterResponse> => {

  // Check if user already exists in Supabase (cross-registration)
  const existingId = await checkSupabaseUserExists(data.email, data.password);

  let supabaseUserId: string;

  if (existingId) {
    // User already in Supabase — just register as merchant in our DB
    supabaseUserId = existingId;
  } else {
    // New user — sign up with Supabase
    supabaseUserId = await signUpWithSupabase(data.email, data.password);
  }

  const { password: _password, ...rest } = data;

  const payload: RegisterMerchantApiDto = {
    ...rest,
    supabaseUserId,
  };

  const res = await api.post("/auth/register/merchant", payload);

  return res.data;
};

//////////////////////////////////////////////////////
// ADD ROLE (Protected — for logged-in users)
//////////////////////////////////////////////////////

export const addRole = async (
  data: AddRoleDto
): Promise<IAddRoleResponse> => {
  const res = await api.post("/auth/add-role", data);
  return res.data;
};

//////////////////////////////////////////////////////
// GET ME
//////////////////////////////////////////////////////

export const getMe = async (): Promise<IGetMeResponse> => {
  const res = await api.get("/auth/me");
  return res.data;
};

//////////////////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////////////////

export const logoutUser = async () => {
  try {
    // 1. Clear backend HttpOnly cookies
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Backend logout failed:", error);
  }

  // 2. Clear Supabase session
  const { error: supabaseError } = await supabase.auth.signOut();
  if (supabaseError) {
    console.error("Supabase sign out error:", supabaseError.message);
  }

  // 3. Specifically clear relevant auth cookies
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      // Clear Supabase-managed cookies and our own backend auth cookies
      // Targets: access_token, csrf_token, and sb- prefixed cookies
      if (name.startsWith("sb-") || name === "access_token" || name === "csrf_token") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
      }
    }
  }

  // 4. Selective storage cleanup (Supabase tokens only)
  // Targets: sb-<project-id>-auth-token as seen in DevTools
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sb-") || key.includes("supabase")) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("sb-") || key.includes("supabase")) {
      sessionStorage.removeItem(key);
    }
  });
};
