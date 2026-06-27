// 1. Change the import to the official library
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { retry } from "./ai.retry";

// 2. Initialize the client correctly
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

export interface GenerateItineraryInput {
  title: string;
  description?: string;
  location: string;
  durationDays: number;
  generationDay?: number;
  previousItineraries?: { dayNumber: number; title: string; description?: string }[];
  futureItineraries?: { dayNumber: number; title: string; description?: string }[];
  travelerType: string;
  travelStyle: string;
  accommodationLevel: string;
  highlights: string;
  pace: "relaxed" | "balanced" | "packed";
  notes?: string;
}

export interface GenerateItineraryOutput {
  itineraries: { dayNumber: number; title: string; description: string }[];
}

const normalizeOutput = (
  raw: any,
  fallbackDays: number,
  generationDay?: number
): GenerateItineraryOutput => {
  const itineraries = Array.isArray(raw?.itineraries)
    ? raw.itineraries
        .map((item: any, index: number) => ({
          dayNumber: Number(item?.dayNumber) > 0 ? Number(item.dayNumber) : index + 1,
          title: String(item?.title || `Day ${index + 1}`),
          description: String(item?.description || ""),
        }))
        .slice(0, Math.max(1, fallbackDays))
    : [];

  let safeItineraries = itineraries.length
    ? itineraries
    : Array.from({ length: Math.max(1, fallbackDays) }, (_, index) => ({
        dayNumber: index + 1,
        title: `Day ${index + 1}`,
        description: "AI could not generate this day. Please add details manually.",
      }));

  if (generationDay && generationDay > 0) {
    const matchedDay =
      safeItineraries.find((item: any) => item.dayNumber === generationDay) || safeItineraries[0];

    safeItineraries = [
      {
        dayNumber: generationDay,
        title: matchedDay.title,
        description: matchedDay.description,
      },
    ];
  }

  return { itineraries: safeItineraries };
};

export const generateItineraryAI = async (
  input: GenerateItineraryInput
): Promise<GenerateItineraryOutput> => {
  console.log("Current Key Start:", process.env.GEMINI_API_KEY?.substring(0, 8))
  try {
    // Initialize the specific model
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.35,
        }
    });

    const previousDaysContext = (input.previousItineraries || [])
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((item) => `Day ${item.dayNumber}: ${item.title} - ${item.description || ""}`)
      .join("\n");

    const futureDaysContext = (input.futureItineraries || [])
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((item) => `Day ${item.dayNumber}: ${item.title} - ${item.description || ""}`)
      .join("\n");

    const dayContextRule = input.generationDay
      ? input.generationDay === 1
        ? "This is the first day edit: prioritize future days context only."
        : input.generationDay === input.durationDays
        ? "This is the last day edit: prioritize previous days context only."
        : "This is a middle day edit: use both previous and future day contexts."
      : "No specific day requested: generate full itinerary.";

    const daySpecificInstruction = input.generationDay
      ? `Generate only Day ${input.generationDay} in the itineraries array.`
      : `Generate full itinerary for all ${input.durationDays} days.`;

    const result = await retry(async () => {
      const prompt = `
        You are a tour operator writing a day-by-day itinerary for customers.
        Return ONLY JSON in this format:
        {
          "itineraries":[{"dayNumber":1,"title":"Arrival and Welcome Breakfast","description":"- You will be welcomed at the airport by our friendly representative.\n- Our team will assist you to your transfer and guide you to your accommodation.\n- You will enjoy a relaxing welcome breakfast to start the trip."}]
        }

        STYLE RULES for description points (follow exactly):
        - Write each point as a complete, natural sentence.
        - Start each sentence with a hyphen and a space: "- "
        - Write from the tour operator's perspective: use "You will...", "We will...", "Our team will..."
        - Each sentence = one point, separated by newline (\\n).
        - 4 to 7 sentences per day.
        - Keep each sentence concise but warm and vivid — 1 to 2 lines max.
        - Do NOT include "Day X:" or the title in the description.
        - Do NOT use bullet symbols, numbers, or dashes.

        STRICT RULE — MOST IMPORTANT:
        - ONLY write about the activities listed in "Day highlights". Do NOT invent or add any activities not mentioned there.
        - If the merchant only says "arrival + breakfast", only describe arrival and breakfast. Do NOT add walks, dinners, massages, sunsets, or anything not listed.
        - You may expand each highlight into 1-2 descriptive sentences, but DO NOT add new highlights.
        - DO NOT mention specific airport names, resort names, or island names unless they are explicitly provided in the "Day highlights" or "Trip info". If a highlight says "arrival", just say "the airport".

        Trip info:
        Deal name: ${input.title}
        Location: ${input.location}
        Days: ${input.durationDays}
        Traveler type: ${input.travelerType}
        Travel style: ${input.travelStyle}
        Accommodation: ${input.accommodationLevel}
        Pace: ${input.pace}
        Day highlights: ${input.highlights}
        Notes: ${input.notes || "None"}
        Previous days context: ${previousDaysContext || "None"}
        Future days context: ${futureDaysContext || "None"}

        ${daySpecificInstruction}
        ${dayContextRule}
      `;

      // Correct way to call generateContent
      const response = await withTimeout(model.generateContent(prompt));
      const text = response.response.text(); // Get text from response object
      
      if (!text.trim()) {
        throw new Error("EMPTY_AI_RESPONSE");
      }

      return extractJSON(text);
    });

    return normalizeOutput(result, input.durationDays, input.generationDay);
  } catch (error) {
    console.error("AI itinerary error:", error);
    throw new Error("Failed to generate itinerary");
  }
};