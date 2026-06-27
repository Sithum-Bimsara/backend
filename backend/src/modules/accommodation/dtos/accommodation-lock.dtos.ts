import { z } from "zod";

// ─── Input Validation ────────────────────────────────────────────────────────

export const lockAccommodationSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  unitId: z.uuid("Invalid unit ID"),
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid check-in date" }),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid check-out date" }),
  quantity: z.number().int().min(1).default(1),
});

export const createAccommodationBookingSchema = z.object({
  lockId: z.uuid("Invalid lock ID"),
  guests: z.number().int().min(1, "At least 1 guest required"),
});

export const accommodationLockQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  status: z.enum(["active", "converted", "expired", "cancelled"]).optional(),
});

export const lockIdParamsSchema = z.object({ id: z.uuid("Invalid lock ID") });
export const bookingIdParamsSchema = z.object({ id: z.uuid("Invalid booking ID") });

// ─── Output Shaping (What the frontend sees) ──────────────────────────────────

export const viewAccommodationLockSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  propertyId: z.uuid(),
  unitId: z.uuid(),
  checkInDate: z.date().or(z.string()),
  checkOutDate: z.date().or(z.string()),
  lockedPrice: z.number(),
  expiresAt: z.date().or(z.string()),
  quantity: z.number(),
  status: z.enum(["active", "converted", "expired", "cancelled"]),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  property: z.object({
    name: z.string(),
    city: z.string(),
  }).optional(),
  unit: z.object({
    name: z.string(),
  }).optional(),
});

export const viewAccommodationBookingSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  propertyId: z.uuid(),
  unitId: z.uuid(),
  lockId: z.uuid(),
  checkInDate: z.date().or(z.string()),
  checkOutDate: z.date().or(z.string()),
  guests: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  property: z.object({
    name: z.string(),
    city: z.string(),
  }).optional(),
  unit: z.object({
    name: z.string(),
  }).optional(),
});

export const paginatedAccommodationLockResponseSchema = z.object({
  items: z.array(viewAccommodationLockSchema),
  nextCursor: z.uuid().nullable(),
});

export const viewAccommodationLockDetailSchema = viewAccommodationLockSchema.extend({
  customAddons: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      price: z.number(),
      details: z.string().nullable(),
      addedAt: z.date().or(z.string()),
      accommodationLockId: z.uuid().nullable(),
    })
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type LockAccommodationDto = z.infer<typeof lockAccommodationSchema>;
export type CreateAccommodationBookingDto = z.infer<typeof createAccommodationBookingSchema>;
export type AccommodationLockQueryDto = z.infer<typeof accommodationLockQuerySchema>;
export type ViewAccommodationLockDto = z.infer<typeof viewAccommodationLockSchema>;
export type ViewAccommodationBookingDto = z.infer<typeof viewAccommodationBookingSchema>;
export type PaginatedAccommodationLockResponseDto = z.infer<typeof paginatedAccommodationLockResponseSchema>;
export type ViewAccommodationLockDetailDto = z.infer<typeof viewAccommodationLockDetailSchema>;
