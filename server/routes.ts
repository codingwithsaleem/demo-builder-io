import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { 
  insertQuoteSchema, 
  quoteCalculationSchema, 
  fileUploadSchema,
  type QuoteCalculationRequest 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.stp', '.step'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .stp and .step files are allowed'));
    }
  }
});

// Mock STP volume extraction function
// In a real implementation, this would use opencascade.js or similar
async function extractVolumeFromSTP(filePath: string): Promise<number> {
  try {
    // Read file to validate it exists
    await fs.access(filePath);
    
    // Mock volume extraction - in reality, you'd use opencascade.js
    // This simulates processing time and returns a mock volume
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Return a mock volume between 10 and 1000 cm³
    return Math.random() * 990 + 10;
  } catch (error) {
    throw new Error('Failed to extract volume from STP file');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all materials
  app.get("/api/materials", async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  // Upload STP file and extract volume
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const volume = await extractVolumeFromSTP(req.file.path);
      
      // Clean up uploaded file
      await fs.unlink(req.file.path);

      const result = fileUploadSchema.parse({
        volume,
        fileName: req.file.originalname
      });

      res.json(result);
    } catch (error) {
      // Clean up file if it exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "File processing failed" });
      }
    }
  });

  // Calculate quote
  app.post("/api/quotes/calculate", async (req, res) => {
    try {
      const data = quoteCalculationSchema.parse(req.body);
      
      const material = await storage.getMaterial(data.materialId);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      // Calculate quote
      const weight = data.volume * material.density; // grams
      const materialCost = weight * material.costPerGram; // $
      const subtotal = materialCost * data.quantity; // $
      const markupAmount = (subtotal * data.markupPercentage) / 100; // $
      const total = subtotal + markupAmount; // $

      const calculationResult = {
        volume: data.volume,
        material,
        weight: Math.round(weight * 100) / 100,
        materialCost: Math.round(materialCost * 100) / 100,
        quantity: data.quantity,
        markupPercentage: data.markupPercentage,
        subtotal: Math.round(subtotal * 100) / 100,
        markupAmount: Math.round(markupAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
      };

      res.json(calculationResult);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Quote calculation failed" });
      }
    }
  });

  // Create quote
  app.post("/api/quotes", async (req, res) => {
    try {
      const data = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(data);
      res.json(quote);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create quote" });
      }
    }
  });

  // Get recent quotes
  app.get("/api/quotes/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const quotes = await storage.getRecentQuotes(limit);
      
      // Include material information
      const quotesWithMaterials = await Promise.all(
        quotes.map(async (quote) => {
          const material = await storage.getMaterial(quote.materialId);
          return { ...quote, material };
        })
      );
      
      res.json(quotesWithMaterials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent quotes" });
    }
  });

  // Get all quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      
      // Include material information
      const quotesWithMaterials = await Promise.all(
        quotes.map(async (quote) => {
          const material = await storage.getMaterial(quote.materialId);
          return { ...quote, material };
        })
      );
      
      res.json(quotesWithMaterials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
