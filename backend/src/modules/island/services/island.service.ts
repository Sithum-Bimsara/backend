import * as repo from "../repositories/island.repository";
import { NotFoundException } from "../../../exceptions/not-found.exception";
import {
  CreateIslandDto,
  UpdateIslandDto,
  IslandQueryDto,
  ViewIslandMinDto,
  ViewIslandFullDto,
  PaginatedIslandResponseDto,
  viewIslandMinSchema,
  viewIslandFullSchema,
  paginatedIslandResponseSchema,
} from "../dtos/island.dto";

const mapMinIsland = (island: any): ViewIslandMinDto => {
  return viewIslandMinSchema.parse({
    id: island.id,
    name: island.name,
    categories: island.categories,
    firstImage: island.images && island.images.length > 0 ? island.images[0] : null,
    transferDetails: island.transferDetails,
    costLocal: island.costLocal,
    costNonLocal: island.costNonLocal,
    bestFor: island.bestFor,
    marineLifeZones: island.marineLifeZones,
    createdAt: island.createdAt,
  });
};

const mapFullIsland = (island: any): ViewIslandFullDto => {
  return viewIslandFullSchema.parse({
    id: island.id,
    name: island.name,
    categories: island.categories,
    overview: island.overview,
    bestFor: island.bestFor,
    activities: island.activities,
    marineLifeZones: island.marineLifeZones,
    nightlife: island.nightlife,
    safetyText: island.safetyText,
    internetText: island.internetText,
    transferDetails: island.transferDetails,
    bestTimeMonths: island.bestTimeMonths,
    bestTimeTextBest: island.bestTimeTextBest,
    bestTimeTextAvoid: island.bestTimeTextAvoid,
    bestTimeTextTips: island.bestTimeTextTips,
    costLocal: island.costLocal,
    costNonLocal: island.costNonLocal,
    costFoodDrinks: island.costFoodDrinks,
    costActivities: island.costActivities,
    costExtra: island.costExtra,
    sampleDay: island.sampleDay,
    foodAndDrinkDeals: island.foodAndDrinkDeals,
    insiderTips: island.insiderTips,
    images: island.images,
    createdAt: island.createdAt,
    updatedAt: island.updatedAt,
  });
};

export const getIslandById = async (id: string): Promise<ViewIslandFullDto> => {
  const island = await repo.getIslandById(id);
  if (!island) {
    throw new NotFoundException("Island not found");
  }
  return mapFullIsland(island);
};

export const getIslandsByIds = async (ids: string[]): Promise<ViewIslandFullDto[]> => {
  if (ids.length === 0) return [];
  const records = await repo.findManyByIds(ids);
  return records.map((r) => mapFullIsland(r));
};

export const getIslandsWithPagination = async (query: IslandQueryDto): Promise<PaginatedIslandResponseDto> => {
  const result = await repo.findManyWithPagination(query);
  const items = result.items.map((item) => mapMinIsland(item));

  return paginatedIslandResponseSchema.parse({
    items,
    totalItems: result.totalItems,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
  });
};

export const getSuitableIslands = async (
  categories: string[],
  activities: string[]
): Promise<ViewIslandMinDto[]> => {
  const allIslands = await repo.findAllForMatching();

  // Score each island based on matching categories (weight 2) and activities (weight 1)
  const scoredIslands = allIslands
    .map((island) => {
      let score = 0;

      // Category matching
      if (categories.length > 0) {
        const matchingCategories = island.categories.filter((cat) =>
          categories.includes(cat)
        );
        score += matchingCategories.length * 2;
      }

      // Activity matching
      if (activities.length > 0) {
        const matchingActivities = island.activities.filter((act) =>
          activities.includes(act)
        );
        score += matchingActivities.length * 1;
      }

      return { island, score };
    })
    // Filter out islands with 0 score (only if filters are applied)
    .filter((item) => {
      if (categories.length === 0 && activities.length === 0) {
        return true; // if no criteria is selected, show all
      }
      return item.score > 0;
    })
    // Sort descending by score, then by name asc
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.island.name.localeCompare(b.island.name);
    })
    // Return top 6
    .slice(0, 6)
    .map((item) => mapMinIsland(item.island));

  return scoredIslands;
};

export const createIsland = async (dto: CreateIslandDto): Promise<ViewIslandFullDto> => {
  const record = await repo.createIsland(dto);
  return mapFullIsland(record);
};

export const updateIsland = async (id: string, dto: UpdateIslandDto): Promise<ViewIslandFullDto> => {
  const existing = await repo.getIslandById(id);
  if (!existing) {
    throw new NotFoundException("Island not found");
  }
  const record = await repo.updateIsland(id, dto);
  return mapFullIsland(record);
};

export const deleteIsland = async (id: string): Promise<void> => {
  const existing = await repo.getIslandById(id);
  if (!existing) {
    throw new NotFoundException("Island not found");
  }
  await repo.deleteIsland(id);
};
