/** Normalizes MUI icon exports that arrive with a CommonJS default wrapper. */
export const resolveIcon = <T,>(iconModule: T): T =>
  (iconModule as T & { default?: T })?.default ?? iconModule;
