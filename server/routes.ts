import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { factCheck, suggestImprovements } from "./openai";
import { insertContentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Content routes
  app.get("/api/contents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const contents = await storage.getContentsByUser(req.user.id);
    res.json(contents);
  });

  app.post("/api/contents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsed = insertContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const content = await storage.createContent({
      ...parsed.data,
      authorId: req.user.id,
    });
    res.status(201).json(content);
  });

  app.get("/api/contents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const content = await storage.getContent(parseInt(req.params.id));
    if (!content) return res.sendStatus(404);
    if (content.authorId !== req.user.id) return res.sendStatus(403);

    res.json(content);
  });

  app.patch("/api/contents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const content = await storage.getContent(parseInt(req.params.id));
    if (!content) return res.sendStatus(404);
    if (content.authorId !== req.user.id) return res.sendStatus(403);

    const updated = await storage.updateContent(content.id, req.body);
    res.json(updated);
  });

  app.delete("/api/contents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const content = await storage.getContent(parseInt(req.params.id));
    if (!content) return res.sendStatus(404);
    if (content.authorId !== req.user.id) return res.sendStatus(403);

    await storage.deleteContent(content.id);
    res.sendStatus(204);
  });

  // AI routes
  app.post("/api/fact-check", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { content, language = 'en' } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    try {
      const result = await factCheck(content, language);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/suggest", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const suggestions = await suggestImprovements(content);
    res.json({ suggestions });
  });

  const httpServer = createServer(app);
  return httpServer;
}