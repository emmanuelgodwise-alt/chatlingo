import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLanguage, targetLanguage } = body

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text, sourceLanguage, targetLanguage' },
        { status: 400 }
      )
    }

    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({ translatedText: text })
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional real-time translator for a voice/video call. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translation, nothing else. No explanations, no notes, no quotation marks. Preserve the original tone, emotion, and meaning. Keep it concise and natural for spoken language.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const translatedText = completion.choices[0]?.message?.content?.trim() || text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
