import { prisma } from "../../../config/prisma";
import { CreateIslandDto, UpdateIslandDto, IslandQueryDto } from "../dtos/island.dto";

export const getIslandById = async (id: string) => {
  return prisma.island.findUnique({
    where: { id },
  });
};

export const findManyByIds = async (ids: string[]) => {
  return prisma.island.findMany({
    where: {
      id: { in: ids },
    },
  });
};

export const findAllForMatching = async () => {
  return prisma.island.findMany({
    select: {
      id: true,
      name: true,
      categories: true,
      activities: true,
      bestFor: true,
      transferDetails: true,
      costLocal: true,
      costNonLocal: true,
      images: true,
      marineLifeZones: true,
      createdAt: true,
    },
  });
};

export const findManyWithPagination = async (query: IslandQueryDto) => {
  const { limit, page, search } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { overview: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, totalItems] = await Promise.all([
    prisma.island.findMany({
      where,
      take: limit,
      skip,
      orderBy: { name: "asc" },
    }),
    prisma.island.count({ where }),
  ]);

  return {
    items,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  };
};

export const createIsland = async (data: CreateIslandDto) => {
  return prisma.island.create({
    data: {
      name: data.name,
      categories: data.categories,
      overview: data.overview,
      bestFor: data.bestFor,
      activities: data.activities,
      marineLifeZones: data.marineLifeZones,
      nightlife: data.nightlife,
      safetyText: data.safetyText,
      internetText: data.internetText,
      transferDetails: data.transferDetails,
      bestTimeMonths: data.bestTimeMonths,
      bestTimeTextBest: data.bestTimeTextBest || null,
      bestTimeTextAvoid: data.bestTimeTextAvoid || null,
      bestTimeTextTips: data.bestTimeTextTips || null,
      costLocal: data.costLocal,
      costNonLocal: data.costNonLocal,
      costFoodDrinks: data.costFoodDrinks,
      costActivities: data.costActivities,
      costExtra: data.costExtra,
      sampleDay: data.sampleDay || undefined,
      foodAndDrinkDeals: data.foodAndDrinkDeals || undefined,
      insiderTips: data.insiderTips || [],
      images: data.images || [],
    },
  });
};

export const updateIsland = async (id: string, data: UpdateIslandDto) => {
  return prisma.island.update({
    where: { id },
    data: {
      name: data.name,
      categories: data.categories,
      overview: data.overview,
      bestFor: data.bestFor,
      activities: data.activities,
      marineLifeZones: data.marineLifeZones,
      nightlife: data.nightlife,
      safetyText: data.safetyText,
      internetText: data.internetText,
      transferDetails: data.transferDetails,
      bestTimeMonths: data.bestTimeMonths,
      bestTimeTextBest: data.bestTimeTextBest,
      bestTimeTextAvoid: data.bestTimeTextAvoid,
      bestTimeTextTips: data.bestTimeTextTips,
      costLocal: data.costLocal,
      costNonLocal: data.costNonLocal,
      costFoodDrinks: data.costFoodDrinks,
      costActivities: data.costActivities,
      costExtra: data.costExtra,
      sampleDay: data.sampleDay !== undefined ? (data.sampleDay as any) : undefined,
      foodAndDrinkDeals: data.foodAndDrinkDeals !== undefined ? (data.foodAndDrinkDeals as any) : undefined,
      insiderTips: data.insiderTips,
      images: data.images,
    },
  });
};

export const deleteIsland = async (id: string) => {
  await prisma.island.delete({
    where: { id },
  });
};
