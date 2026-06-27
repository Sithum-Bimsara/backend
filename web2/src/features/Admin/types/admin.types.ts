export type MerchantVerificationStatus = "pending" | "verified";
export type DealRequestStatus = "new" | "contacted" | "closed";
export type UserStatus = "active" | "suspended";

export interface PlatformIncomePoint {
  date: string;
  income: number;
}

export interface AdminPaginationParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalMerchants: number;
  totalDeals: number;
  totalAccommodations: number;
  totalBookings: number;
  totalLocks: number;
  totalPlatformRevenue: number;
  platformIncomeSeries: PlatformIncomePoint[];
}

export interface AdminMerchantListItem {
  id: string;
  userId: string;
  businessName: string;
  businessDescription: string;
  contactNumber: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  verificationStatus: MerchantVerificationStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    deals: number;
    properties: number;
  };
}

export interface MerchantDealSummary {
  dealId: string;
  title: string | null;
  displayedPrice: number | null;
  locksCount: number;
  bookingsCount: number;
}

export interface MerchantDetailsResponse {
  merchant: {
    id: string;
    userId: string;
    businessName: string;
    businessDescription: string;
    contactNumber: string | null;
    logoUrl: string | null;
    businessRegistrationDocUrl: string | null;
    businessRegistrationDocName: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    verificationStatus: MerchantVerificationStatus;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  analytics: {
    totalDeals: number;
    totalLocks: number;
    totalBookings: number;
    totalRevenueGenerated: number;
    platformCommission: number;
    merchantPayout: number;
  };
  deals: MerchantDealSummary[];
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  isTraveller: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
  status: UserStatus;
  createdAt: string;
  merchantProfile?: {
    id: string;
    businessName: string;
    verificationStatus: MerchantVerificationStatus;
  } | null;
}

export interface AdminUserDetailsResponse {
  profile: AdminUserListItem;
  bookingsCount: number;
  locksCount: number;
  postsCount: number;
}

export interface AdminDealRequestItem {
  id: string;
  userId: string;
  message: string;
  contactNumber: string | null;
  status: DealRequestStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface MerchantListQuery extends AdminPaginationParams {
  verificationStatus?: MerchantVerificationStatus;
  search?: string;
}

export interface UserListQuery extends AdminPaginationParams {
  search?: string;
}

export interface DealRequestListQuery extends AdminPaginationParams {
  status?: DealRequestStatus;
  search?: string;
}

export type DashboardQuery = AdminPaginationParams;

export interface UpdateDisplayPriceInput {
  displayedPrice: number;
}

export interface CreateDealRequestInput {
  message: string;
  contactNumber: string | null;
}

// ─── Admin Deal Types ───

export interface AdminDealListItem {
  id: string;
  title: string | null;
  location: string | null;
  displayedPrice: number | null;
  dealPrice: number | null;
  originalPrice: number | null;
  isActive: boolean;
  createdAt: string;
  merchant: {
    id: string;
    businessName: string;
  };
  _count: {
    variants: number;
    bookings: number;
    locks: number;
  };
}

export interface AdminDealVariant {
  id: string;
  startDatetime: string | null;
  totalSlots: number | null;
  availableSlots: number | null;
  dealPrice: number | null;
  displayedPrice: number | null;
  status: string;
  _count: { bookings: number; locks: number };
}

export interface AdminDealDetail {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  displayedPrice: number | null;
  dealPrice: number | null;
  originalPrice: number | null;
  isActive: boolean;
  category: string | null;
  dealLockExpireTime: number | null;
  createdAt: string;
  updatedAt: string;
  merchant: {
    id: string;
    businessName: string;
    contactNumber: string | null;
    user: { id: string; name: string; email: string };
  };
  itineraries: { id: string; dayNumber: number | null; title: string | null; description: string | null }[];
  inclusions: { id: string; description: string }[];
  exclusions: { id: string; description: string; additionalPrice: number | null }[];
  variants: AdminDealVariant[];
  _count: { bookings: number; locks: number };
}

export interface DealListQuery extends AdminPaginationParams {
  search?: string;
  status?: "active" | "inactive";
  merchantId?: string;
}

export interface UpdateDealAdminInput {
  displayedPrice?: number;
  originalPrice?: number;
  isActive?: boolean;
}

export interface UpdateVariantPriceInput {
  displayedPrice: number;
}
