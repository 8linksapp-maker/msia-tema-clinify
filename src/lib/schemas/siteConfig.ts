import { z } from 'zod';

export const siteConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string().email(),
  address: z.string(),
  hours: z.string(),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
