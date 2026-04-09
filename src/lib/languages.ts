export const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Spanish', label: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'French', label: 'Français (French)', flag: '🇫🇷' },
  { code: 'German', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'Italian', label: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'Portuguese', label: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'Chinese', label: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'Mandarin', label: '普通话 (Mandarin)', flag: '🇨🇳' },
  { code: 'Japanese', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'Korean', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'Arabic', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'Russian', label: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'Swahili', label: 'Kiswahili (Swahili)', flag: '🇰🇪' },
  { code: 'Turkish', label: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { code: 'Dutch', label: 'Nederlands (Dutch)', flag: '🇳🇱' },
  { code: 'Latin', label: 'Latina (Latin)', flag: '🏛️' },
  { code: 'Yoruba', label: 'Yorùbá (Yoruba)', flag: '🇳🇬' },
  { code: 'Igbo', label: 'Igbo (Igbo)', flag: '🇳🇬' },
  { code: 'Hausa', label: 'Hausa (Hausa)', flag: '🇳🇬' },
  { code: 'Amharic', label: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  { code: 'Thai', label: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'Vietnamese', label: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { code: 'Polish', label: 'Polski (Polish)', flag: '🇵🇱' },
  { code: 'Greek', label: 'Ελληνικά (Greek)', flag: '🇬🇷' },
  { code: 'Twi', label: 'Twi (Twi)', flag: '🇬🇭' },
  { code: 'Mandarin', label: '中文 (Mandarin)', flag: '🇨🇳' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

export function getLanguageLabel(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.label || code
}

export function getLanguageFlag(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.flag || '🌐'
}
