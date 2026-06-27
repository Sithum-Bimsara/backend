import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import type { 
  CreateDealRequestDto, 
  DealRequestQueryDto,
  UpdateDealRequestStatusDto 
} from "./deal-requests.dto";
import { dealRequestDetailedInclude, DealRequestRecord } from "./deal-requests.types";

/**
 * Creates a new deal request.
 */
export const createDealRequest = async (userId: string, data: CreateDealRequestDto): Promise<DealRequestRecord> => {
  return prisma.dealRequest.create({
    data: {
      userId,
      message: data.message,
      contactNumber: data.contactNumber,
    },
    include: dealRequestDetailedInclude,
  });
};

/**
 * Finds a deal request by ID.
 */
export const findDealRequestById = async (id: string): Promise<DealRequestRecord | null> => {
  return prisma.dealRequest.findUnique({
    where: { id },
    include: dealRequestDetailedInclude,
  });
};

/**
 * Updates a deal request status.
 */
export const updateDealRequestStatus = async (
  id: string, 
  data: UpdateDealRequestStatusDto
): Promise<DealRequestRecord> => {
  return prisma.dealRequest.update({
    where: { id },
    data: { status: data.status },
    include: dealRequestDetailedInclude,
  });
};

/**
 * Fetches deal requests with page-based pagination.
 */
export const getDealRequests = async (
  query: DealRequestQueryDto
): Promise<{ data: DealRequestRecord[]; total: number }> => {
  const { page = 1, limit = 10, status, search } = query;

  const where: Prisma.DealRequestWhereInput = {
    status,
    ...(search
      ? {
          OR: [
            { message: { contains: search, mode: "insensitive" } },
            { contactNumber: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.dealRequest.count({ where }),
    prisma.dealRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: dealRequestDetailedInclude,
    }),
  ]);

  return { data: items, total };
};
