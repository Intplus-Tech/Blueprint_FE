import { z } from 'zod'

/** Cookie consent preferences submitted from the cookie banner. */
export const cookieConsentSchema = z.object({
  essentials: z.literal(true), // essentials are always required
  marketing: z.boolean(),
  externalMedia: z.boolean(),
})
export type CookieConsent = z.infer<typeof cookieConsentSchema>

/** Metadata for a file selected/dropped in the upload dropzone. */
export const uploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255),
  size: z.number().int().nonnegative().optional(),
  type: z.string().max(255).optional(),
  source: z.enum(['device', 'gdrive', 'onedrive', 'dropbox']),
})
export type UploadPayload = z.infer<typeof uploadSchema>

/** Google One Tap sign-in payload. */
export const googleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
})
export type GoogleAuthPayload = z.infer<typeof googleAuthSchema>
