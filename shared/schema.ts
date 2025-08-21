import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  density: real("density").notNull(), // g/cm³
  costPerGram: real("cost_per_gram").notNull(), // $/g
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  volume: real("volume").notNull(), // cm³
  materialId: varchar("material_id").references(() => materials.id).notNull(),
  weight: real("weight").notNull(), // grams
  materialCost: real("material_cost").notNull(), // $
  quantity: integer("quantity").notNull().default(1),
  markupPercentage: real("markup_percentage").notNull().default(25),
  subtotal: real("subtotal").notNull(), // $
  total: real("total").notNull(), // $
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Additional schemas for API validation
export const fileUploadSchema = z.object({
  volume: z.number().positive(),
  fileName: z.string().min(1),
});

export const quoteCalculationSchema = z.object({
  volume: z.number().positive(),
  materialId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  markupPercentage: z.number().min(0).max(100).default(25),
});

export type FileUploadResult = z.infer<typeof fileUploadSchema>;
export type QuoteCalculationRequest = z.infer<typeof quoteCalculationSchema>;
