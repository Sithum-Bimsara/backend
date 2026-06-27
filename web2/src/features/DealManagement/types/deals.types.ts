// ─── Enums ───

export type DealVariantStatus = 'active' | 'sold_out' | 'cancelled';
export type SlotStatus = 'available' | 'booked' | 'locked' | 'cancelled';
export type RecurringType = 'once' | 'daily' | 'weekly' | 'interval';

// ─── Deal View Types ───

export interface IDealSlim {
  id: string;
  title: string;
  location: string;
  category: string;
  displayedPrice: number | null;
  dealPrice: number;
  originalPrice: number;
  primaryImageUrl: string | null;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

export interface IPaginatedDealsResponse {
  items: IDealSlim[];
  nextCursor: string | null;
  total?: number;
}

export interface IDeal {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  location: string;
  category: string;
  durationType: string | null;
  durationDays: number;
  durationHours: number | null;
  dealPrice: number;
  originalPrice: number;
  displayedPrice: number | null;
  primaryImageUrl: string | null;
  secondImageUrl: string | null;
  thirdImageUrl: string | null;
  fourthImageUrl: string | null;
  dealLockExpireTime: number;
  isLocalOnly: boolean;
  currency: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  itineraries?: IItinerary[];
  inclusions?: IInclusion[];
  exclusions?: IExclusion[];
  variants?: IDealVariant[];
  _count?: { bookings: number };
}

export interface IItinerary {
  id: string;
  dealId: string;
  dayNumber: number | null;
  title: string | null;
  description: string | null;
}

export interface IInclusion {
  id: string;
  dealId: string;
  description: string | null;
}

export interface IExclusion {
  id: string;
  dealId: string;
  description: string | null;
  additionalPrice: number | null;
}

// ─── Variant View Types ───

export interface IDealVariant {
  id: string;
  dealId: string;
  dealPrice: number | null;
  originalPrice: number | null;
  displayedPrice: number | null;
  startDatetime: string | null;
  endDatetime: string | null;
  totalSlots: number | null;
  availableSlots: number | null;
  status: DealVariantStatus;
  createdAt: string;
  updatedAt: string;
  deal?: { title: string | null; location: string | null; merchantId: string };
  bookings?: IBookingSummary[];
  locks?: ILockSummary[];
  slots?: IVariantSlot[];
  _count?: { bookings: number };
}

export interface IVariantSlot {
  id: string;
  variantId: string;
  slotNumber: number;
  status: SlotStatus;
  bookings?: IBookingSummary[];
  locks?: ILockSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ILockSummary {
  id: string;
  quantity: number | null;
  lockedPrice: number | null;
  expiresAt: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string };
  _count?: { slots: number };
}

export interface IBookingSummary {
  id: string;
  quantity: number | null;
  totalPrice: number | null;
  paymentStatus: string;
  createdAt: string;
  user: { id: string; name: string; email?: string; contactNumber?: string } | null;
  _count?: { slots: number };
}

// ─── Slot Action Response ───

export interface ISlotActionResponse {
  id: string;
  status: SlotStatus;
  variantId: string;
  slotNumber: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Bulk Generation Response ───

export interface IBulkGenerateResult {
  generatedCount: number;
  previewDates: string[];
}

export interface IBulkPreviewResult {
  dates: string[];
  conflicts: string[];
  count: number;
}

// ─── Analytics View Types ───

export interface IBookingAnalytics extends IBookingSummary {
  variant: { id: string; startDatetime: string | null };
}

export interface ILockAnalytics extends ILockSummary {
  variant: { id: string; startDatetime: string | null };
}

export interface IDealAnalytics {
  totalEarnings: number;
  bookings: IBookingAnalytics[];
  locks: ILockAnalytics[];
}

export interface IDealsBreakdown {
  dealId: string;
  title: string;
  bookingsCount: number;
  locksCount: number;
  earnings: number;
}

export interface ITimeSeriesRevenue {
  date: string;
  earnings: number;
}

export interface IMerchantAnalyticsResponse {
  overall: {
    totalEarnings: number;
    totalBookings: number;
    totalLocks: number;
  };
  dealsBreakdown: IDealsBreakdown[];
  timeSeriesRevenue: ITimeSeriesRevenue[];
}

// ─── AI Response Types ───

export interface IGenerateItineraryAIResponse {
  itineraries: { dayNumber: number; title: string; description: string }[];
}

export interface IGenerateAddOnsAIResponse {
  inclusions: { description: string }[];
  exclusions: { description: string; additionalPrice: number }[];
}

// ─── Calendar View Type ───
export interface ICalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  variants: IDealVariant[];
}

// ─── Locks & Bookings ───
export interface IAddon {
  id: string;
  name: string;
  price: number;
  details: string | null;
  addedAt: string;
}

export interface IDealLock {
  id: string;
  checkInDate: string; // Maps variant start date for UI compatibility
  lockedPrice: number;
  expiresAt: string;
  quantity: number;
  status: string;
  createdAt: string;
  dealTitle: string;
  dealId: string;
  user: { id: string; name: string; email: string };
  addons: IAddon[];
  addonsTotal: number;
  grandTotal: number;
  chatRoomId: string | null;
}

export interface IDealBooking {
  id: string;
  checkInDate: string; // Maps variant start date for UI compatibility
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  dealTitle: string;
  dealId: string;
  user: { id: string; name: string; email: string };
  addons: IAddon[];
  addonsTotal: number;
  grandTotal: number;
  lockId: string | null;
  chatRoomId: string | null;
}

