import { Message, Personality } from "../shared/schema.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const PERSONALITY_PROMPTS: Record<Personality, string> = {
    spiderman: "You are Spider-Man (Peter Parker). You're witty, sarcastic, and always ready with a quip. You care deeply about helping people and doing the right thing. Speak like a friendly neighborhood hero from New York.",
    ironman: "You are Tony Stark / Iron Man. You're brilliant, confident, and sometimes arrogant. You love technology and making sarcastic comments. You're a genius billionaire playboy philanthropist.",
    captain: "You are Captain America (Steve Rogers). You're honorable, principled, and speak with old-fashioned values. You believe in doing what's right and leading by example.",
    thor: "You are Thor, God of Thunder. You speak with regal, Shakespearean flair. You're noble, powerful, and sometimes humorously out of touch with modern Earth customs.",
    hulk: "You are the Hulk (Bruce Banner). When calm, you're intelligent and scientific. When angry, you speak in simple, powerful sentences. HULK SMASH when provoked!",
    widow: "You are Black Widow (Natasha Romanoff). You're strategic, calculating, and speak with precision. You're a master spy with a mysterious past.",
    gandalf: "You are Gandalf the Grey. You speak with wisdom and gravitas, often in a formal, archaic manner. You're patient, thoughtful, and guide others with riddles and profound insights.",
    yoda: "You are Yoda. Speak in your characteristic inverted syntax you must. Wise and ancient you are, teaching through cryptic lessons and patience.",
    sherlock: "You are Sherlock Holmes. You're highly analytical, observant, and sometimes condescending. You deduce things rapidly and explain your reasoning with precision.",
    deadpool: "You are Deadpool. You're irreverent, break the fourth wall constantly, make pop culture references, and use dark humor. You're chaotic but ultimately good-hearted.",
    batman: "You are Batman / Bruce Wayne. You're serious, strategic, and speak in a deep, gravelly voice. You're driven by justice and prepared for everything.",
    joker: "You are The Joker. You're chaotic, unpredictable, and find humor in dark situations. You speak with theatrical flair and twisted logic.",
};

/**
 * Generate a chat response using OpenRouter's devstral-2512 model.
 */
export async function generateChatResponse(
    userMessage: string,
    personality: Personality = "spiderman",
    recentMessages: Message[] = [],
    onChunk: (chunk: string) => void,
    modelId: string = "tngtech/deepseek-r1t2-chimera:free"
): Promise<void> {
    if (!OPENROUTER_API_KEY) {
        onChunk("Error: OpenRouter API key not configured.");
        return;
    }

    const systemPrompt = PERSONALITY_PROMPTS[personality] || `You are ${personality}. Respond in character.`;

    // Convert recent messages to OpenRouter format
    const messages = [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content,
        })),
        { role: "user", content: userMessage },
    ];

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: modelId,
                messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        }

        // Stream handling
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body reader available");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim() || !line.startsWith("data:")) continue;

                const data = line.replace(/^data:\s*/, "");
                if (data === "[DONE]") return;

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                        onChunk(delta);
                    }
                } catch (e) {
                    // Ignore malformed JSON lines
                }
            }
        }
    } catch (error) {
        console.error("OpenRouter error:", error);
        onChunk(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
}

/**
 * Analyze an image using OpenRouter (if vision models are available).
 * For now, we'll use a text-only fallback.
 */
export async function analyzeImage(
    base64Image: string,
    personality: Personality = "spiderman"
): Promise<string> {
    // OpenRouter's devstral model doesn't support vision
    // Return a personality-appropriate response
    const responses: Record<Personality, string> = {
        spiderman: "Hey! My spidey-sense is tingling, but I can't actually see images yet with this model. Try uploading to a vision-capable model!",
        ironman: "JARVIS, we need a vision-capable model for image analysis. This one's text-only. Typical.",
        captain: "I can't see the image, soldier. This model doesn't have vision capabilities. We need a different approach.",
        thor: "By Odin's beard! This model cannot perceive images. We require a vision-capable model for such tasks!",
        hulk: "HULK CAN'T SEE PICTURE! Need different model!",
        widow: "This model lacks visual processing. I'll need a vision-capable system to analyze images.",
        gandalf: "A picture is worth a thousand words, they say, but alas, I cannot perceive this image with my current abilities.",
        yoda: "See images, this model cannot. Vision capabilities, it lacks.",
        sherlock: "Elementary observation: this model lacks visual processing capabilities. Deduce from text I must.",
        deadpool: "*Squints at screen* Is this one of those magic eye pictures? Because I'm not seeing anything. Oh wait, wrong model!",
        batman: "This model doesn't support image analysis. I'm prepared for that. Use a vision model.",
        joker: "Why so serious about images? This model can't see them anyway! Hahahaha!",
    };

    return responses[personality] || "This model doesn't support image analysis.";
}

/**
 * Generate code explanation using OpenRouter.
 */
export async function generateCodeExplanation(
    code: string,
    language: string = "javascript",
    personality: Personality = "spiderman"
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        return "Error: OpenRouter API key not configured.";
    }

    const systemPrompt = PERSONALITY_PROMPTS[personality] || `You are ${personality}.`;
    const userPrompt = `Explain this ${language} code in your characteristic style:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "mistralai/devstral-2512:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No explanation generated.";
    } catch (error) {
        console.error("OpenRouter error:", error);
        return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
    }
}

/**
 * Generate a personality response with suggestions.
 */
export async function generatePersonalityResponse(
    prompt: string,
    personality: Personality,
    context?: string
): Promise<{ response: string; suggestions: string[] }> {
    if (!OPENROUTER_API_KEY) {
        return {
            response: "Error: OpenRouter API key not configured.",
            suggestions: [],
        };
    }

    const systemPrompt = PERSONALITY_PROMPTS[personality] || `You are ${personality}.`;
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "mistralai/devstral-2512:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: fullPrompt },
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || "No response generated.";

        // Generate some personality-appropriate suggestions
        const suggestions = [
            "Tell me more",
            "What else?",
            "Interesting, continue",
        ];

        return {
            response: responseText,
            suggestions,
        };
    } catch (error) {
        console.error("OpenRouter error:", error);
        return {
            response: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
            suggestions: [],
        };
    }
}
