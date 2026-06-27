import * as repo from "./user-profile.repository";
import { 
  UpdateUserProfileDto, 
  ViewUserProfileDto, 
  ViewUserPhoneVerificationDto,
  viewUserProfileSchema,
  viewUserPhoneVerificationSchema,
  UserLocksQueryDto,
  ViewUserDealLockDto,
  ViewUserAccommodationLockDto,
  viewUserDealLockSchema,
  viewUserAccommodationLockSchema,
  viewUserAccommodationLockDetailResponseSchema,
  ViewUserAccommodationLockDetailResponseDto
} from "./user-profile.dto";
import { UserWhereInput } from "./user-profile.types";
import { NotFoundException } from "../../exceptions/not-found.exception";
import * as dealLockService from "../deals/services/deal-lock.service";
import * as accommodationLockService from "../accommodation/services/accommodation-lock.service";
import * as publicDealsService from "../public-deals/public-deals.service";

/**
 * Fetches user profile data with strict output validation.
 */
export const getUserProfile = async (userId: string): Promise<ViewUserProfileDto> => {
  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundException("User not found");
  
  return viewUserProfileSchema.parse(user);
};

/**
 * Updates user profile data with strict output validation.
 */
export const updateUserProfile = async (userId: string, data: UpdateUserProfileDto): Promise<ViewUserProfileDto> => {
  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundException("User not found");

  const result = await repo.updateUserById(userId, data);
  return viewUserProfileSchema.parse(result);
};

/**
 * Verifies a user's phone number with strict output validation.
 */
export const verifyPhone = async (userId: string, phone: string): Promise<ViewUserPhoneVerificationDto> => {
  const result = await repo.verifyPhone(userId, phone);
  return viewUserPhoneVerificationSchema.parse(result);
};

/**
 * Checks if a user is an admin in the system.
 */
export const getUserIsAdmin = async (userId: string): Promise<boolean> => {
  return repo.getUserIsAdmin(userId);
};

/**
 * Retrieves all admins in the system.
 */
export const getAdmins = async () => {
  return repo.getAdmins();
};

/**
 * Counts total users matching query conditions.
 */
export const countUsers = async (where?: UserWhereInput): Promise<number> => {
  return repo.countUsers(where);
};

/**
 * Lists users with offset-based pagination.
 */
export const findUsersPaginated = async (where: UserWhereInput, page: number = 1, limit: number = 10) => {
  return repo.findUsersPaginated(where, page, limit);
};

/**
 * Updates a user's verification/suspension status.
 */
export const updateUserStatus = async (id: string, status: "active" | "suspended") => {
  const user = await repo.findUserById(id);
  if (!user) throw new NotFoundException("User not found");
  return repo.updateUserStatus(id, status);
};

/**
 * Retrieves complete user details with related profile information.
 */
export const getUserWithProfile = async (id: string) => {
  const user = await repo.getUserWithProfile(id);
  if (!user) throw new NotFoundException("User not found");
  return user;
};

/**
 * Retrieves paginated deal locks for the authenticated user, calling the deals service and verifying output with view schemas.
 */
export const getUserDealLocks = async (
  userId: string,
  query: UserLocksQueryDto
): Promise<{ data: ViewUserDealLockDto[]; total: number }> => {
  const result = await dealLockService.getUserDealLocks(userId, query);
  const validatedData = result.data.map((item) =>
    viewUserDealLockSchema.parse(item)
  );
  return { data: validatedData, total: result.total };
};

/**
 * Retrieves paginated accommodation locks for the authenticated user, calling the accommodation service and verifying output with view schemas.
 */
export const getUserAccommodationLocks = async (
  userId: string,
  query: UserLocksQueryDto
): Promise<{ data: ViewUserAccommodationLockDto[]; total: number }> => {
  const result = await accommodationLockService.getUserAccommodationLocks(userId, query);
  const validatedData = result.data.map((item) =>
    viewUserAccommodationLockSchema.parse(item)
  );
  return { data: validatedData, total: result.total };
};

/**
 * Retrieves the accommodation lock detail and concurrently its associated public property detail.
 */
export const getAccommodationLockDetailWithProperty = async (
  userId: string,
  lockId: string,
  isLocal: boolean
): Promise<ViewUserAccommodationLockDetailResponseDto> => {
  const lock = await accommodationLockService.getAccommodationLockDetail(userId, lockId);
  const property = await publicDealsService.getPropertyDetail(lock.propertyId, userId, isLocal);
  
  return viewUserAccommodationLockDetailResponseSchema.parse({ lock, property });
};
