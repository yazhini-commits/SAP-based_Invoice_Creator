import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.invoices.list.path, async (req, res) => {
    const items = await storage.getInvoices();
    res.json(items);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    const item = await storage.getInvoice(id);
    if (!item) return res.status(404).json({ message: "Invoice not found" });
    res.json(item);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);

// 🔹 Get all existing invoices
const allInvoices = await storage.getInvoices();

let nextNumber = 1;

if (allInvoices.length > 0) {
  const lastInvoice = allInvoices[allInvoices.length - 1];
  const lastNumber = lastInvoice.invoiceNumber; // e.g. INV-008

  const numericPart = parseInt(lastNumber.split("-")[1]);
  if (!isNaN(numericPart)) {
    nextNumber = numericPart + 1;
  }
}

const padded = String(nextNumber).padStart(3, "0");
const finalInvoiceNumber = `INV-${padded}`;

// 🔹 Override invoice number
const invoice = await storage.createInvoice({
  ...input,
  invoiceNumber: finalInvoiceNumber,
});

res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.put(api.invoices.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
      const input = api.invoices.update.input.parse(req.body);
      const invoice = await storage.updateInvoice(id, input);
      res.json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.invoices.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    await storage.deleteInvoice(id);
    res.status(204).end();
  });

  app.get(api.preferences.get.path, async (req, res) => {
    const prefs = await storage.getPreferences();
    res.json(prefs);
  });

  app.put(api.preferences.update.path, async (req, res) => {
    try {
      const input = api.preferences.update.input.parse(req.body);
      const prefs = await storage.updatePreferences(input);
      res.json(prefs);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  // Call seed on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const prefs = await storage.getPreferences();
  
  if (!prefs.businessName) {
    await storage.updatePreferences({
      businessName: "Social Wrenchers",
      businessAddress: "No.19, TYPE-II, Dhanvantri Nagar, Gorimedu\njipmer campus",
      brandColor: "blue",
    });
  }
}
