import { z } from "zod";

export const userLocksQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).default(10),
});

export type UserLocksQueryDto = z.infer<typeof userLocksQuerySchema>;
