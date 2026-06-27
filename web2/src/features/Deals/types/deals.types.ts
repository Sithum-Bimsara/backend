import type { DealVariantStatus, LockStatus, BookingStatus } from '../enums/deals.enum';
import type { IReview, IReviewsPreview } from './reviews.types';
export type { BookingStatus };

// ─── Merchant (public summary) ───

export interface IMerchantSummary {
  id: string;
  businessName: string;
  logoUrl: string | null;
}

export interface IMerchantDetail extends IMerchantSummary {
  businessDescription: string;
  city: string | null;
  country: string | null;
}

// ─── Deal Variant (public view) ───

export interface IDealVariantPublic {
  id: string;
  title: string | null;
  dealPrice: number | null;
  originalPrice: number | null;
  displayedPrice: number | null;
  startDatetime: string | null;
  endDatetime: string | null;
  totalSlots: number | null;
  availableSlots: number | null;
  status: DealVariantStatus;
}

export interface IDealVariantDetail extends IDealVariantPublic {
  _count?: { bookings: number; locks: number };
}

// ─── Lock Info (on-demand, fetched when "Lock Deal" is clicked) ───

export interface IDealLockInfo {
  dealLockExpireTime: number | null;
  variants: IDealVariantPublic[];
}

// ─── Itinerary / Inclusions / Exclusions ───

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

// ─── Deal Card (listing view) — lean response, no variants array ───

export interface IDealCard {
  id: string;
  merchantId?: string;
  title: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
  durationDays: number | null;
  dealPrice?: number | null;
  originalPrice: number | null;
  displayedPrice?: number | null;
  localPrice?: number | null;
  nonLocalPrice?: number | null;
  variants?: Array<{
    displayedPrice: number | null;
    dealPrice: number | null;
    startDatetime: string | null;
    availableSlots: number | null;
  }>;
  primaryImageUrl: string | null;
  dealLockExpireTime: number | null;
  isLocalOnly: boolean;
  isActive?: boolean;
  createdAt: string;
  merchant: IMerchantSummary;
  aiScore?: number;
  currency?: string;
  averageRating?: number;
  totalReviews?: number;
  isAccommodation?: boolean;
  _count?: { bookings: number };
}

// ─── Deal Detail (full view) ───

export interface IDealDetail {
  id: string;
  merchantId: string;
  title: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
  durationType: string | null;
  durationDays: number | null;
  durationHours: number | null;
  dealPrice: number | null;
  originalPrice: number | null;
  displayedPrice: number | null;
  primaryImageUrl: string | null;
  secondImageUrl: string | null;
  thirdImageUrl: string | null;
  fourthImageUrl: string | null;
  dealLockExpireTime: number | null;
  isLocalOnly: boolean;
  isActive: boolean;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  merchant: IMerchantDetail;
  itineraries: IItinerary[];
  inclusions: IInclusion[];
  exclusions: IExclusion[];
  variants: IDealVariantDetail[];
  averageRating: number;
  totalReviews: number;
  reviewsPreview?: IReviewsPreview;
  userReview?: IReview | null;
}

// ─── Lock Response ───

export interface ILockResponse {
  id: string;
  userId: string | null;
  dealId: string | null;
  variantId: string | null;
  quantity: number | null;
  lockedPrice: number | null;
  expiresAt: string | null;
  status: LockStatus;
  createdAt: string;
  customAddons?: Array<{ name: string; price: number; details?: string }>;
  deal: {
    id: string;
    title: string | null;
    location: string | null;
    primaryImageUrl: string | null;
    dealLockExpireTime: number | null;
  } | null;
  variant: {
    id: string;
    title: string | null;
    startDatetime: string | null;
    endDatetime: string | null;
    dealPrice: number | null;
    displayedPrice: number | null;
  } | null;
}

// ─── User Lock (my-locks view) ───

export interface IUserLock {
  id: string;
  type: "deal" | "accommodation";
  title: string;
  location: string;
  imageUrl: string | null;
  status: LockStatus;
  createdAt: string;
  expiresAt: string | null;
  price: number;
  quantity: number;
  customAddons?: Array<{ name: string; price: number; details?: string }>;

  // Deal specific
  variantDate?: string | null;
  category?: string | null;
  dealId?: string | null;
  variantId?: string | null;

  // Accommodation specific
  checkInDate?: string | null;
  checkOutDate?: string | null;
  unitName?: string | null;
  propertyId?: string | null;
  unitId?: string | null;

  // Keeping deal and variant objects optional for backward compatibility if needed in other components
  deal?: {
    id: string;
    title: string | null;
    location: string | null;
    primaryImageUrl: string | null;
    category: string | null;
  } | null;
  variant?: {
    id: string;
    title: string | null;
    startDatetime: string | null;
    endDatetime: string | null;
    dealPrice: number | null;
    displayedPrice: number | null;
    availableSlots: number | null;
  } | null;
}

// ─── Booking Response ───

export interface IBookingResponse {
  id: string;
  userId: string | null;
  dealId: string | null;
  variantId: string | null;
  lockId: string | null;
  quantity: number | null;
  totalPrice: number | null;
  paymentStatus: BookingStatus;
  qrCode: string | null;
  createdAt: string;
  deal: {
    id: string;
    title: string | null;
    location: string | null;
    primaryImageUrl: string | null;
    category: string | null;
    durationDays: number | null;
  } | null;
  variant: {
    id: string;
    title: string | null;
    startDatetime: string | null;
    endDatetime: string | null;
    dealPrice: number | null;
    displayedPrice: number | null;
  } | null;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface IPlatformStats {
  totalDeals: number;
  totalTravellers: number;
  totalLocks: number;
}

export interface IDealScore {
  score: number;
}

// ─── Property Detail (public view) ───

export interface IPropertyImage {
  id: string;
  url: string;
}

export interface IBedConfig {
  id: string;
  roomName: string;
  roomType: string;
  bedType: string;
  count: number;
}

export interface IRoomInventory {
  id: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  priceOverride: number | null;
  status: string;
}

export interface IUnitDetail {
  id: string;
  name: string;
  maxGuests: number | null;
  bathrooms: number | null;
  size: number | null;
  pricePerNight: number | null;
  localPrice: number | null;
  nonLocalPrice: number | null;
  displayedPrice: number | null;
  amenities: any;
  bedConfigs: IBedConfig[];
  inventory: IRoomInventory[];
  excludeInfants: boolean;
  smokingAllowed: boolean | null;
  isBathroomPrivate: boolean | null;
  bathroomItems: any;
  cribsAvailable: boolean | null;
  totalInventory?: number | null;
}

export interface IPropertyDetail {
  id: string;
  name: string | null;
  description: string | null;
  type: 'hotel' | 'apartment' | 'home' | 'alternative';
  address: string | null;
  city: string | null;
  island: string | null;
  zipCode: string | null;
  propertyFacilities: any;
  services: any;
  checkInFrom: string | null;
  checkInTo: string | null;
  checkOutFrom: string | null;
  checkOutTo: string | null;
  smokingAllowed: boolean | null;
  childrenAllowed: boolean | null;
  partiesAllowed: boolean | null;
  petsPolicy: any;
  petFeesPolicy: any;
  isActive: boolean;
  merchant: IMerchantDetail;
  images: IPropertyImage[];
  languages: any;
  hostProfile: any;
  starRating: string | null;
  units: IUnitDetail[];
  reviewsPreview: IReviewsPreview;
  userReview?: IReview | null;
  nearbyPointsOfInterest?: Array<{ name: string; distanceText: string }> | null;
  marineLifeZones?: Array<{ zone: string; description?: string }> | null;
}

export interface IAccommodationLockResponse {
  id: string;
  userId: string;
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  lockedPrice: number;
  quantity?: number;
  expiresAt: string;
  status: string;
  createdAt: string;
  customAddons?: Array<{ name: string; price: number; details?: string }>;
  property: { name: string; city: string };
  unit: { name: string; dealLockExpireTime?: number | null };
  deal?: { location: string | null };
  variant?: { startDatetime: string | null };
}

// ─── Island Listings Drawer View ───

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IIslandListingsResponse {
  deals: IDealCard[];
  accommodations: IDealCard[];
  pagination: {
    deals: IPaginationMeta;
    accommodations: IPaginationMeta;
  };
}
