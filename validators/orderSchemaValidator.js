// ✅ checkoutSchema.js
const { z } = require("zod");

const checkoutSchema = z.object({
  paymentMethod: z.enum(["COD", "UPI", "CARD"]),
  shippingAddress: z.union([
    z.string().length(24, "Invalid shipping address ID"),
    z.object({
      name: z.string().min(1),
      phone: z.string().min(10),
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().min(4),
      country: z.string().min(1).default("India"),
    }),
  ]),
});

module.exports = checkoutSchema; // ✅ Ensure this line exports the schema directly
