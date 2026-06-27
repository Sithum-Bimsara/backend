import { useState } from "react";

import {
  loginUser,
  registerUser,
  registerMerchant,
  addRole,
  logoutUser,
} from "../api/auth.api";

import type {
  LoginDto,
  RegisterUserDto,
  RegisterMerchantDto,
  AddRoleDto,
} from "../dtos/auth.dto";

import type {
  ILoginResponse,
  IUserRegisterResponse,
  IMerchantRegisterResponse,
  IAddRoleResponse,
} from "../types/auth.types";

//////////////////////////////////////////////////////
// LOGIN HOOK
//////////////////////////////////////////////////////

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginDto): Promise<ILoginResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await loginUser(data);

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};

//////////////////////////////////////////////////////
// REGISTER USER HOOK
//////////////////////////////////////////////////////

export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (
    data: RegisterUserDto
  ): Promise<IUserRegisterResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await registerUser(data);

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
};

//////////////////////////////////////////////////////
// REGISTER MERCHANT HOOK
//////////////////////////////////////////////////////

export const useRegisterMerchant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (
    data: RegisterMerchantDto
  ): Promise<IMerchantRegisterResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await registerMerchant(data);

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Merchant registration failed");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
};

//////////////////////////////////////////////////////
// ADD ROLE HOOK
//////////////////////////////////////////////////////

export const useAddRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewRole = async (
    data: AddRoleDto
  ): Promise<IAddRoleResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await addRole(data);

      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add role");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    addNewRole,
    loading,
    error,
  };
};
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Logout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
    error,
  };
};
