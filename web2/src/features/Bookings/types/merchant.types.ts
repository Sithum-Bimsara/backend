export type MerchantBookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface IMerchantBooking {
  id: string;
  guestName: string;
  guestAvatar?: string;
  packageTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: MerchantBookingStatus;
  bookingReference: string;
  bookedAt: string;
}

export interface IMerchantStats {
  activeDeals: number;
  activeDealsChange: number;
  locks: number;
  locksChange: number;
  bookings: number;
  bookingsChange: number;
  revenue: number;
  revenueChange: number;
}

export interface IRevenueDataPoint {
  month: string;
  value: number;
}
