import { en } from './en'
import { te } from './te'
import { hi } from './hi'
import type { Language } from '../LanguageContext'

export const translations: Record<Language, Record<string, string>> = {
  en,
  te,
  hi,
}

export { en, te, hi }
