
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Analyze this person's face shape and provide 3 hairstyle suggestions that would look great on them. Focus on high-fashion and classic styles. Return the results as structured JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faceShape: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                suitability: { type: Type.STRING },
              },
              required: ["name", "description", "suitability"],
            },
          },
        },
        required: ["faceShape", "suggestions"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse analysis result:", error);
    throw new Error("Could not analyze face properly.");
  }
};

export const transformHairstyle = async (base64Image: string, hairstylePrompt: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Modify the person's hairstyle in the provided image to be: ${hairstylePrompt}. Maintain the exact same facial features, lighting, and background. Only change the hair. The result should look professional, realistic, and like a studio portrait.`,
        },
      ],
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No response from AI");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from AI");
};
