import { type Material, type InsertMaterial, type Quote, type InsertQuote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Materials
  getMaterials(): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  getRecentQuotes(limit?: number): Promise<Quote[]>;
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;
  private quotes: Map<string, Quote>;

  constructor() {
    this.materials = new Map();
    this.quotes = new Map();
    this.initializeMaterials();
  }

  private initializeMaterials() {
    const defaultMaterials: InsertMaterial[] = [
      { name: "Aluminum (Al 6061)", density: 2.70, costPerGram: 0.003 },
      { name: "Carbon Steel", density: 7.85, costPerGram: 0.002 },
      { name: "Stainless Steel (304)", density: 8.00, costPerGram: 0.008 },
      { name: "Brass", density: 8.50, costPerGram: 0.012 },
      { name: "Titanium (Ti-6Al-4V)", density: 4.50, costPerGram: 0.045 },
      { name: "ABS Plastic", density: 1.04, costPerGram: 0.004 },
      { name: "PLA Plastic", density: 1.25, costPerGram: 0.003 },
    ];

    defaultMaterials.forEach(material => {
      const id = randomUUID();
      this.materials.set(id, { ...material, id });
    });
  }

  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values());
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = randomUUID();
    const material: Material = { ...insertMaterial, id };
    this.materials.set(id, material);
    return material;
  }

  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { 
      ...insertQuote,
      quantity: insertQuote.quantity ?? 1,
      markupPercentage: insertQuote.markupPercentage ?? 25,
      id, 
      createdAt: new Date()
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getRecentQuotes(limit: number = 5): Promise<Quote[]> {
    const allQuotes = await this.getQuotes();
    return allQuotes.slice(0, limit);
  }
}

export const storage = new MemStorage();
