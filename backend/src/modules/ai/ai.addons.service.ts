import { GoogleGenerativeAI } from "@google/generative-ai";
import { retry } from "./ai.retry";
import type { GenerateAddOnsDto } from "./ai.dtos";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const TIMEOUT_MS = 25000;

const withTimeout = async <T>(promise: Promise<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI_TIMEOUT")), TIMEOUT_MS);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const extractJSON = (text: string) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("INVALID_JSON_FROM_AI");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

export interface GenerateAddOnsInput extends GenerateAddOnsDto {
  itineraries?: { dayNumber: number; title?: string; description?: string }[];
}

export interface GenerateAddOnsOutput {
  inclusions: { description: string }[];
  exclusions: { description: string; additionalPrice: number }[];
}

const normalizeNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed * 100) / 100;
};

const normalizeCappedNumber = (value: unknown, fallback: number, cap?: number) => {
  const normalized = normalizeNumber(value, fallback);
  if (typeof cap !== "number" || !Number.isFinite(cap)) {
    return normalized;
  }
  return Math.min(normalized, Math.max(0, Math.round(cap * 100) / 100));
};

const normalizeOutput = (raw: any): GenerateAddOnsOutput => {
  const inclusions = Array.isArray(raw?.inclusions)
    ? raw.inclusions
        .map((item: any) => ({
          description: String(item?.description || "").trim(),
        }))
        .filter((item: { description: string }) => item.description)
    : [];

  const exclusions = Array.isArray(raw?.exclusions)
    ? raw.exclusions
        .map((item: any) => ({
          description: String(item?.description || "").trim(),
          additionalPrice: normalizeNumber(item?.additionalPrice, 0),
        }))
        .filter((item: { description: string }) => item.description)
    : [];

  return {
    inclusions,
    exclusions,
  };
};

/**
 * Generates rule-based realistic inclusions & exclusions when the Gemini API is blocked/unavailable.
 */
const generateFallbackAddOns = (input: GenerateAddOnsInput): GenerateAddOnsOutput => {
  const titleLower = (input.title || "").toLowerCase();
  const descLower = (input.description || "").toLowerCase();
  const price = input.displayedPrice ?? input.dealPrice ?? 100;

  const inclusions: { description: string }[] = [];
  const exclusions: { description: string; additionalPrice: number }[] = [];

  // Core defaults
  inclusions.push({ description: "English-speaking local guide / host coordinator" });
  inclusions.push({ description: "Complimentary mineral water and fresh towels" });

  if (
    titleLower.includes("snorkel") ||
    descLower.includes("snorkel") ||
    titleLower.includes("dive") ||
    descLower.includes("dive") ||
    titleLower.includes("shark")
  ) {
    inclusions.push({ description: "Premium snorkeling/diving gear rental (mask, snorkel, fins)" });
    inclusions.push({ description: "Standard marine safety briefing and life jacket" });
    exclusions.push({
      description: "Underwater action camera (GoPro) rental with raw media files",
      additionalPrice: Math.round(price * 0.15) || 20,
    });
    exclusions.push({
      description: "Advanced full-face snorkeling mask upgrade",
      additionalPrice: 15,
    });
  } else if (
    titleLower.includes("dinner") ||
    descLower.includes("dinner") ||
    titleLower.includes("food") ||
    descLower.includes("dining")
  ) {
    inclusions.push({ description: "Pre-arranged table setup and romantic beach decorations" });
    exclusions.push({
      description: "Premium beverage pairing or bottle of sparkling juice",
      additionalPrice: Math.round(price * 0.2) || 25,
    });
    exclusions.push({
      description: "Gourmet fresh lobster dinner menu upgrade",
      additionalPrice: Math.round(price * 0.35) || 50,
    });
  } else if (
    titleLower.includes("cruise") ||
    titleLower.includes("boat") ||
    descLower.includes("cruise") ||
    descLower.includes("boat")
  ) {
    inclusions.push({ description: "Shared speedboat transfer or Dhoni cruise entry ticket" });
    exclusions.push({
      description: "Private cruise deck seating / cabin upgrade",
      additionalPrice: Math.round(price * 0.3) || 45,
    });
    exclusions.push({
      description: "Private speedboat charter customization upgrade",
      additionalPrice: Math.round(price * 1.5) || 150,
    });
  } else {
    inclusions.push({ description: "Basic entry tickets and destination coordination" });
    exclusions.push({
      description: "Hotel roundtrip speedboat transfer service",
      additionalPrice: Math.round(price * 0.25) || 30,
    });
    exclusions.push({
      description: "Private custom guide / translator escort service",
      additionalPrice: Math.round(price * 0.3) || 40,
    });
  }

  // Sanity check: ensure exclusions have valid prices
  exclusions.forEach((ex) => {
    if (ex.additionalPrice <= 0) {
      ex.additionalPrice = 15;
    }
  });

  return { inclusions, exclusions };
};

export const generateAddOnsAI = async (
  input: GenerateAddOnsInput
): Promise<GenerateAddOnsOutput> => {
  // If GEMINI_API_KEY is not defined or is dummy/default, immediately use the fallback generator
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_")) {
    console.warn("Gemini API key is not configured. Using rule-based fallback generator.");
    return generateFallbackAddOns(input);
  }

  try {
    const priceCap =
      typeof input.displayedPrice === "number"
        ? input.displayedPrice
        : typeof input.dealPrice === "number"
        ? input.dealPrice
        : undefined;

    const itineraryContext = (input.itineraries || [])
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(
        (item) =>
          `Day ${item.dayNumber}: ${item.title || `Day ${item.dayNumber}`} - ${
            item.description || ""
          }`
      )
      .join("\n");
    const itinerarySection = itineraryContext
      ? `\nItinerary context:\n${itineraryContext}\n`
      : "";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const result = await retry(async () => {
      const prompt = `
        You are a travel package pricing expert.

        Return ONLY JSON in this format:
        {
          "inclusions":[{"description":""}],
          "exclusions":[{"description":"","additionalPrice":0}]
        }

        Trip info:
        Deal name: ${input.title}
        Location: ${input.location}
        Days: ${input.durationDays}
        Deal price: ${input.dealPrice ?? "N/A"}
        Displayed price: ${input.displayedPrice ?? "N/A"}
        Description: ${input.description || ""}
        Notes: ${input.notes || ""}
        ${itinerarySection}

        Rules:
        - Generate inclusions the traveler gets without extra cost. Do not include prices for inclusions.
        - Generate exclusions that are optional add-ons or items not included, with realistic extra prices.
        - Exclusion prices must never exceed the deal's displayed price when present, otherwise the deal price.
        - Keep descriptions practical and specific to the deal and itinerary.
        - Output only valid JSON.
      `;

      const response = await withTimeout(model.generateContent(prompt));
      const text = response.response.text();
      if (!text.trim()) {
        throw new Error("EMPTY_AI_RESPONSE");
      }

      return extractJSON(text);
    });

    const normalized = normalizeOutput(result);

    return {
      inclusions: normalized.inclusions,
      exclusions: normalized.exclusions.map((item) => ({
        description: item.description,
        additionalPrice: normalizeCappedNumber(item.additionalPrice, 0, priceCap),
      })),
    };
  } catch (error) {
    console.error("AI add-ons generation failed, falling back to rule-based generation. Error:", error);
    // Graceful fallback to avoid breaking the merchant flow
    return generateFallbackAddOns(input);
  }
};
