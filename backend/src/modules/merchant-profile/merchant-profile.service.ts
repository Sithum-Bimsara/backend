import * as repo from "./merchant-profile.repository";
import type { AdminMerchantProfileRecord, AdminMerchantPaginatedRecord, MerchantProfileWhereInput } from "./merchant-profile.types";
import { supabase } from "../../config/supabase";
import crypto from "crypto";
import type { CreateMerchantProfileDto, UpdateMerchantProfileDto, ViewMerchantProfileDto } from "./merchant-profile.dtos";
import { viewMerchantProfileSchema } from "./merchant-profile.dtos";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { BadRequestException } from "../../exceptions/bad-request.exception";
import * as dealsService from "../deals/services/deals.service";
import * as accommodationService from "../accommodation/services/accommodation.service";

const STORAGE_BUCKET = "merchant-docs";

// ─── Storage Helpers ──────────────────────────────────────────────────────────

const getFileExtension = (filename?: string | null): string => {
  if (!filename) return "bin";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() ?? "bin" : "bin";
};

const getStoragePathFromPublicUrl = (publicUrl: string | null): string | null => {
  if (!publicUrl) return null;

  const publicMarker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const signedMarker = `/storage/v1/object/signed/${STORAGE_BUCKET}/`;

  let index = publicUrl.indexOf(publicMarker);
  if (index !== -1) return publicUrl.slice(index + publicMarker.length).split("?")[0];

  index = publicUrl.indexOf(signedMarker);
  if (index !== -1) return publicUrl.slice(index + signedMarker.length).split("?")[0];

  return null;
};

const getSignedUrl = async (filePath: string | null): Promise<string | null> => {
  if (!filePath) return null;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(filePath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
};

const deleteStorageFile = async (publicUrl: string | null): Promise<void> => {
  const filePath = getStoragePathFromPublicUrl(publicUrl);
  if (!filePath) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  if (error) throw new BadRequestException(`Failed to delete document: ${error.message}`);
};

const uploadBusinessDocument = async (
  userId: string,
  documentBase64: string,
  documentName?: string | null,
  documentType?: string | null,
): Promise<string> => {
  const match = documentBase64.match(/^data:([^;]+);base64,(.+)$/);
  const contentType = documentType ?? match?.[1] ?? "application/octet-stream";
  const base64Payload = match?.[2] ?? documentBase64;
  const buffer = Buffer.from(base64Payload, "base64");
  const uniqueId = crypto.randomUUID();
  const extension = getFileExtension(documentName);
  const filePath = `${userId}/${uniqueId}.${extension}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) throw new BadRequestException(`Failed to upload document: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Enriches a profile with a signed URL for the business registration document.
 */
const withSignedDocUrl = async <T extends { businessRegistrationDocUrl: string | null }>(
  profile: T
): Promise<T> => {
  if (!profile.businessRegistrationDocUrl) return profile;
  const path = getStoragePathFromPublicUrl(profile.businessRegistrationDocUrl);
  const signedUrl = await getSignedUrl(path);
  return { ...profile, businessRegistrationDocUrl: signedUrl };
};

// ─── Service Methods ──────────────────────────────────────────────────────────

export const createMerchantProfile = async (
  userId: string,
  data: CreateMerchantProfileDto,
): Promise<ViewMerchantProfileDto> => {
  const existing = await repo.findMerchantProfileByUserId(userId);
  if (existing) throw new BadRequestException("Merchant profile already exists");

  const businessRegistrationDocUrl = await uploadBusinessDocument(
    userId,
    data.businessRegistrationDocumentBase64,
    data.businessRegistrationDocumentName,
    data.businessRegistrationDocumentType,
  );

  const profile = await repo.createMerchantProfile(userId, {
    businessName: data.businessName,
    businessDescription: data.businessDescription,
    contactNumber: data.contactNumber,
    address: data.address,
    city: data.city ?? null,
    country: data.country ?? null,
    businessRegistrationDocUrl,
    businessRegistrationDocName: data.businessRegistrationDocumentName ?? null,
  });

  const enriched = await withSignedDocUrl(profile);
  return viewMerchantProfileSchema.parse(enriched);
};

export const getMerchantProfile = async (userId: string): Promise<ViewMerchantProfileDto> => {
  const profile = await repo.findMerchantProfileByUserId(userId);
  if (!profile) throw new NotFoundException("No merchant profile found");

  const enriched = await withSignedDocUrl(profile);
  return viewMerchantProfileSchema.parse(enriched);
};

export const updateMerchantProfile = async (
  userId: string,
  data: UpdateMerchantProfileDto,
): Promise<ViewMerchantProfileDto> => {
  const profile = await repo.findMerchantProfileByUserId(userId);
  if (!profile) throw new NotFoundException("No merchant profile found");

  if (data.removeBusinessRegistrationDocument && data.businessRegistrationDocumentBase64) {
    throw new BadRequestException("Cannot remove and upload a business registration document at the same time");
  }

  const updateData: {
    businessName?: string;
    businessDescription?: string;
    contactNumber?: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    businessRegistrationDocUrl?: string | null;
    businessRegistrationDocName?: string | null;
  } = {
    businessName: data.businessName,
    businessDescription: data.businessDescription,
    contactNumber: data.contactNumber,
    address: data.address,
    city: data.city ?? null,
    country: data.country ?? null,
  };

  if (data.businessRegistrationDocumentBase64) {
    const uploadedUrl = await uploadBusinessDocument(
      userId,
      data.businessRegistrationDocumentBase64,
      data.businessRegistrationDocumentName,
      data.businessRegistrationDocumentType,
    );
    await deleteStorageFile(profile.businessRegistrationDocUrl);
    updateData.businessRegistrationDocUrl = uploadedUrl;
    updateData.businessRegistrationDocName = data.businessRegistrationDocumentName ?? null;
  } else if (data.removeBusinessRegistrationDocument) {
    await deleteStorageFile(profile.businessRegistrationDocUrl);
    updateData.businessRegistrationDocUrl = null;
    updateData.businessRegistrationDocName = null;
  }

  const updatedProfile = await repo.updateMerchantProfileByUserId(userId, updateData);
  const enriched = await withSignedDocUrl(updatedProfile);
  return viewMerchantProfileSchema.parse(enriched);
};



// ------------- Admin Functions ------------------
/**
 * Counts total merchants matching query conditions.
 */
export const countMerchants = async (where?: MerchantProfileWhereInput): Promise<number> => {
  return repo.countMerchants(where);
};

/**
 * Lists merchants with offset-based pagination.
 */
export const findMerchantsPaginated = async (
  where: MerchantProfileWhereInput,
  page: number = 1,
  limit: number = 10
): Promise<AdminMerchantPaginatedRecord[]> => {
  return repo.findMerchantsPaginated(where, page, limit);
};

/**
 * Updates a merchant's verification status.
 */
export const updateMerchantVerification = async (
  id: string,
  status: "verified" | "pending"
): Promise<AdminMerchantProfileRecord> => {
  const merchant = await repo.getMerchantProfileById(id);
  if (!merchant) throw new NotFoundException("Merchant not found");
  return repo.updateMerchantVerification(id, status);
};

/**
 * Retrieves complete merchant details with related profile information.
 */
export const getMerchantProfileById = async (id: string): Promise<AdminMerchantProfileRecord> => {
  const merchant = await repo.getMerchantProfileById(id);
  if (!merchant) throw new NotFoundException("Merchant not found");
  return merchant;
};

/**
 * Fetches overall analytics for a merchant dashboard.
 * 
 * Performance & Architecture Strategy:
 * 1. Orchestrates queries across separate bounded contexts (Deals and Accommodations) concurrently
 *    using Promise.all to achieve maximum throughput and minimal API latency.
 * 2. Adheres strictly to architectural boundaries: NEVER queries database tables of other modules
 *    directly from this service; instead, delegates to their respective Service layers.
 * 3. Calculates precise estimated earnings based on custom formulas for both Deals and Accommodations.
 * 4. Pre-aggregates daily time-series data and top performing products on the backend, delivering 
 *    a "ready-to-display" response payload to avoid heavy, redundant calculations on the client side.
 */
export const getMerchantOverallAnalytics = async (merchantId: string) => {
  // 1. Fetch raw deals and accommodation data concurrently via their respective exported services
  const [dealsData, accData] = await Promise.all([
    dealsService.getMerchantDealsAnalyticsData(merchantId),
    accommodationService.getMerchantAccommodationAnalyticsData(merchantId)
  ]);

  // 2. Compute lock and booking count statistics
  // Sum up all active locked slots across both deals and accommodations
  const activeDealLockedSlots = dealsData.locks.reduce((sum, l) => sum + (l.quantity || 0), 0);
  const activeAccommodationLockedSlots = accData.locks.reduce((sum, l) => sum + (l.quantity || 0), 0);
  const totalActiveLockedSlots = activeDealLockedSlots + activeAccommodationLockedSlots;

  // Sum up paid deal booking transactions and confirmed accommodation booking transactions
  const totalBookingsCount = dealsData.bookings.length + accData.bookings.length;

  // 3. Compute estimated earnings based on specific formulas
  // 3.a) Deals Earning formula: booking.totalPrice - booking.deal.dealPrice
  const dealsEarnings = dealsData.bookings.reduce((sum, b) => {
    const totalPrice = b.totalPrice ?? 0;
    const dealPrice = b.deal?.dealPrice ?? 0;
    return sum + (totalPrice - dealPrice);
  }, 0);

  // 3.b) Accommodation Earning formula: booking.totalPrice - booking.unit.pricePerNight
  const accEarnings = accData.bookings.reduce((sum, b) => {
    const totalPrice = b.totalPrice ?? 0;
    const pricePerNight = b.unit?.pricePerNight ?? 0;
    return sum + (totalPrice - pricePerNight);
  }, 0);

  const totalEstimatedEarnings = dealsEarnings + accEarnings;

  // 4. Generate pre-aggregated time-series data for chart display without frontend side calculations
  // Determine date bounds: defaults to the last 30 days
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Initialize a daily map to populate daily earnings values
  const dailyDataMap = new Map<string, { date: string; dealsEarnings: number; accEarnings: number; totalEarnings: number }>();
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    dailyDataMap.set(dateStr, { date: dateStr, dealsEarnings: 0, accEarnings: 0, totalEarnings: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Populate deals daily earnings
  for (const b of dealsData.bookings) {
    const dateStr = new Date(b.createdAt).toISOString().split("T")[0];
    if (dailyDataMap.has(dateStr)) {
      const entry = dailyDataMap.get(dateStr)!;
      const earning = (b.totalPrice ?? 0) - (b.deal?.dealPrice ?? 0);
      entry.dealsEarnings += earning;
      entry.totalEarnings += earning;
    }
  }

  // Populate accommodations daily earnings
  for (const b of accData.bookings) {
    const dateStr = new Date(b.createdAt).toISOString().split("T")[0];
    if (dailyDataMap.has(dateStr)) {
      const entry = dailyDataMap.get(dateStr)!;
      const earning = (b.totalPrice ?? 0) - (b.unit?.pricePerNight ?? 0);
      entry.accEarnings += earning;
      entry.totalEarnings += earning;
    }
  }

  const earningsOverview = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 5. Aggregate Top Performing Products across both modules
  // Deal products aggregation
  const dealsPerformanceMap = new Map<string, { id: string; name: string; type: "deal"; earnings: number; bookingsCount: number }>();
  for (const b of dealsData.bookings) {
    if (!b.dealId) continue;
    const dealInfo = dealsData.deals.find(d => d.id === b.dealId);
    const title = dealInfo?.title || "Unknown Deal";
    const earning = (b.totalPrice ?? 0) - (b.deal?.dealPrice ?? 0);

    if (!dealsPerformanceMap.has(b.dealId)) {
      dealsPerformanceMap.set(b.dealId, { id: b.dealId, name: title, type: "deal", earnings: 0, bookingsCount: 0 });
    }
    const entry = dealsPerformanceMap.get(b.dealId)!;
    entry.earnings += earning;
    entry.bookingsCount += 1;
  }

  // Accommodation properties aggregation
  const accPerformanceMap = new Map<string, { id: string; name: string; type: "accommodation"; earnings: number; bookingsCount: number }>();
  for (const b of accData.bookings) {
    const propInfo = accData.properties.find(p => p.id === b.propertyId);
    const name = propInfo?.name || "Unknown Property";
    const earning = (b.totalPrice ?? 0) - (b.unit?.pricePerNight ?? 0);

    if (!accPerformanceMap.has(b.propertyId)) {
      accPerformanceMap.set(b.propertyId, { id: b.propertyId, name, type: "accommodation", earnings: 0, bookingsCount: 0 });
    }
    const entry = accPerformanceMap.get(b.propertyId)!;
    entry.earnings += earning;
    entry.bookingsCount += 1;
  }

  // Combine and sort by earnings descending to yield top 5 performing products
  const topPerforming = [
    ...Array.from(dealsPerformanceMap.values()),
    ...Array.from(accPerformanceMap.values())
  ].sort((a, b) => b.earnings - a.earnings).slice(0, 5);

  // Return the comprehensive, ready-to-display dashboard analytics payload
  return {
    // New Fields
    activeDealsCount: dealsData.activeDealsCount,
    activeLockedSlots: totalActiveLockedSlots,
    bookingsCount: totalBookingsCount,
    estimatedEarnings: totalEstimatedEarnings,
    dealsEarnings,
    accommodationEarnings: accEarnings,
    earningsOverview,
    topPerforming,

    // Legacy / Backward Compatibility Fields
    overall: {
      totalEarnings: totalEstimatedEarnings,
      totalBookings: totalBookingsCount,
      totalLocks: totalActiveLockedSlots,
    },
    dealsBreakdown: [
      ...Array.from(dealsPerformanceMap.values()).map(d => ({
        dealId: d.id,
        title: d.name,
        bookingsCount: d.bookingsCount,
        locksCount: dealsData.locks.filter(l => l.dealId === d.id).reduce((sum, l) => sum + (l.quantity || 0), 0),
        earnings: d.earnings,
      })),
      ...Array.from(accPerformanceMap.values()).map(a => ({
        dealId: a.id,
        title: a.name,
        bookingsCount: a.bookingsCount,
        locksCount: accData.locks.filter(l => l.propertyId === a.id).reduce((sum, l) => sum + (l.quantity || 0), 0),
        earnings: a.earnings,
      }))
    ].sort((a, b) => b.earnings - a.earnings),
    timeSeriesRevenue: earningsOverview.map(e => ({
      date: e.date,
      earnings: e.totalEarnings
    }))
  };
};

