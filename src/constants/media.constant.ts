export const Media = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO'
} as const

export type MediaType = typeof Media[keyof typeof Media]
