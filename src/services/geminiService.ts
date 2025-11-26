import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

export const generateAIResponse = async (prompt: string, history: any[] = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "SYSTEM ERROR: UNABLE TO ESTABLISH UPLINK.";
  }
};
