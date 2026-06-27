// ─── View Types (Output Shaping Only) ────────────────────────────────────────

export interface IMerchantProfile {
  id: string;
  userId: string;
  businessName: string;
  businessDescription: string;
  verificationStatus: "pending" | "verified";
  contactNumber: string;
  businessRegistrationDocUrl: string | null;
  businessRegistrationDocName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
}

export interface IEarningsOverviewDay {
  date: string;
  dealsEarnings: number;
  accEarnings: number;
  totalEarnings: number;
}

export interface ITopPerformingProduct {
  id: string;
  name: string;
  type: "deal" | "accommodation";
  earnings: number;
  bookingsCount: number;
}

export interface IMerchantOverallAnalytics {
  activeDealsCount: number;
  activeLockedSlots: number;
  bookingsCount: number;
  estimatedEarnings: number;
  dealsEarnings: number;
  accommodationEarnings: number;
  earningsOverview: IEarningsOverviewDay[];
  topPerforming: ITopPerformingProduct[];
  
  // Legacy / Backward Compatibility Fields
  overall: {
    totalEarnings: number;
    totalBookings: number;
    totalLocks: number;
  };
  dealsBreakdown: {
    dealId: string;
    title: string;
    bookingsCount: number;
    locksCount: number;
    earnings: number;
  }[];
  timeSeriesRevenue: {
    date: string;
    earnings: number;
  }[];
}
