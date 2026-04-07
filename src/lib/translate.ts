import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (!text.trim()) return text
  if (sourceLanguage === targetLanguage) return text

  try {
    const zai = await getZAI()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Return ONLY the translation, nothing else. No explanations, no notes, no quotation marks. 
Preserve the original tone, style, and meaning. Keep it natural and conversational.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    })

    const translated = completion.choices[0]?.message?.content?.trim()
    return translated || text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}
