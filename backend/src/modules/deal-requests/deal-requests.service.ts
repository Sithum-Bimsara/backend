import * as repo from "./deal-requests.repository";
import { 
  CreateDealRequestDto, 
  ViewDealRequestDto, 
  viewDealRequestSchema,
  DealRequestQueryDto,
  UpdateDealRequestStatusDto,
} from "./deal-requests.dto";
import { NotFoundException } from "../../exceptions/not-found.exception";


/**
 * Business logic for submitting a deal request.
 */
export const submitDealRequest = async (
  userId: string, 
  data: CreateDealRequestDto
): Promise<ViewDealRequestDto> => {
  const result = await repo.createDealRequest(userId, data);
  return viewDealRequestSchema.parse(result);
};

/**
 * Retrieves a deal request by its ID.
 */
export const findDealRequestById = async (id: string): Promise<ViewDealRequestDto> => {
  const result = await repo.findDealRequestById(id);
  if (!result) throw new NotFoundException("Deal request not found");
  return viewDealRequestSchema.parse(result);
};

/**
 * Retrieves a paginated list of deal requests.
 */
export const getDealRequests = async (
  query: DealRequestQueryDto
): Promise<{ data: ViewDealRequestDto[]; total: number }> => {
  const { data, total } = await repo.getDealRequests(query);
  const parsedData = data.map((item) => viewDealRequestSchema.parse(item));
  return { data: parsedData, total };
};

/**
 * Updates status of a deal request.
 */
export const updateDealRequestStatus = async (
  id: string, 
  data: UpdateDealRequestStatusDto
): Promise<ViewDealRequestDto> => {
  const exists = await repo.findDealRequestById(id);
  if (!exists) throw new NotFoundException("Deal request not found");
  const result = await repo.updateDealRequestStatus(id, data);
  return viewDealRequestSchema.parse(result);
};



