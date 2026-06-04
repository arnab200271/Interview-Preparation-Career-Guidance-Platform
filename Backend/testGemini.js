import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_APY_KEY,
});

async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is Node.js?",
  });

  console.log(response.text);
}

test();