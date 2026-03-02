import { z } from "zod";
import { invoices, preferences, insertInvoiceSchema, insertPreferencesSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  invoices: {
    list: {
      method: "GET" as const,
      path: "/api/invoices",
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/invoices/:id",
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/invoices",
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/invoices/:id",
      input: insertInvoiceSchema.partial(),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/invoices/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  preferences: {
    get: {
      method: "GET" as const,
      path: "/api/preferences",
      responses: {
        200: z.custom<typeof preferences.$inferSelect>(),
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/preferences",
      input: insertPreferencesSchema.partial(),
      responses: {
        200: z.custom<typeof preferences.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
