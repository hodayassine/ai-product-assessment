import { z } from "zod";

const currentYear = new Date().getFullYear();

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  author: z.string().min(1, "Author is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  genre: z.string().min(1, "Genre is required").max(100),
  publishedYear: z
    .number()
    .int("Must be a year")
    .min(1, "Invalid year")
    .max(currentYear + 1, "Year cannot be in the future"),
  totalCopies: z.number().int("Must be a whole number").min(0, "Cannot be negative"),
  availableCopies: z.number().int("Must be a whole number").min(0, "Cannot be negative"),
}).refine(
  (data) => data.availableCopies <= data.totalCopies,
  { message: "Available copies cannot exceed total copies", path: ["availableCopies"] }
);

export const updateBookSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    author: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    genre: z.string().min(1).max(100).optional(),
    publishedYear: z.number().int().min(1).max(currentYear + 1).optional(),
    totalCopies: z.number().int().min(0).optional(),
    availableCopies: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.availableCopies != null && data.totalCopies != null) {
        return data.availableCopies <= data.totalCopies;
      }
      return true;
    },
    { message: "Available copies cannot exceed total copies", path: ["availableCopies"] }
  );

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
