export interface IIslandMin {
  id: string;
  name: string;
  categories: string[];
  firstImage: string | null;
  transferDetails: string[];
  costLocal: number;
  costNonLocal: number;
  bestFor: string;
  marineLifeZones: string[];
  createdAt: string;
}

export interface ISampleDayItem {
  time: string;
  description: string;
}

export interface IFoodAndDrinkDeal {
  name: string;
  description: string;
  price: number;
}

export interface IIslandFull {
  id: string;
  name: string;
  categories: string[];
  overview: string;
  bestFor: string;
  activities: string[];
  marineLifeZones: string[];
  nightlife: string;
  safetyText: string;
  internetText: string;
  transferDetails: string[];
  bestTimeMonths: string[]; // 12 elements: 'excellent' | 'good' | 'fair' | 'avoid'
  bestTimeTextBest?: string | null;
  bestTimeTextAvoid?: string | null;
  bestTimeTextTips?: string | null;
  costLocal: number;
  costNonLocal: number;
  costFoodDrinks: number;
  costActivities: number;
  costExtra: number;
  sampleDay: ISampleDayItem[] | null;
  foodAndDrinkDeals: IFoodAndDrinkDeal[] | null;
  insiderTips: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedIslandResponse {
  items: IIslandMin[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

import type { CreateIslandDto } from '../schemas/island.dto';

export type MonsoonalCondition = 'excellent' | 'good' | 'fair' | 'avoid';

export interface IslandFormDraft extends Omit<CreateIslandDto, 'costLocal' | 'costNonLocal' | 'costFoodDrinks' | 'costActivities' | 'costExtra' | 'bestTimeMonths'> {
  costLocal: number | "";
  costNonLocal: number | "";
  costFoodDrinks: number | "";
  costActivities: number | "";
  costExtra: number | "";
  bestTimeMonths: MonsoonalCondition[];
}

