import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY); 

// Select the Gemini model you want to use; adjust model name as needed
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export { geminiModel };
