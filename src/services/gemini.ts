import { GoogleGenAI, Modality } from "@google/genai";
import { RestorationOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const restoreImage = async (
  base64Image: string,
  options: RestorationOptions
): Promise<string> => {
  try {
    // Strip the data:image/jpeg;base64, prefix if present for the API call
    const base64Data = base64Image.split(',')[1] || base64Image;
    // Determine mime type from the prefix if possible, default to jpeg
    const mimeMatch = base64Image.match(/^data:(.*);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    let prompt = "High quality photo restoration.";
    
    const tasks = [];
    if (options.fixDamage) tasks.push("remove scratches, creases, dust spots, and tears");
    if (options.enhanceDetails) tasks.push("sharpen details, denoise, and improve clarity significantly");
    if (options.colorize) tasks.push("colorize this image naturally and realistically");

    if (tasks.length > 0) {
        prompt += ` Please ${tasks.join(", ")}.`;
    }

    prompt += " Maintain the original composition and facial features accurately. Output a high-resolution restored image.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
        // Re-attach prefix for browser display
        return `data:image/png;base64,${part.inlineData.data}`;
    }

    throw new Error("No image data received from the model.");

  } catch (error) {
    console.error("Restoration failed:", error);
    throw error;
  }
};
