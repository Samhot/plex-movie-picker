import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);

type Literal = z.infer<typeof literalSchema>;

export type ZodJson = Literal | { [key: string]: ZodJson } | ZodJson[];

export const ZodJson: z.ZodType<ZodJson> = z.lazy(() => z.union([literalSchema, z.array(ZodJson), z.record(ZodJson)]));
