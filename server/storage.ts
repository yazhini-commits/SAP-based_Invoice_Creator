import { db } from "./db";
import {
  invoices,
  preferences,
  type Invoice,
  type InsertInvoice,
  type UpdateInvoiceRequest,
  type Preferences,
  type UpdatePreferencesRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: UpdateInvoiceRequest): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  
  getPreferences(): Promise<Preferences>;
  updatePreferences(updates: UpdatePreferencesRequest): Promise<Preferences>;
}

export class DatabaseStorage implements IStorage {
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(invoices.createdAt);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: number, updates: UpdateInvoiceRequest): Promise<Invoice> {
    const [updated] = await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getPreferences(): Promise<Preferences> {
    const [prefs] = await db.select().from(preferences);
    if (!prefs) {
      const [newPrefs] = await db.insert(preferences).values({}).returning();
      return newPrefs;
    }
    return prefs;
  }

  async updatePreferences(updates: UpdatePreferencesRequest): Promise<Preferences> {
    const prefs = await this.getPreferences();
    const [updated] = await db.update(preferences)
      .set(updates)
      .where(eq(preferences.id, prefs.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
