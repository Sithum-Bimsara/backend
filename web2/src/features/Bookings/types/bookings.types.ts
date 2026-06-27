export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface IBooking {
  id: string;
  packageTitle: string;
  location: string;
  merchantName: string;
  imageUrl: string;
  checkIn: string;      // ISO date string
  checkOut: string;      // ISO date string
  guests: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  bookingReference: string;
  tags: string[];        // e.g. ["Stay", "Activities", "Transfers"]
  rating?: number;
  durationNights: number;
  durationDays: number;
}
