import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const generateAIResponse = async (prompt: string, history: any[] = []) => {
  try {
    if (!apiKey) {
      console.warn("Gemini API key is missing. AI features will be disabled.");
      return "SYSTEM ALERT: API KEY MISSING. UPLINK FAILED.";
    }

    const client = new GoogleGenAI({ apiKey });
    
    // The new SDK uses client.models.generateContent
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    // Access the response text safely
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "NO DATA RECEIVED";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "SYSTEM ERROR: UNABLE TO ESTABLISH UPLINK.";
  }
};
