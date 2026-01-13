import { GoogleGenAI } from "@google/genai";

// Shared Gemini client factory
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
