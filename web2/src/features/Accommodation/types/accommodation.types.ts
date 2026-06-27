import { z } from 'zod';
import * as dtos from '../dtos/accommodation.dto';

// ─── Enums & Base Types (Inferred from DTO) ──────────────────────────────────

export type PropertyType = z.infer<typeof dtos.propertyTypeSchema>;
export type BedType = z.infer<typeof dtos.bedTypeSchema>;
export type HotelStarRating = z.infer<typeof dtos.hotelStarRatingSchema>;
export type UnitCategory = z.infer<typeof dtos.unitCategorySchema>;
export type CancellationFeeType = z.infer<typeof dtos.cancellationFeeTypeSchema>;
export type InventoryStatus = z.infer<typeof dtos.inventoryStatusSchema>;
export type HomeListingType = z.infer<typeof dtos.unitTypeSchema>;

export type RoomType = 'bedroom' | 'living_room' | 'other_spaces';
export type RoomSlotStatus = 'available' | 'booked' | 'maintenance' | 'blocked' | 'locked';
export type UnitStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type PropertyStep =
  | 'type' | 'unit_type' | 'location' | 'details' | 'facilities'
  | 'nearby' | 'marine-life' | 'languages' | 'house-rules' | 'amenities'
  | 'host-profile' | 'beds' | 'bathrooms' | 'pricing' | 'child-pricing'
  | 'cancellation' | 'units' | 'images' | 'final';


// ─── Constants ────────────────────────────────────────────────────────────────

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string; description: string }[] = [
  { value: 'hotel', label: 'Hotel & BnB', description: 'Multi-unit properties like hotels, hostels, and guest houses.' },
  { value: 'home', label: 'Home & Villa', description: 'Residential properties offered as entire units or private rooms.' },
  { value: 'apartment', label: 'Apartment', description: 'Self-contained units within residential buildings.' },
  { value: 'alternative', label: 'Alternative Stays', description: 'Unique stays like boats, campsites, and glamping sites.' },
];

export const CANCELLATION_WINDOWS = [
  { value: '6pm_arrival', label: 'Before 6 pm on the day of arrival' },
  { value: '1_day', label: 'Up to 1 day before the day of arrival' },
  { value: '2_days', label: 'Up to 2 days before the day of arrival' },
  { value: '3_days', label: 'Up to 3 days before the day of arrival' },
  { value: '7_days', label: 'Up to 7 days before the day of arrival' },
  { value: '14_days', label: 'Up to 14 days before the day of arrival' },
];

export const BED_CONFIGS: Record<BedType, { label: string; description: string; capacity: number }> = {
  twin: { label: 'Twin bed(s)', description: '35-51 inches wide', capacity: 1 },
  full: { label: 'Full bed(s)', description: '52-59 inches wide', capacity: 2 },
  queen: { label: 'Queen bed(s)', description: '60-70 inches wide', capacity: 2 },
  king: { label: 'King bed(s)', description: '71-81 inches wide', capacity: 2 },
  bunk: { label: 'Bunk bed', description: 'Varying sizes', capacity: 2 },
  sofa: { label: 'Sofa bed', description: 'Varying sizes', capacity: 1 },
  futon: { label: 'Futon bed', description: 'Varying sizes', capacity: 1 },
};

export const BED_TYPES: BedType[] = Object.keys(BED_CONFIGS) as BedType[];

export const UNIT_TYPES: string[] = [
  'Double Room', 'Double Room with Private Bathroom', 'Budget Double Room',
  'Deluxe Double Room', 'Deluxe King Room', 'Deluxe Queen Room', 'Deluxe Room',
  'King Room', 'King Room with Balcony', 'King Room with Sea View',
  'Queen Room', 'Queen Room with Balcony', 'Queen Room with Sea View',
  'Standard Double Room', 'Standard King Room', 'Standard Queen Room',
  'Superior Double Room', 'Superior King Room', 'Superior Queen Room',
  'Suite', 'Deluxe Suite', 'Junior Suite', 'Family Room',
];


// ─── UI Draft Interfaces (form / local state) ─────────────────────────────────

export interface BedConfig {
  roomType: RoomType;
  beds: Array<{ type: BedType; count: number }>;
}

export interface PropertyImage {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
}

export interface IOccupancyPricing {
  enabled: boolean;
  discounts: Array<{ occupancy: number; discountPercentage: number }>;
}

export type IRatePlan = dtos.CreateRatePlanDto;

export type IUnit = dtos.CreateUnitDto & { verificationStatus?: string };

/** Master form state — matches the backend wire format directly.*/
export type IAccommodation = dtos.CreateAccommodationCompleteDto;




// ─── API Response Types (Inferred from View DTOs) ───────────────────────────

export interface IPropertyImageView {
  id: string;
  url: string;
}

export interface IBedConfigView {
  id: string;
  bedType: string;
  count: number;
}

export interface IRatePlanView extends dtos.ViewRatePlanDto {}

export interface IUnitView extends dtos.ViewUnitDto {}

export interface IAccommodationView extends dtos.ViewPropertyDto {}

export interface IMarineLifeZone extends dtos.MarineLifeZoneDto {}

export interface INearbyPOI extends dtos.NearbyPOIDto {}


// ─── Inventory ────────────────────────────────────────────────────────────────

export interface IRoomInventorySlot {
  id: string;
  roomNumber: number;
  status: RoomSlotStatus;
  bookings?: Array<{ id: string; user: { id: string; name: string; email: string } }>;
  locks?: Array<{ id: string; user: { id: string; name: string } }>;
}

export interface IRoomInventory {
  id: string;
  unitId: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  priceOverride: number | null;
  status: InventoryStatus;
  slots?: IRoomInventorySlot[];
}

export interface BulkInventoryUpdateInput {
  unitId: string;
  startDate: string;
  endDate: string;
  daysOfWeek?: number[];
  totalRooms?: number;
  priceOverride?: number;
  status?: InventoryStatus;
}

// ─── Locks & Bookings ─────────────────────────────────────────────────────────

export interface IAddon {
  id: string;
  name: string;
  price: number;
  details: string | null;
  addedAt: string;
}

export interface IAccommodationLock extends dtos.ViewLockDto {}

export interface IAccommodationBooking extends dtos.ViewBookingDto {}

export interface IAccommodationSummaryView extends dtos.ViewPropertySlimDto {}
