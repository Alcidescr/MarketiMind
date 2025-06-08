
import { GoogleGenAI, GenerateContentResponse, Part, GenerateContentParameters, Content } from "@google/genai";
import { AgentProfile, GroundingChunk } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

// Ensure API_KEY is handled by the environment, not in the code.
// For development, you might set this, but in production, it MUST be an environment variable.
// const API_KEY = "YOUR_API_KEY"; // DO NOT COMMIT THIS
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "Gemini API key not found. Please set the API_KEY environment variable. AI features will be disabled."
  );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

interface GenerationResult {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const generateContent = async (
  agentProfile: AgentProfile,
  userPrompt: string,
  previousContext?: string,
  useSearchGrounding: boolean = false
): Promise<GenerationResult> => {
  if (!ai) {
    return { text: "Gemini API not initialized. Please check API key." };
  }

  const fullPromptParts: Part[] = [];

  if (previousContext) {
    fullPromptParts.push({ text: `Previous context from other agents:\n${previousContext}\n\n---\n\nYour current task based on this context and the user's request:` });
  }
  fullPromptParts.push({ text: userPrompt });
  
  const contents: Content = { role: "user", parts: fullPromptParts };

  const requestParams: GenerateContentParameters = {
    model: GEMINI_MODEL_TEXT,
    contents: contents,
    config: {
      systemInstruction: agentProfile.systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    }
  };

  if (useSearchGrounding) {
    // IMPORTANT: When using googleSearch, remove other potentially conflicting configs like responseMimeType if they were added.
    // For this app, we are not explicitly setting responseMimeType, so it should be fine.
    requestParams.config = {
      ...requestParams.config,
      tools: [{ googleSearch: {} }],
    };
  } else {
     // For general tasks, ensure thinking is enabled by default (omit thinkingConfig or set budget > 0)
     // If you wanted to disable thinking for very low latency:
     // requestParams.config.thinkingConfig = { thinkingBudget: 0 };
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent(requestParams);
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    
    return { text, groundingChunks };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Error generating content.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
    // More specific error handling for GoogleGenAIError if needed
    return { text: errorMessage };
  }
};

// Example of how to parse JSON if model is asked to return JSON
// Not used directly in this version of generateContent but good for reference
export const parseJsonSafely = <T,>(jsonString: string): T | null => {
  let cleanJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanJsonString.match(fenceRegex);
  if (match && match[2]) {
    cleanJsonString = match[2].trim();
  }

  try {
    return JSON.parse(cleanJsonString) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original string:", jsonString);
    return null;
  }
};

export const isApiAvailable = (): boolean => !!ai;
    