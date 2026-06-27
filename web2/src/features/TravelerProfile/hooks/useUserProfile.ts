import axios from 'axios';
import { useState, useEffect } from 'react';
import * as api from '../api/user-profile.api';
import type { IUserProfile, IUpdateUserProfileDTO } from '../types/user-profile.types';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.getMyProfile();
      setProfile(p);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : (err instanceof Error ? err.message : null);
      setError(msg || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: IUpdateUserProfileDTO) => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.updateProfile(data);
      setProfile(p);
      return p;
    } catch (err: unknown) {
      const msg = (axios.isAxiosError(err) ? err.response?.data?.message : (err instanceof Error ? err.message : null)) || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyPhone(phone);
      return res;
    } catch (err: unknown) {
      const msg = (axios.isAxiosError(err) ? err.response?.data?.message : (err instanceof Error ? err.message : null)) || 'Failed to verify phone';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile, verifyPhone };
};
