import { prisma } from "../../config/prisma";
import { 
  merchantProfileDetailedInclude, 
  MerchantProfileRecord, 
  CreateMerchantProfileData, 
  UpdateMerchantProfileData,
  AdminMerchantProfileRecord,
  AdminMerchantPaginatedRecord,
  adminMerchantProfileInclude,
  adminMerchantPaginatedInclude,
  MerchantProfileWhereInput
} from "./merchant-profile.types";


// ─── Repository Methods ───────────────────────────────────────────────────────

export const createMerchantProfile = async (
  userId: string,
  data: CreateMerchantProfileData
): Promise<MerchantProfileRecord> => {
  return prisma.merchantProfile.create({
    data: {
      userId,
      ...data,
    },
    include: merchantProfileDetailedInclude,
  });
};

export const findMerchantProfileByUserId = async (userId: string): Promise<MerchantProfileRecord | null> => {
  return prisma.merchantProfile.findUnique({
    where: { userId },
    include: merchantProfileDetailedInclude,
  });
};

export const updateMerchantProfileByUserId = async (
  userId: string,
  data: UpdateMerchantProfileData
): Promise<MerchantProfileRecord> => {
  return prisma.merchantProfile.update({
    where: { userId },
    data,
    include: merchantProfileDetailedInclude,
  });
};

// ─── AdminQueries ───

export const countMerchants = async (where?: MerchantProfileWhereInput): Promise<number> => {
  return prisma.merchantProfile.count({ where });
};

export const findMerchantsPaginated = async (
  where: MerchantProfileWhereInput, 
  page: number, 
  limit: number
): Promise<AdminMerchantPaginatedRecord[]> => {
  return prisma.merchantProfile.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: "desc" },
    include: adminMerchantPaginatedInclude,
  });
};

export const updateMerchantVerification = async (
  id: string, 
  status: "verified" | "pending"
): Promise<AdminMerchantProfileRecord> => {
  return prisma.merchantProfile.update({
    where: { id },
    data: { verificationStatus: status },
    include: adminMerchantProfileInclude,
  });
};

export const getMerchantProfileById = async (id: string): Promise<AdminMerchantProfileRecord | null> => {
  return prisma.merchantProfile.findUnique({
    where: { id },
    include: adminMerchantProfileInclude,
  });
};
