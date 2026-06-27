import { Prisma } from "@prisma/client";

/**
 * ─── Review Detailed Include ───
 */
export const reviewDetailedInclude = {
  user: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.DealReviewInclude;

export type ReviewRecord = Prisma.DealReviewGetPayload<{
  include: typeof reviewDetailedInclude;
}>;
