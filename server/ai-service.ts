import { Message, Personality } from "../shared/schema.js";
import { AVAILABLE_MODELS, getModelsByCapability, isModelCompatible } from "./models.js";
import type { ModelConfig } from "../shared/schema.js";

// Get the current active model from environment or default
let currentModel = process.env.DEFAULT_MODEL || 'deepseek-r1t-chimera';

// Dynamic import - OpenRouter only
const getAIService = async (modelId?: string) => {
  return await import("./openrouter.js");
};

// Set the current active model
export function setCurrentModel(modelId: string): boolean {
  if (AVAILABLE_MODELS[modelId]) {
    currentModel = modelId;
    console.log(`Switched to model: ${modelId}`);
    return true;
  }
  return false;
}

// Get the current active model
export function getCurrentModel(): string {
  return currentModel;
}

// Get all available OpenRouter models
export async function getAvailableModels(): Promise<ModelConfig[]> {
  return Object.values(AVAILABLE_MODELS);
}

export async function generateChatResponse(
  userMessage: string,
  personality: Personality = "spiderman",
  recentMessages: Message[] = [],
  onChunk: (chunk: string) => void,
  modelId?: string
): Promise<void> {
  // Resolve the internal model key from the passed ID
  let targetKey = modelId || currentModel;
  let modelConfig = AVAILABLE_MODELS[targetKey];

  // If the passed ID is an OpenRouter ID (contains '/'), try to find the internal key, 
  // BUT if not found, treat the ID itself as the target for OpenRouter.
  if (modelId && modelId.includes('/')) {
    const foundEntry = Object.entries(AVAILABLE_MODELS).find(([_, config]) => config.id === modelId);
    if (foundEntry) {
      targetKey = foundEntry[0];
      modelConfig = foundEntry[1];
    } else {
      // Permissive Mode: If we can't find it in our config, but it looks like a valid ID, uses it directly.
      // Create a dummy config to satisfy types if needed, or just pass the ID.
      targetKey = modelId;
      modelConfig = {
        id: modelId,
        name: modelId.split('/')[1] || modelId,
        provider: 'openrouter',
        type: 'chat',
        capabilities: { chat: true, vision: true, code: true, streaming: true }, // Assume full capabilities
        performance: { speed: 'medium', quality: 'good', resourceUsage: 'medium' },
        requirements: { internetRequired: true, apiKey: true },
        contextLength: 4096,
        maxTokens: 4096,
        description: 'Custom/New Model'
      } as any;
    }
  }

  // Check compatibility only if it's a known internal key OR if we are resolving from defaults.
  // We skip strict compatibility check if we just created a permissive config above.
  if (AVAILABLE_MODELS[targetKey] && !isModelCompatible(targetKey, ['chat'])) {
    const errorMsg = `Model ${AVAILABLE_MODELS[targetKey]?.name || getModelName(modelId)} doesn't support chat. Please use a chat or multimodal model.`;
    onChunk(errorMsg);
    return;
  }

  const aiService = await getAIService(targetKey);

  // Pass the full OpenRouter ID to the actual service call
  return aiService.generateChatResponse(
    userMessage,
    personality,
    recentMessages,
    onChunk,
    modelConfig?.id || modelId || targetKey
  );
}

// Helper to reliably get a name
function getModelName(id?: string) {
  if (!id) return "Unknown Model";
  const found = Object.values(AVAILABLE_MODELS).find(m => m.id === id);
  return found ? found.name : id;
}

export async function analyzeImage(
  base64Image: string,
  personality: Personality = 'spiderman',
  visionModel?: string
): Promise<string> {
  const aiService = await getAIService();
  return aiService.analyzeImage(base64Image, personality);
}

export async function generateCodeExplanation(
  code: string,
  language: string = "javascript",
  personality: Personality = "spiderman",
  modelId?: string
): Promise<string> {
  const targetModel = modelId || currentModel;

  // Check if the model supports code analysis
  if (!isModelCompatible(targetModel, ['code'])) {
    return `Model ${AVAILABLE_MODELS[targetModel]?.name || targetModel} doesn't support code analysis. Please use a chat or multimodal model.`;
  }

  const aiService = await getAIService(targetModel);
  return aiService.generateCodeExplanation(code, language, personality);
}

export async function generatePersonalityResponse(
  prompt: string,
  personality: Personality,
  context?: string,
  modelId?: string
): Promise<{ response: string; suggestions: string[] }> {
  const targetModel = modelId || currentModel;

  // Check if the model supports chat
  if (!isModelCompatible(targetModel, ['chat'])) {
    return {
      response: `Model ${AVAILABLE_MODELS[targetModel]?.name || targetModel} doesn't support text conversations. Please use a chat or multimodal model.`,
      suggestions: ["Switch to a chat model", "Try a multimodal model", "Use for image analysis instead"]
    };
  }

  const aiService = await getAIService(targetModel);
  return aiService.generatePersonalityResponse(prompt, personality, context);
}
