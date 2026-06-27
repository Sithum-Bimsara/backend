import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { ILockResponse, IAccommodationLockResponse } from '../features/Deals/types/deals.types';

// ─── Types ───
interface LockedDeal {
  lock: ILockResponse | IAccommodationLockResponse;
  dealTitle: string | null;
  dealImage: string | null;
  isAccommodation?: boolean;
}

interface SelectedExclusion {
  id: string;
  description: string;
  additionalPrice: number;
}

interface BookingAddOns {
  selectedExclusions: SelectedExclusion[];
  addOnTotal: number;
}

const LOCKED_DEAL_STORAGE_KEY = 'beyond-isla.locked-deal';
const BOOKING_ADDONS_STORAGE_KEY = 'beyond-isla.booking-addons';
const EMPTY_ADDONS: BookingAddOns = { selectedExclusions: [], addOnTotal: 0 };

const isLockExpired = (lock: ILockResponse | IAccommodationLockResponse | null | undefined): boolean => {
  const expiresAt = lock?.expiresAt;
  if (!expiresAt) return true;
  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) return true;
  return expiryTime <= Date.now();
};

const clearPersistedBookingFlow = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LOCKED_DEAL_STORAGE_KEY);
  window.sessionStorage.removeItem(BOOKING_ADDONS_STORAGE_KEY);
};

const readLockedDealFromStorage = (): LockedDeal | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(LOCKED_DEAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockedDeal;
    if (!parsed?.lock || isLockExpired(parsed.lock)) {
      clearPersistedBookingFlow();
      return null;
    }
    return parsed;
  } catch {
    clearPersistedBookingFlow();
    return null;
  }
};

const readBookingAddOnsFromStorage = (): BookingAddOns => {
  if (typeof window === 'undefined') return EMPTY_ADDONS;
  try {
    const raw = window.sessionStorage.getItem(BOOKING_ADDONS_STORAGE_KEY);
    if (!raw) return EMPTY_ADDONS;
    const parsed = JSON.parse(raw) as BookingAddOns;
    if (!Array.isArray(parsed.selectedExclusions) || typeof parsed.addOnTotal !== 'number') {
      return EMPTY_ADDONS;
    }
    return parsed;
  } catch {
    return EMPTY_ADDONS;
  }
};

interface LockedDealContextType {
  lockedDeal: LockedDeal | null;
  bookingAddOns: BookingAddOns;
  setLockedDealFromLock: (lock: ILockResponse, dealTitle: string | null, dealImage: string | null) => void;
  setLockedAccommodationFromLock: (lock: IAccommodationLockResponse, propertyName: string | null, propertyImage: string | null) => void;
  setBookingAddOns: (addOns: BookingAddOns) => void;
  handleCompleteBooking: () => void;
  handlePaymentSuccess: () => void;
  handleGoDeal: () => void;
  clearLockedDeal: () => void;
  refreshLockedDeal: () => Promise<void>;
}

// ─── Context ───
const LockedDealContext = createContext<LockedDealContextType | null>(null);

// ─── Provider ───
export const LockedDealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [lockedDeal, setLockedDeal] = useState<LockedDeal | null>(() => readLockedDealFromStorage());
  const [bookingAddOns, setBookingAddOns] = useState<BookingAddOns>(() => readBookingAddOnsFromStorage());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lockedDeal) {
      window.sessionStorage.setItem(LOCKED_DEAL_STORAGE_KEY, JSON.stringify(lockedDeal));
    } else {
      window.sessionStorage.removeItem(LOCKED_DEAL_STORAGE_KEY);
    }
  }, [lockedDeal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(BOOKING_ADDONS_STORAGE_KEY, JSON.stringify(bookingAddOns));
  }, [bookingAddOns]);

  const setLockedDealFromLock = useCallback((lock: ILockResponse, dealTitle: string | null, dealImage: string | null) => {
    setLockedDeal({ lock, dealTitle, dealImage, isAccommodation: false });
    setBookingAddOns(EMPTY_ADDONS);
  }, []);

  const setLockedAccommodationFromLock = useCallback((lock: IAccommodationLockResponse, propertyName: string | null, propertyImage: string | null) => {
    setLockedDeal({ lock, dealTitle: propertyName, dealImage: propertyImage, isAccommodation: true });
    setBookingAddOns(EMPTY_ADDONS);
  }, []);

  const updateBookingAddOns = useCallback((addOns: BookingAddOns) => {
    setBookingAddOns(addOns);
  }, []);

  const handleCompleteBooking = useCallback(() => {
    navigate('/booking-add-ons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handlePaymentSuccess = useCallback(() => {
    setLockedDeal(null);
    setBookingAddOns(EMPTY_ADDONS);
    navigate('/bookings');
  }, [navigate]);

  const handleGoDeal = useCallback(() => {
    setLockedDeal(null);
    setBookingAddOns(EMPTY_ADDONS);
    navigate('/my-deals');
  }, [navigate]);

  const clearLockedDeal = useCallback(() => {
    setLockedDeal(null);
    setBookingAddOns(EMPTY_ADDONS);
  }, []);

  const refreshLockedDeal = useCallback(async () => {
    if (!lockedDeal?.lock?.id) return;
    try {
      // Lock refresh uses the new module-specific endpoints:
      // Deal locks → /api/deals/lock/:id
      // Accommodation locks → /api/accommodation/lock/:id
      const endpoint = lockedDeal.isAccommodation 
        ? `/accommodation/lock/${lockedDeal.lock.id}`
        : `/deals/lock/${lockedDeal.lock.id}`;
      
      const res = await api.get(endpoint);
      if (res.data?.data) {
        setLockedDeal(prev => prev ? { ...prev, lock: res.data.data } : null);
      }
    } catch (err) {
      console.error("Failed to refresh locked deal:", err);
    }
  }, [lockedDeal]);

  return (
    <LockedDealContext.Provider
      value={{
        lockedDeal,
        bookingAddOns,
        setLockedDealFromLock,
        setLockedAccommodationFromLock,
        setBookingAddOns: updateBookingAddOns,
        handleCompleteBooking,
        handlePaymentSuccess,
        handleGoDeal,
        clearLockedDeal,
        refreshLockedDeal,
      }}
    >
      {children}
    </LockedDealContext.Provider>
  );
};

// ─── Hook ───
// eslint-disable-next-line react-refresh/only-export-components
export const useLockedDeal = (): LockedDealContextType => {
  const context = useContext(LockedDealContext);
  if (!context) {
    throw new Error('useLockedDeal must be used within a LockedDealProvider');
  }
  return context;
};
