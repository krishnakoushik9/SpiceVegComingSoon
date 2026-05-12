import { z } from 'zod';
export declare const SeedLabelSchema: z.ZodObject<{
    crop: z.ZodString;
    variety: z.ZodString;
    lotNo: z.ZodString;
    dot: z.ZodString;
    dop: z.ZodString;
    validUpto: z.ZodString;
    netWeight: z.ZodString;
    mrp: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    germination: z.ZodOptional<z.ZodString>;
    purity: z.ZodOptional<z.ZodString>;
    moisture: z.ZodOptional<z.ZodString>;
    shortSlug: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    crop: string;
    variety: string;
    lotNo: string;
    dot: string;
    dop: string;
    validUpto: string;
    netWeight: string;
    mrp: string;
    createdAt?: string | undefined;
    germination?: string | undefined;
    purity?: string | undefined;
    moisture?: string | undefined;
    shortSlug?: string | undefined;
}, {
    crop: string;
    variety: string;
    lotNo: string;
    dot: string;
    dop: string;
    validUpto: string;
    netWeight: string;
    mrp: string;
    createdAt?: string | undefined;
    germination?: string | undefined;
    purity?: string | undefined;
    moisture?: string | undefined;
    shortSlug?: string | undefined;
}>;
export type SeedLabel = z.infer<typeof SeedLabelSchema>;
export interface ShortLinkMetadata {
    url: string;
    lotId: string;
    createdAt: string;
    scans?: number;
}
