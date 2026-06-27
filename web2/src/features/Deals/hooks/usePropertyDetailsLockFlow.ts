import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { IPropertyDetail } from '../types/deals.types';
import { lockAccommodation } from '../api/deals.api';
import { useLockedDeal } from '../../../context/locked-deal.context';
import { AuthContext } from '../../../context/auth.context';

export interface SelectedAccommodationRange {
  checkIn: string | null;
  checkOut: string | null;
}

const LOCK_ERROR_CODES = ['SELF_LOCK_RESTRICTED', 'DAILY_LOCK_LIMIT_EXCEEDED', 'SUSPENDED_ACCOUNT', 'NOT_TRAVELLER'] as const;

export const usePropertyDetailsLockFlow = (property: IPropertyDetail | null) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setLockedAccommodationFromLock } = useLockedDeal();

  const [isLocking, setIsLocking] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectedAccommodationRange>({
    checkIn: null,
    checkOut: null,
  });

  const resetLockError = () => {
    setErrorCode(null);
    setErrorStatus(null);
  };

  const handleDateClick = (date: string, availableRooms: number) => {
    setSelectedRange((prev) => {
      if (!prev.checkIn || new Date(date) < new Date(prev.checkIn)) {
        if (availableRooms <= 0) {
          toast.error('This date is sold out for check-in');
          return prev;
        }
        return { checkIn: date, checkOut: null };
      }

      if (!prev.checkOut) {
        if (date === prev.checkIn) return prev;
        return { ...prev, checkOut: date };
      }

      if (availableRooms <= 0) {
        toast.error('This date is sold out for check-in');
        return prev;
      }

      return { checkIn: date, checkOut: null };
    });
  };

  const handleBook = async (unitId: string, _unitName: string, quantity: number) => {
    if (!user) {
      setErrorStatus(401);
      return;
    }

    if (!property) return;

    if (!selectedRange.checkIn || !selectedRange.checkOut) {
      setShowDateError(true);
      setIsCalendarOpen(true);
      toast.error('Please select your stay dates first', {
        style: {
          background: '#fff',
          color: '#0e2a47',
          fontWeight: 'bold',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
        },
      });
      return;
    }

    try {
      setIsLocking(true);
      resetLockError();

      const lock = await lockAccommodation({
        propertyId: property.id,
        unitId,
        checkInDate: selectedRange.checkIn,
        checkOutDate: selectedRange.checkOut,
        quantity,
      });

      setLockedAccommodationFromLock(lock, property.name, property.images[0]?.url || null);
      navigate('/deal-locked-success');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to lock room';
      const code = err.response?.data?.message || err.response?.data?.code || err.message || null;
      const status = err.response?.status || null;

      setErrorCode(code);
      setErrorStatus(status);

      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        setIsPhoneModalOpen(true);
      } else if (!code || !LOCK_ERROR_CODES.includes(code as typeof LOCK_ERROR_CODES[number])) {
        toast.error(msg);
      }
    } finally {
      setIsLocking(false);
    }
  };

  return {
    selectedRange,
    setSelectedRange,
    handleDateClick,
    handleBook,
    isLocking,
    errorCode,
    errorStatus,
    isPhoneModalOpen,
    setIsPhoneModalOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    showDateError,
    setShowDateError,
    resetLockError,
  };
};
