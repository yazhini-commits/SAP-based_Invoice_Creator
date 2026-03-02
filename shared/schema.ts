import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  data: jsonb("data").notNull(),
  status: text("status").default("PENDING"), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  brandColor: text("brand_color").default("blue"),
  invoicePrefix: text("invoice_prefix").default("INV"),
  businessName: text("business_name").default(""),
  businessGstin: text("business_gstin").default(""),
  businessAddress: text("business_address").default(""),
  businessLogoUrl: text("business_logo_url").default(""),
  signatureUrl: text("signature_url").default(""),
  sealUrl: text("seal_url").default(""),
  bankName: text("bank_name").default(""),
  accountNumber: text("account_number").default(""),
  ifscCode: text("ifsc_code").default(""),
  upiId: text("upi_id").default(""),
  defaultNotes: text("default_notes").default("Thank you for your business!"),
  defaultTerms: text("default_terms").default("1. Payment due in 30 days..."),
});

// Zod schemas for the JSONB data
export const invoiceItemSchema = z.object({
  id: z.string(),

  description: z.string().min(1, "Item description is required"),

  hsn: z.string().optional(),

  qty: z.number().min(1, "Quantity must be at least 1"),

  unit: z.string().default("Nos"),

  rate: z.number().min(0.01, "Rate must be greater than 0"),

  discount: z.number().default(0),
  discountType: z.string().default("%"),
  cgst: z.number().default(0),
  sgst: z.number().default(0),
  cess: z.number().default(0),
});

export const invoiceDataSchema = z.object({
  type: z.string().default("Tax Invoice"),
  number: z.string(),
  date: z.string(),
  dueDate: z.string(),
  poRef: z.string().optional(),
  placeOfSupply: z.string().optional(),
  transactionMode: z.string().default("Intrastate"),
  taxInclusive: z.boolean().default(false),
  rcm: z.boolean().default(false),
  autoRoundOff: z.boolean().default(true),
  
  clientName: z.string().min(1, "Client name is required"),
  clientGstin: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  
  items: z.array(invoiceItemSchema)
  .min(1, "At least one item is required"),
  
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  
  shipping: z.number().default(0),
  overallDiscount: z.number().default(0),
  overallDiscountType: z.string().default("%"),
  advancePaid: z.number().default(0),
  
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
}).extend({
  data: invoiceDataSchema
});

export const insertPreferencesSchema = createInsertSchema(preferences).omit({
  id: true
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Preferences = typeof preferences.$inferSelect;
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;

export type CreateInvoiceRequest = InsertInvoice;
export type UpdateInvoiceRequest = Partial<InsertInvoice>;
export type UpdatePreferencesRequest = Partial<InsertPreferences>;
