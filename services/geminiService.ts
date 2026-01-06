
import { GoogleGenAI, Type } from "@google/genai";
import { AdherenceLog, Medication } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function generatePatientSummary(
  patientName: string,
  medications: Medication[],
  logs: AdherenceLog[]
) {
  const prompt = `
    Analyze the medication adherence for patient ${patientName}.
    Medications prescribed: ${JSON.stringify(medications)}
    Recent logs: ${JSON.stringify(logs)}
    
    Provide:
    1. A risk assessment (Low/Medium/High)
    2. A brief 2-sentence summary of their behavior.
    3. Three specific recommendations for the doctor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: "low, medium, or high" },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["riskLevel", "summary", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      riskLevel: "medium",
      summary: "Unable to generate AI insights at this time. Manual review recommended.",
      recommendations: ["Check logs manually", "Verify medication stock", "Contact patient"]
    };
  }
}
