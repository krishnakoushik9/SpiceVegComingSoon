import { z } from 'zod';
export const SeedLabelSchema = z.object({
    crop: z.string().min(1, "Crop is required"),
    variety: z.string().min(1, "Variety is required"),
    lotNo: z.string().min(1, "Lot Number is required"),
    dot: z.string().min(1, "Date of Testing is required"),
    dop: z.string().min(1, "Date of Packaging is required"),
    validUpto: z.string().min(1, "Validity date is required"),
    netWeight: z.string().min(1, "Net Weight is required"),
    mrp: z.string().min(1, "MRP is required"),
    createdAt: z.string().optional(),
    // New optional fields for future-proofing
    germination: z.string().optional(),
    purity: z.string().optional(),
    moisture: z.string().optional(),
    shortSlug: z.string().optional(),
});
