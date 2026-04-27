/**
 * Speech Recognition and Synthesis Utilities
 * Uses browser-native Web Speech API for zero-latency ASR and TTS
 */

// ============================================
// Language Code Mapping (ChatLingo -> BCP-47)
// ============================================

export const LANGUAGE_BCP47_MAP: Record<string, string> = {
  English: 'en-US',
  Spanish: 'es-ES',
  French: 'fr-FR',
  German: 'de-DE',
  Italian: 'it-IT',
  Portuguese: 'pt-BR',
  Chinese: 'zh-CN',
  Japanese: 'ja-JP',
  Korean: 'ko-KR',
  Arabic: 'ar-SA',
  Hindi: 'hi-IN',
  Russian: 'ru-RU',
  Swahili: 'sw-KE',
  Turkish: 'tr-TR',
  Dutch: 'nl-NL',
  Latin: 'la',
  Yoruba: 'yo-NG',
  Igbo: 'ig-NG',
  Hausa: 'ha-NG',
  Amharic: 'am-ET',
  Thai: 'th-TH',
  Vietnamese: 'vi-VN',
  Polish: 'pl-PL',
  Greek: 'el-GR',
}

/**
 * Get BCP-47 language code from ChatLingo language name
 */
export function getBCP47Code(language: string): string {
  return LANGUAGE_BCP47_MAP[language] || 'en-US'
}

// ============================================
// Speech Recognition
// ============================================

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionType = any

let recognitionInstance: SpeechRecognitionType | null = null

/**
 * Check if SpeechRecognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as Record<string, unknown>
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

/**
 * Start speech recognition
 */
export function startRecognition(
  language: string,
  onResult: (text: string, isFinal: boolean) => void
): void {
  stopRecognition()

  if (!isSpeechRecognitionSupported()) {
    console.warn('SpeechRecognition is not supported in this browser')
    return
  }

  const SpeechRecognitionAPI = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as new () => SpeechRecognitionType

  recognitionInstance = new SpeechRecognitionAPI()
  recognitionInstance.continuous = true
  recognitionInstance.interimResults = true
  recognitionInstance.lang = getBCP47Code(language)
  recognitionInstance.maxAlternatives = 1

  let lastFinalText = ''

  recognitionInstance.onresult = (event: any) => {
    for (let i = event.results.length - 1; i >= 0; i--) {
      const result = event.results[i]
      const text = result[0].transcript.trim()

      if (text && result.isFinal) {
        // Avoid duplicate consecutive results
        if (text !== lastFinalText) {
          lastFinalText = text
          onResult(text, true)
        }
      } else if (text && !result.isFinal) {
        onResult(text, false)
      }
    }
  }

  recognitionInstance.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    // Restart on non-fatal errors
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      setTimeout(() => {
        if (recognitionInstance) {
          try {
            recognitionInstance.start()
          } catch {
            // ignore
          }
        }
      }, 500)
    }
  }

  recognitionInstance.onend = () => {
    // Auto-restart if still active (recognition stops after silence)
    if (recognitionInstance) {
      try {
        recognitionInstance.start()
      } catch {
        // ignore - may already be started
      }
    }
  }

  try {
    recognitionInstance.start()
  } catch (error) {
    console.error('Failed to start speech recognition:', error)
  }
}

/**
 * Stop speech recognition
 */
export function stopRecognition(): void {
  if (recognitionInstance) {
    try {
      recognitionInstance.onend = null
      recognitionInstance.stop()
    } catch {
      // ignore
    }
    recognitionInstance = null
  }
}

// ============================================
// Speech Synthesis (Text-to-Speech)
// ============================================

let isSpeaking = false
let speakQueue: Array<{ text: string; language: string }> = []

/**
 * Check if SpeechSynthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.speechSynthesis
}

/**
 * Get the best available voice for a given language
 */
function getBestVoice(language: string): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null

  const voices = window.speechSynthesis.getVoices()
  const bcp47 = getBCP47Code(language)
  const langPrefix = bcp47.split('-')[0]

  // Try exact match first
  const exactMatch = voices.find((v) => v.lang === bcp47)
  if (exactMatch) return exactMatch

  // Try language prefix match
  const prefixMatch = voices.find((v) => v.lang.startsWith(langPrefix))
  if (prefixMatch) return prefixMatch

  // Return default voice
  return voices[0] || null
}

/**
 * Speak text in a given language
 */
export function speak(text: string, language: string): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return

  // Cancel current speech and clear queue for immediate translation
  window.speechSynthesis.cancel()
  speakQueue = []

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = getBestVoice(language)
  if (voice) {
    utterance.voice = voice
  }
  utterance.lang = getBCP47Code(language)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0

  isSpeaking = true

  utterance.onend = () => {
    isSpeaking = false
    processSpeakQueue()
  }

  utterance.onerror = () => {
    isSpeaking = false
    processSpeakQueue()
  }

  window.speechSynthesis.speak(utterance)
}

/**
 * Queue a text for speaking
 */
export function queueSpeak(text: string, language: string): void {
  speakQueue.push({ text, language })
  if (!isSpeaking) {
    processSpeakQueue()
  }
}

/**
 * Process the speak queue
 */
function processSpeakQueue(): void {
  if (speakQueue.length === 0) return

  const item = speakQueue.shift()
  if (item) {
    speak(item.text, item.language)
  }
}

/**
 * Stop all speech synthesis
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
  isSpeaking = false
  speakQueue = []
}

/**
 * Ensure voices are loaded (some browsers load them async)
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([])
      return
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }

    // Fallback timeout
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices())
    }, 2000)
  })
}
