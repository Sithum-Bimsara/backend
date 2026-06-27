import { z } from "zod";

// ─── Base Layer (Atoms) ──────────────────────────────────────────────────────

export const bedTypeSchema = z.enum(["twin", "full", "queen", "king", "sofa", "bunk", "futon"]);
export const unitCategorySchema = z.enum(["Single", "Double", "Twin", "Suite", "Apartment", "Dorm Room"]);
export const cancellationFeeTypeSchema = z.enum(["first_night", "full_stay"]);
export const propertyTypeSchema = z.enum(["hotel", "apartment", "home", "alternative"]);
export const hotelStarRatingSchema = z.enum(["N/A", "1 star", "2 stars", "3 stars", "4 stars", "5 stars"]);
export const inventoryStatusSchema = z.enum(["available", "blocked", "sold_out"]);
export const unitTypeSchema = z.enum(["entire_place", "private_room", "shared"]);

export const bedConfigSchema = z.object({
  bedType: bedTypeSchema,
  count: z.coerce.number().int().nonnegative(),
});

export const occupancyDiscountSchema = z.object({
  occupancy: z.coerce.number().int().positive(),
  discountPercentage: z.coerce.number().min(0),
});

export const occupancyPricingSchema = z.object({
  enabled: z.boolean(),
  discounts: z.array(occupancyDiscountSchema).default([]),
});

export const childPricingSchema = z.object({
  enabled: z.boolean().default(true),
  infantsFree: z.boolean().default(true),
  childrenFree: z.boolean().default(true),
  childrenAgeFrom: z.coerce.number().int().nonnegative().default(3),
  childrenAgeTo: z.coerce.number().int().nonnegative().default(10),
  infantFixedPrice: z.coerce.number().nonnegative().nullable().default(null),
  childFixedPrice: z.coerce.number().nonnegative().nullable().default(null),
});

export const cancellationPolicySchema = z.object({
  cancellationWindow: z.string().min(1).default("6pm_arrival"),
  cancellationFeeType: cancellationFeeTypeSchema.default("first_night"),
  accidentalBookingProtection: z.boolean().default(true),
});

export const servicesSchema = z.object({
  breakfast: z.enum(["no", "yes_free", "yes_paid"]),
  parking: z.enum(["no", "yes_free", "yes_paid", "off_site"]),
});

export const petsPolicySchema = z.object({
  mode: z.enum(["yes", "request", "no"]),
});

export const petFeesPolicySchema = z.object({
  amount: z.string(),
});

export const houseRulesSchema = z.object({
  smokingAllowed: z.boolean(),
  childrenAllowed: z.boolean(),
  partiesAllowed: z.boolean(),
  petsPolicy: petsPolicySchema,
  petFeesPolicy: petFeesPolicySchema,
  checkInFrom: z.string().min(1),
  checkInTo: z.string().min(1),
  checkOutFrom: z.string().min(1),
  checkOutTo: z.string().min(1),
});

export const hostProfileSchema = z.object({
  propertyDescription: z.string(),
  hostDescription: z.string(),
  neighborhoodDescription: z.string(),
});

export const propertyImageSchema = z.object({
  url: z.string().url(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  fileSizeBytes: z.coerce.number().int().nonnegative().optional(),
});

export const nearbyPOISchema = z.object({
  name: z.string(),
  distanceText: z.string(),
});

export const marineLifeZoneSchema = z.object({
  zone: z.string(),
  description: z.string().optional(),
});

export const baseUnitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  type: z.string().optional(),
  category: unitCategorySchema.optional(),
  maxGuests: z.coerce.number().int().positive().default(2),
  excludeInfants: z.boolean().default(false),
  roomType: z.string().nullable().default(null),
  cribsAvailable: z.boolean().nullable().default(null),
  bathrooms: z.coerce.number().int().nonnegative().nullable().default(null),
  isBathroomPrivate: z.boolean().default(true),
  bathroomItems: z.array(z.string()).default(["Toilet paper", "Shower", "Toilet"]),
  size: z.coerce.number().nonnegative().nullable().default(null),
  smokingAllowed: z.boolean().nullable().default(null),
  pricePerNight: z.coerce.number().nonnegative().default(0),
  localPrice: z.coerce.number().nonnegative().default(0),
  nonLocalPrice: z.coerce.number().nonnegative().default(0),
  totalInventory: z.coerce.number().int().positive().default(1),
  dealLockExpireTime: z.coerce.number().int().positive().default(1),
  amenities: z.array(z.string()).default(["Air conditioning", "Flat-screen TV", "Towels"]),
  bedConfigurations: z.array(bedConfigSchema).optional(),
});

export const baseRatePlanSchema = z.object({
  name: z.string().optional(),
  cancellationWindow: z.string().min(1).default("6pm_arrival"),
  cancellationFeeType: cancellationFeeTypeSchema.default("first_night"),
  accidentalBookingProtection: z.boolean().default(true),
  occupancyPricing: occupancyPricingSchema,
  childPricing: childPricingSchema,
});

export const basePropertySchema = z.object({
  type: propertyTypeSchema,
  name: z.string().min(1, "Property name is required"),
  description: z.string().min(1, "Property description is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  island: z.string().min(1, "Island is required"),
  zipCode: z.string().min(1, "Zipcode is required"),
  latitude: z.coerce.number().nullable().default(null),
  longitude: z.coerce.number().nullable().default(null),
  propertyFacilities: z.array(z.string()).min(0).default([]),
  services: servicesSchema,
  languages: z.array(z.string()).min(0).default([]),
  houseRules: houseRulesSchema,
  hostProfile: hostProfileSchema,
  starRating: hotelStarRatingSchema.default("N/A"),
  homeListingType: unitTypeSchema.default("private_room"),
  nearbyPointsOfInterest: z.array(nearbyPOISchema).default([]),
  marineLifeZones: z.array(marineLifeZoneSchema).default([]),
  cancellationPolicy: cancellationPolicySchema,
  childPricing: childPricingSchema,
});

// ─── Input Validation (Request DTOs) ──────────────────────────────────────────────

export const createRatePlanSchema = baseRatePlanSchema.extend({
  id: z.string().optional(),
});

export const createUnitSchema = baseUnitSchema.extend({
  id: z.string().optional(),
  ratePlan: createRatePlanSchema,
});

export const createAccommodationSchema = basePropertySchema.extend({
  units: z.array(createUnitSchema).min(1, "At least one unit is required"),
  images: z.array(propertyImageSchema).min(4, "At least 4 images are required"),
  ratePlan: createRatePlanSchema.optional(),
  agreementAccepted: z.literal(true, { error: "You must accept the legal agreement" }),
  activateListing: z.boolean(),
});

export const updatePropertySchema = createAccommodationSchema
  .partial()
  .omit({
    agreementAccepted: true,
    activateListing: true,
    units: true,
    images: true,
    ratePlan: true,
    cancellationPolicy: true,
    childPricing: true,
  });

export const bulkInventoryUpdateSchema = z.object({
  unitId: z.uuid("Invalid unit ID"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  daysOfWeek: z.array(z.coerce.number().int().min(0).max(6)).optional(),
  totalRooms: z.coerce.number().int().positive().optional(),
  priceOverride: z.coerce.number().nonnegative().optional(),
  status: inventoryStatusSchema.optional(),
});

export const inventoryDateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});

export const roomInventorySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  totalRooms: z.coerce.number().int().positive().optional(),
  availableRooms: z.coerce.number().int().nonnegative().optional(),
  priceOverride: z.coerce.number().nonnegative().optional(),
  status: inventoryStatusSchema.optional(),
});

// ─── Pagination & Query Schemas ──────────────────────────────────────────────

export const listPropertiesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
});

export const listLocksQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const listBookingsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const propertyImageListSchema = z.object({
  images: z.array(propertyImageSchema),
});

// ─── Params Schemas ─────────────────────────────────────────────────────────

export const propertyIdParamsSchema = z.object({ id: z.uuid("Invalid property ID") });

// ─── Output Shaping (View DTOs) ──────────────────────────────────────────────

export const viewRatePlanSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  unitId: z.string().nullable(),
  name: z.string().nullable().optional(),
  cancellationWindow: z.string().nullable(),
  cancellationFeeType: cancellationFeeTypeSchema.nullable().optional(),
  accidentalBookingProtection: z.boolean().optional(),
  occupancyPricingEnabled: z.boolean().optional(),
  occupancyPricing: occupancyPricingSchema.nullable().optional(),
  childPricingEnabled: z.boolean().optional(),
  childPricingInfantsFree: z.boolean().optional(),
  childPricingChildrenFree: z.boolean().optional(),
  childPricingAgeFrom: z.number().nullable().optional(),
  childPricingAgeTo: z.number().nullable().optional(),
  childPricingInfantFixedPrice: z.number().nullable().optional(),
  childPricingChildFixedPrice: z.number().nullable().optional(),
});

export const viewUnitSchema = baseUnitSchema
  .omit({ bedConfigurations: true })
  .extend({
    id: z.string(),
    verificationStatus: z.string(),
    bedConfigs: z
      .array(
        z.object({
          id: z.string(),
          bedType: z.string(),
          count: z.number(),
        }),
      )
      .optional(),
    ratePlan: viewRatePlanSchema.nullable(),
  });

export const viewPropertySchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  type: propertyTypeSchema,
  name: z.string(),
  description: z.string(),
  address: z.string(),
  city: z.string(),
  island: z.string(),
  zipCode: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  propertyFacilities: z.array(z.string()),
  services: servicesSchema,
  languages: z.array(z.string()),
  isActive: z.boolean(),
  averageRating: z.number(),
  totalReviews: z.number(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  // Flat house-rule DB columns
  smokingAllowed: z.boolean(),
  childrenAllowed: z.boolean(),
  partiesAllowed: z.boolean(),
  petsPolicy: petsPolicySchema,
  petFeesPolicy: petFeesPolicySchema,
  checkInFrom: z.string(),
  checkInTo: z.string(),
  checkOutFrom: z.string(),
  checkOutTo: z.string(),
  homeListingType: unitTypeSchema,
  starRating: hotelStarRatingSchema,
  // Relations
  images: z.array(z.object({ id: z.string(), url: z.string() })).default([]),
  units: z.array(viewUnitSchema).default([]),
  ratePlans: z.array(viewRatePlanSchema).default([]),
});

export const viewPropertySlimSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  island: z.string(),
  isActive: z.boolean(),
  images: z.array(z.object({ url: z.string() })),
});

export const paginatedPropertyResponseSchema = z.object({
  items: z.array(viewPropertySlimSchema),
  nextCursor: z.uuid().nullable(),
  total: z.number().default(0),
});

export const viewAddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  details: z.string().nullable(),
  addedAt: z.date().or(z.string()),
});

export const viewLockSchema = z.object({
  id: z.string(),
  checkInDate: z.date().or(z.string()),
  checkOutDate: z.date().or(z.string()),
  lockedPrice: z.number(),
  expiresAt: z.date().or(z.string()),
  quantity: z.number(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  unitName: z.string(),
  unitId: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  addons: z.array(viewAddonSchema),
  addonsTotal: z.number(),
  grandTotal: z.number(),
  chatRoomId: z.string().nullable(),
});

export const paginatedLockResponseSchema = z.object({
  items: z.array(viewLockSchema),
  nextCursor: z.uuid().nullable().optional(),
  total: z.number().default(0),
});

export const viewBookingSchema = z.object({
  id: z.string(),
  checkInDate: z.date().or(z.string()),
  checkOutDate: z.date().or(z.string()),
  guests: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  unitName: z.string(),
  unitId: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  addons: z.array(viewAddonSchema),
  addonsTotal: z.number(),
  grandTotal: z.number(),
  lockId: z.string().nullable(),
  chatRoomId: z.string().nullable(),
});

export const paginatedBookingResponseSchema = z.object({
  items: z.array(viewBookingSchema),
  nextCursor: z.uuid().nullable().optional(),
  total: z.number().default(0),
});

export const propertyUnitParamsSchema = z.object({ id: z.uuid(), unitId: z.uuid() });
export const propertySlotParamsSchema = z.object({ id: z.uuid(), slotId: z.uuid() });


// ─── Type Exports ────────────────────────────────────────────────────────────

// Request DTOs
export type CreateRatePlanDto = z.infer<typeof createRatePlanSchema>;
export type CreateUnitDto = z.infer<typeof createUnitSchema>;
export type CreateAccommodationCompleteDto = z.infer<typeof createAccommodationSchema>;
export type AddUnitDto = z.infer<typeof createUnitSchema>;
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
export type BulkInventoryUpdateDto = z.infer<typeof bulkInventoryUpdateSchema>;
export type InventoryDateRangeDto = z.infer<typeof inventoryDateRangeSchema>;
export type ListLocksQueryDto = z.infer<typeof listLocksQuerySchema>;
export type ListBookingsQueryDto = z.infer<typeof listBookingsQuerySchema>;
export type ListPropertiesQueryDto = z.infer<typeof listPropertiesQuerySchema>;
export type PropertyImageListDto = z.infer<typeof propertyImageListSchema>;

export type PropertyUnitParamsDto = z.infer<typeof propertyUnitParamsSchema>;
export type PropertySlotParamsDto = z.infer<typeof propertySlotParamsSchema>;


// View DTOs
export type ViewRatePlanDto = z.infer<typeof viewRatePlanSchema>;
export type ViewUnitDto = z.infer<typeof viewUnitSchema>;
export type ViewPropertyDto = z.infer<typeof viewPropertySchema>;
export type ViewPropertySlimDto = z.infer<typeof viewPropertySlimSchema>;
export type ViewLockDto = z.infer<typeof viewLockSchema>;
export type ViewBookingDto = z.infer<typeof viewBookingSchema>;
export type ViewAddonDto = z.infer<typeof viewAddonSchema>;

export type PaginatedPropertyResponseDto = z.infer<typeof paginatedPropertyResponseSchema>;
export type PaginatedLockResponseDto = z.infer<typeof paginatedLockResponseSchema>;
export type PaginatedBookingResponseDto = z.infer<typeof paginatedBookingResponseSchema>;

export type ChildPricingDto = z.infer<typeof childPricingSchema>;
export type HouseRulesDto = z.infer<typeof houseRulesSchema>;
