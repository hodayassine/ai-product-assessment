import { z } from "zod";

export const inventoryStatusEnum = z.enum(["InStock", "LowStock", "Ordered", "Discontinued"]);

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().int().min(0),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  status: inventoryStatusEnum,
});

export const updateItemSchema = createItemSchema.partial().extend({
  name: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  category: z.string().min(1).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
