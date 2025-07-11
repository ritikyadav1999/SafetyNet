const { z } = require("zod");

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().min(0).optional(),
  specs: z.string().optional(), // This is JSON string, parsed in controller
});

module.exports = productSchema;
