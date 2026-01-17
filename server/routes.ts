import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";

import { users, personalityEnum } from "../shared/schema.js";
import { generateChatResponse, analyzeImage } from "./ai-service.js";
import { AVAILABLE_MODELS } from "./models.js";
import { z } from "zod";
import multer from "multer";



const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const chatRequestSchema = z.object({
  message: z.string().min(1),
  personality: personalityEnum.default("spiderman"),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  modelId: z.string().optional(),
});

const imageAnalysisSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  personality: personalityEnum.optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create user
  app.post("/api/users", async (req, res) => {
    try {
      const { username, nickname, avatar } = req.body;

      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.createUser({ username, nickname, avatar });
      }

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get chat sessions for user
  app.get("/api/sessions/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserChatSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Create new chat session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { userId, title, personality } = req.body;
      if (userId) {
        const existing = await storage.getUser(userId);
        if (!existing) {
          try {
            await storage.createUser({ id: userId, username: userId }); // Should use username specific creator if needed, or stick to this if compatible
          } catch (e) {
            // Ignore unique conflicts
          }
        }
      }
      const session = await storage.createChatSession({ userId, title, personality });
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Get messages for session
  app.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getSessionMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Chat endpoint with streaming
  app.post("/api/chat", async (req, res) => {
    try {
      const validation = chatRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { message, personality, sessionId, userId, modelId } = validation.data;

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Save user message if we have session info
      if (sessionId) {
        await storage.createMessage({
          sessionId,
          sender: "user",
          content: message,
          personality,
        });
      }

      // Get recent messages for context
      const recentMessages = sessionId
        ? await storage.getRecentMessages(sessionId, 10)
        : [];

      let fullResponse = "";

      // Stream the response, passing modelId if provided
      await generateChatResponse(message, personality, recentMessages, (chunk) => {
        fullResponse += chunk;
        res.write(JSON.stringify({ response: chunk }) + '\n');
      }, modelId);

      // Save bot response
      if (sessionId) {
        await storage.createMessage({
          sessionId,
          sender: "bot",
          content: fullResponse,
          personality,
        });

        // Update session timestamp
        await storage.updateChatSession(sessionId, { updatedAt: new Date() });
      }

      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to process chat request" });
      } else {
        res.end();
      }
    }
  });

  // Image analysis endpoint
  app.post("/api/analyze-image", upload.single('image'), async (req, res) => {
    try {
      const validation = imageAnalysisSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { sessionId, personality } = validation.data;
      const imageBase64 = req.file.buffer.toString('base64');

      const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

      await storage.createMessage({
        sessionId,
        sender: "user",
        content: `🖼️ **Uploaded image:** ${req.file.originalname}\n\n![${req.file.originalname}](${imageDataUrl})\n\n*Size: ${Math.round(req.file.size / 1024)}KB*`,
        personality: personality || 'spiderman',
        messageType: "image",
        metadata: {
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          imageDataUrl: imageDataUrl
        },
      });

      // Analyze the image with personality context
      const analysis = await analyzeImage(imageBase64, personality || 'spiderman');

      // Save the analysis as a bot message
      await storage.createMessage({
        sessionId,
        sender: "bot",
        content: analysis,
        personality: personality || 'spiderman',
        messageType: "image",
        metadata: { imageAnalysis: true },
      });

      await storage.updateChatSession(sessionId, { updatedAt: new Date() });

      res.json({ analysis });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Delete session endpoint
  app.delete("/api/sessions/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.deleteChatSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Model switching endpoint (modified for API mode)
  app.post("/api/switch-model", async (req, res) => {
    // In API mode, we don't need to unload models. 
    // The client should pass the modelId with each chat request.
    // This endpoint can effectively be a no-op or just return success.
    res.json({
      success: true,
      message: "Model preference updated (client-side)"
    });
  });

  // Get system stats endpoint (modified for API mode)
  app.get("/api/system-stats", async (req, res) => {
    // Return static stats for API mode since we're not managing local VRAM
    res.json({
      modelsLoaded: 1,
      totalVRAM: 0,
      vramGB: 0,
      models: [],
      currentChatModel: 'API Mode',
      currentVisionModel: 'API Mode'
    });
  });

  // Get available models endpoint
  app.get("/api/models", (req, res) => {
    res.json(AVAILABLE_MODELS);
  });

  // Voice synthesis endpoint
  app.post("/api/synthesize-voice", async (req, res) => {
    try {
      const { text, personality } = req.body;

      // For now, return success - voice synthesis would be implemented with a TTS service
      res.json({
        success: true,
        message: "Voice synthesis would be implemented here",
        audioUrl: null
      });
    } catch (error) {
      console.error("Voice synthesis error:", error);
      res.status(500).json({ message: "Failed to synthesize voice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
