import * as userProfileService from "../user-profile/user-profile.service";
import { UserWhereInput } from "../user-profile/user-profile.types";
import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import * as merchantProfileService from "../merchant-profile/merchant-profile.service";
import * as communityService from "../community/community.service";
import * as dealsService from "../deals/services/deals.service";
import * as accommodationService from "../accommodation/services/accommodation.service";
import * as dealRequestsService from "../deal-requests/deal-requests.service";
import {
  AdminMerchantQueryDto,
  AdminUserQueryDto,
  AdminDealQueryDto,
  UpdateDealAdminDto,
  UpdateVariantPriceDto,
  ViewAdminDashboardDto,
  ViewAdminDealDetailDto,
  ViewMerchantDealSummaryDto,
  PaginatedAdminUsersDto,
  PaginatedAdminMerchantsDto,
  PaginatedAdminDealsDto,
  viewAdminDashboardSchema,
  viewAdminUserDetailsSchema,
  viewAdminMerchantDetailsSchema,
  viewAdminDealDetailSchema,
  paginatedAdminUsersSchema,
  paginatedAdminMerchantsSchema,
  paginatedAdminDealsSchema,
  AdminCommunityQueryDto,
  paginatedAdminCommunityPostSchema,
  paginatedAdminCommunityCommentSchema,
  paginatedAdminCommunityReportedCommentSchema,
  PaginatedAdminCommunityReportedCommentDto,
} from "./admin.dtos";
import { MerchantVerificationStatus, UserStatus, AdminDealStatus } from "./admin.enums";
import { 
  DealRequestQueryDto, 
  UpdateDealRequestStatusDto, 
  ViewDealRequestDto, 
  PaginatedDealRequestResponseDto,
  viewDealRequestSchema,
  paginatedDealRequestResponseSchema
} from "../deal-requests/deal-requests.dto";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { ConflictException } from "../../exceptions/conflict.exception";

const COMMISSION_RATE = 0.03;

const buildDateFilter = (startDate?: string, endDate?: string) => {
  let start = startDate ? new Date(startDate) : undefined;
  let end = endDate ? new Date(endDate) : undefined;

  if (!start && !end) {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
    
    const monday = new Date(today.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    start = monday;
    end = sunday;
  }

  return {
    ...(start ? { gte: start } : {}),
    ...(end ? { lte: end } : {}),
  };
};

const toDayKey = (value: Date) => {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day.toISOString().split("T")[0];
};



export const getDashboard = async (
  query: { startDate?: string; endDate?: string }
): Promise<ViewAdminDashboardDto> => {
  const createdAtFilter = buildDateFilter(query.startDate, query.endDate);

  const [
    totalUsers,
    totalMerchants,
    totalDeals,
    totalAccommodations,
    totalDealBookings,
    totalAccommodationBookings,
    totalDealLocks,
    totalAccommodationLocks,
    paidDealBookings,
    paidAccommodationBookings
  ] = await Promise.all([
    userProfileService.countUsers(undefined),
    merchantProfileService.countMerchants(undefined),
    dealsService.countDeals(undefined),
    accommodationService.countAccommodations(undefined),
    dealsService.countDealBookings(createdAtFilter ? { createdAt: createdAtFilter } : undefined),
    accommodationService.countAccommodationBookings(createdAtFilter ? { createdAt: createdAtFilter } : undefined),
    dealsService.countDealLocks(createdAtFilter ? { createdAt: createdAtFilter } : undefined),
    accommodationService.countAccommodationLocks(createdAtFilter ? { createdAt: createdAtFilter } : undefined),
    dealsService.getPaidDealBookings(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    accommodationService.getPaidAccommodationBookings(createdAtFilter ? { createdAt: createdAtFilter } : {}),
  ]);

  const dailyIncome = new Map<string, number>();
  let totalPlatformIncome = 0;

  // Process Deal Bookings
  for (const booking of paidDealBookings) {
    const displayedPrice = booking.variant?.displayedPrice ?? booking.deal?.displayedPrice ?? 0;
    const dealPrice = booking.deal?.dealPrice ?? 0;
    const quantity = booking.quantity ?? 1;
    const income = Math.max(0, (displayedPrice - dealPrice) * quantity);

    totalPlatformIncome += income;

    const dayKey = toDayKey(booking.createdAt);
    dailyIncome.set(dayKey, (dailyIncome.get(dayKey) ?? 0) + income);
  }

  // Process Accommodation Bookings (Platform receives COMMISSION_RATE of the booking price)
  for (const booking of paidAccommodationBookings) {
    const price = booking.totalPrice ?? 0;
    const income = price * COMMISSION_RATE;

    totalPlatformIncome += income;

    const dayKey = toDayKey(booking.createdAt);
    dailyIncome.set(dayKey, (dailyIncome.get(dayKey) ?? 0) + income);
  }

  const platformIncomeSeries = Array.from(dailyIncome.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, income]) => ({
      date,
      income: Math.round(income * 100) / 100,
    }));

  const result = {
    totalUsers,
    totalMerchants,
    totalDeals,
    totalAccommodations,
    totalBookings: totalDealBookings + totalAccommodationBookings,
    totalLocks: totalDealLocks + totalAccommodationLocks,
    totalPlatformRevenue: Math.round(totalPlatformIncome * 100) / 100,
    platformIncomeSeries,
  };

  return viewAdminDashboardSchema.parse(result);
};

export const getDealRequestById = async (id: string): Promise<ViewDealRequestDto> => {
  const result = await dealRequestsService.findDealRequestById(id);
  return viewDealRequestSchema.parse(result);
};

export const getDealRequests = async (query: DealRequestQueryDto): Promise<PaginatedDealRequestResponseDto> => {
  const { data, total } = await dealRequestsService.getDealRequests(query);
  return paginatedDealRequestResponseSchema.parse({
    data,
    total,
    page: query.page,
    limit: query.limit,
  });
};

export const updateDealRequestStatus = async (
  id: string, 
  data: UpdateDealRequestStatusDto
): Promise<ViewDealRequestDto> => {
  const result = await dealRequestsService.updateDealRequestStatus(id, data);
  return viewDealRequestSchema.parse(result);
};

export const listMerchants = async (
  query: AdminMerchantQueryDto
): Promise<PaginatedAdminMerchantsDto> => {
  const where: Prisma.MerchantProfileWhereInput = {
    ...(query.verificationStatus ? { verificationStatus: query.verificationStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { businessName: { contains: query.search, mode: "insensitive" } },
            { businessDescription: { contains: query.search, mode: "insensitive" } },
            { contactNumber: { contains: query.search, mode: "insensitive" } },
            { city: { contains: query.search, mode: "insensitive" } },
            { country: { contains: query.search, mode: "insensitive" } },
            { user: { is: { name: { contains: query.search, mode: "insensitive" } } } },
            { user: { is: { email: { contains: query.search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [total, merchants] = await Promise.all([
    merchantProfileService.countMerchants(where),
    merchantProfileService.findMerchantsPaginated(where, query.page, query.limit),
  ]);

  const result = {
    data: merchants.map((merchant) => ({
      ...merchant,
      createdAt: merchant.createdAt.toISOString(),
    })),
    total,
    page: query.page,
    limit: query.limit,
  };

  return paginatedAdminMerchantsSchema.parse(result);
};

export const verifyMerchant = async (id: string) => {
  return merchantProfileService.updateMerchantVerification(id, MerchantVerificationStatus.VERIFIED);
};

export const unverifyMerchant = async (id: string) => {
  return merchantProfileService.updateMerchantVerification(id, MerchantVerificationStatus.PENDING);
};

export const getMerchantDetails = async (
  merchantId: string,
  query: { startDate?: string; endDate?: string }
) => {
  const createdAtFilter = buildDateFilter(query.startDate, query.endDate);

  const merchant = await merchantProfileService.getMerchantProfileById(merchantId);

  const [deals, properties] = await Promise.all([
    dealsService.getMerchantDealsSummaryAdmin(merchantId, createdAtFilter),
    prisma.property.findMany({
      where: { merchantId },
      include: {
        bookings: {
          where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
        },
        accommodationLocks: {
          where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
        },
      },
    }),
  ]);

  const merchantDeals: ViewMerchantDealSummaryDto[] = deals.map((deal) => ({
    dealId: deal.id,
    title: deal.title,
    displayedPrice: deal.displayedPrice,
    locksCount: deal.locks.length,
    bookingsCount: deal.bookings.length,
  }));

  const dealRevenue = deals.reduce(
    (sum, deal) => sum + deal.bookings.reduce((bookingSum, booking) => bookingSum + (booking.totalPrice || 0), 0),
    0
  );

  const propertyRevenue = properties.reduce(
    (sum, prop) => sum + prop.bookings.reduce((bookingSum, booking) => bookingSum + (booking.totalPrice || 0), 0),
    0
  );

  const totalRevenue = dealRevenue + propertyRevenue;
  const platformCommission = Math.round(totalRevenue * COMMISSION_RATE * 100) / 100;
  const merchantPayout = Math.round((totalRevenue - platformCommission) * 100) / 100;

  const totalDealsCount = await dealsService.countDeals({ merchantId });
  const totalPropertiesCount = properties.length;

  const totalLocksCount =
    deals.reduce((sum, deal) => sum + deal.locks.length, 0) +
    properties.reduce((sum, prop) => sum + prop.accommodationLocks.length, 0);

  const totalBookingsCount =
    deals.reduce((sum, deal) => sum + deal.bookings.length, 0) +
    properties.reduce((sum, prop) => sum + prop.bookings.length, 0);

  const result = {
    merchant: {
      ...merchant,
      createdAt: merchant.createdAt.toISOString(),
    },
    analytics: {
      totalDeals: totalDealsCount + totalPropertiesCount,
      totalLocks: totalLocksCount,
      totalBookings: totalBookingsCount,
      totalRevenueGenerated: Math.round(totalRevenue * 100) / 100,
      platformCommission,
      merchantPayout,
    },
    deals: merchantDeals,
  };

  return viewAdminMerchantDetailsSchema.parse(result);
};



export const listAllDeals = async (
  query: AdminDealQueryDto
): Promise<PaginatedAdminDealsDto> => {

  const where: any = {
    ...(query.merchantId ? { merchantId: query.merchantId } : {}),
    ...(query.status === AdminDealStatus.ACTIVE ? { isActive: true } : query.status === AdminDealStatus.INACTIVE ? { isActive: false } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { location: { contains: query.search, mode: "insensitive" } },
            { merchant: { is: { businessName: { contains: query.search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [total, deals] = await Promise.all([
    dealsService.countDeals(where),
    dealsService.findDealsPaginated(where, query.cursor, query.limit),
  ]);

  let nextCursor: string | null = null;
  if (deals.length > query.limit) {
    const nextItem = deals.pop();
    nextCursor = nextItem!.id;
  }

  const result = {
    items: deals.map((d) => ({
      id: d.id,
      title: d.title,
      location: d.location,
      displayedPrice: d.displayedPrice,
      dealPrice: d.dealPrice,
      originalPrice: d.originalPrice,
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      merchant: d.merchant ?? { id: "", businessName: "Unknown" },
      _count: d._count,
    })),
    nextCursor,
  };

  return paginatedAdminDealsSchema.parse(result);
};

export const getDealDetail = async (dealId: string): Promise<ViewAdminDealDetailDto> => {
  const deal = await dealsService.getDealDetailByIdAdmin(dealId);

  const result = {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    location: deal.location,
    displayedPrice: deal.displayedPrice,
    dealPrice: deal.dealPrice,
    originalPrice: deal.originalPrice,
    isActive: deal.isActive,
    category: deal.category ?? null,
    dealLockExpireTime: deal.dealLockExpireTime ?? null,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    merchant: deal.merchant ?? { id: "", businessName: "Unknown", contactNumber: null, user: { id: "", name: "Unknown", email: "" } },
    itineraries: deal.itineraries.map((it) => ({
      id: it.id,
      dayNumber: it.dayNumber,
      title: it.title,
      description: it.description,
    })),
    inclusions: deal.inclusions.map((inc) => ({ id: inc.id, description: inc.description ?? "" })),
    exclusions: deal.exclusions.map((exc) => ({ 
      id: exc.id, 
      description: exc.description ?? "",
      additionalPrice: exc.additionalPrice ?? null
    })),
    variants: deal.variants.map((v) => ({
      ...v,
      startDatetime: v.startDatetime?.toISOString() ?? null,
    })),
    _count: deal._count,
  };

  return viewAdminDealDetailSchema.parse(result);
};

export const updateDealAdmin = async (dealId: string, data: UpdateDealAdminDto) => {
  return dealsService.updateDealAdmin(dealId, data);
};

export const listUsers = async (
  query: AdminUserQueryDto
): Promise<PaginatedAdminUsersDto> => {
  const where: UserWhereInput = {
    isTraveller: true,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
            { contactNumber: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    userProfileService.countUsers(where),
    userProfileService.findUsersPaginated(where, query.page, query.limit),
  ]);

  const result = {
    data: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      isTraveller: user.isTraveller,
      isMerchant: user.isMerchant,
      isAdmin: user.isAdmin,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      merchantProfile: user.merchantProfile,
    })),
    total,
    page: query.page,
    limit: query.limit,
  };

  return paginatedAdminUsersSchema.parse(result);
};

export const suspendUser = async (id: string) => {
  return userProfileService.updateUserStatus(id, UserStatus.SUSPENDED);
};

export const activateUser = async (id: string) => {
  return userProfileService.updateUserStatus(id, UserStatus.ACTIVE);
};

export const getUserDetails = async (id: string) => {
  const user = await userProfileService.getUserWithProfile(id);

  const [
    dealBookingsCount,
    accommodationBookingsCount,
    dealLocksCount,
    accommodationLocksCount,
    postsCount
  ] = await Promise.all([
    dealsService.countDealBookings({ userId: id }),
    accommodationService.countAccommodationBookings({ userId: id }),
    dealsService.countDealLocks({ userId: id }),
    accommodationService.countAccommodationLocks({ userId: id }),
    communityService.countCommunityPosts({ userId: id }),
  ]);

  const result = {
    profile: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
    bookingsCount: dealBookingsCount + accommodationBookingsCount,
    locksCount: dealLocksCount + accommodationLocksCount,
    postsCount,
  };

  return viewAdminUserDetailsSchema.parse(result);
};

export const deleteCommunityPost = async (id: string) => {
  return communityService.deletePostAdmin(id);
};

export const deleteCommunityComment = async (id: string) => {
  return communityService.deleteCommentAdmin(id);
};

export const updateVariantPrice = async (variantId: string, data: UpdateVariantPriceDto) => {
  const variant = await dealsService.getVariantWithActivity(variantId);

  // Restriction 1: Past variants cannot be edited
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (variant.startDatetime && new Date(variant.startDatetime) < today) {
    throw new ConflictException("Past variants cannot be edited");
  }

  // Restriction 2: Active locks or bookings prevent editing
  if (variant._count.locks > 0) {
    throw new ConflictException("Cannot edit price while variant has active locks");
  }
  if (variant._count.bookings > 0) {
    throw new ConflictException("Cannot edit price while variant has confirmed or pending bookings");
  }

  return dealsService.updateVariantPriceAdmin(variantId, data.displayedPrice);
};
// ─── Moderation Functions ──────────────────────────────────────────────────────

export const getModerationPosts = async (query: AdminCommunityQueryDto) => {
  const result = await communityService.getPostsAdmin({
    limit: query.limit,
    page: query.page,
    reportFirst: query.reportFirst,
    search: query.search,
  });
  return paginatedAdminCommunityPostSchema.parse({
    data: result.items,
    total: result.total,
    page: query.page,
    limit: query.limit,
  });
};

export const getModerationReportedPosts = async (query: AdminCommunityQueryDto) => {
  const result = await communityService.getReportedPostsAdmin({ limit: query.limit, page: query.page });
  return paginatedAdminCommunityPostSchema.parse({
    data: result.items,
    page: query.page,
    limit: query.limit,
  });
};

export const getModerationReportedComments = async (
  query: AdminCommunityQueryDto
): Promise<PaginatedAdminCommunityReportedCommentDto> => {
  const result = await communityService.getReportedCommentsAdmin({ limit: query.limit, page: query.page });
  return paginatedAdminCommunityReportedCommentSchema.parse({
    data: result.items,
    page: query.page,
    limit: query.limit,
  });
};

export const getModerationCommentsForPost = async (postId: string, query: AdminCommunityQueryDto) => {
  const result = await communityService.getCommentsByPostIdAdmin(postId, { limit: query.limit, page: query.page, reportFirst: query.reportFirst });
  return paginatedAdminCommunityCommentSchema.parse({
    data: result.items,
    page: query.page,
    limit: query.limit,
  });
};
