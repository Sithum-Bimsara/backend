import axios from 'axios';
import { useState } from 'react';
import { lockDeal } from '../api/deals.api';
import type { ILockResponse } from '../types/deals.types';

interface UseLockDealReturn {
  lock: ILockResponse | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  errorStatus: number | null;
  executeLock: (variantId: string, quantity: number) => Promise<ILockResponse | null>;
  reset: () => void;
}

export const useLockDeal = (): UseLockDealReturn => {
  const [lock, setLock] = useState<ILockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const executeLock = async (variantId: string, quantity: number): Promise<ILockResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      setErrorStatus(null);
      const data = await lockDeal({ variantId, quantity });
      setLock(data);
      return data;
    } catch (err: unknown) {
      let msg = 'Failed to lock deal';
      let code = null;
      let status = null;

      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error || err.response?.data?.message || err.message || msg;
        code = err.response?.data?.message || err.response?.data?.code || null;
        status = err.response?.status || null;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
      setErrorCode(code);
      setErrorStatus(status);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLock(null);
    setError(null);
    setErrorCode(null);
    setErrorStatus(null);
    setLoading(false);
  };

  return { lock, loading, error, errorCode, errorStatus, executeLock, reset };
};
