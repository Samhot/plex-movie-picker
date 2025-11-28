import { z } from 'zod';

export const PlexResourcesResponseSchema = z.object({
  name: z.string().min(1),
  product: z.string().min(1),
  productVersion: z.string().min(1),
  platform: z.string().min(1),
  platformVersion: z.string().min(1),
  device: z.string().min(1),
  clientIdentifier: z.string().min(1),
  createdAt: z.string().min(1),
  lastSeenAt: z.string().min(1),
  provides: z.string().min(1),
  ownerId: z.string().min(1).nullable(),
  sourceTitle: z.string().min(1).nullable(),
  publicAddress: z.string().min(1),
  accessToken: z.string().min(1),
  owned: z.boolean(),
  home: z.boolean(),
  synced: z.boolean(),
  relay: z.boolean(),
  presence: z.boolean(),
  httpsRequired: z.boolean(),
  publicAddressMatches: z.boolean(),
  dnsRebindingProtection: z.boolean(),
  natLoopbackSupported: z.boolean(),
  connections: z.array(z.object({
    protocol: z.string().min(1),
    address: z.string().min(1),
    port: z.number().positive().int(),
    uri: z.string().min(1),
    local: z.boolean(),
    relay: z.boolean(),
    IPv6: z.boolean(),
  })),
});

export const PlexResourcesResponse = PlexResourcesResponseSchema;
export type PlexResourcesResponse = z.infer<typeof PlexResourcesResponse>;