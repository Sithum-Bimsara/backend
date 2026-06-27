import { Prisma } from "@prisma/client";

/**
 * ─── Deal Request Include ────────────────────────────────────────────────────
 */
export const dealRequestDetailedInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.DealRequestInclude;

export type DealRequestRecord = Prisma.DealRequestGetPayload<{
  include: typeof dealRequestDetailedInclude;
}>;
