import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { translateText } from '@/lib/translate'
import ZAI from 'z-ai-web-dev-sdk'

const CULTURES = [
  { name: 'Japanese', traditions: ['Hanami (cherry blossom viewing)', 'Tea ceremony (Sado)', 'Kimonos and traditional dress'] },
  { name: 'Nigerian', traditions: ['Yoruba naming ceremonies', 'Igbo New Yam Festival', 'Durbar festival'] },
  { name: 'Indian', traditions: ['Diwali festival of lights', 'Holi color festival', 'Ayurvedic wellness traditions'] },
  { name: 'Mexican', traditions: ['Día de los Muertos', 'Piñata traditions', 'Mariachi music'] },
  { name: 'French', traditions: ['Bastille Day celebrations', 'French gastronomy', 'Provencal lavender traditions'] },
  { name: 'Korean', traditions: ['Chuseok harvest festival', 'Hanbok traditional dress', 'Korean tea ceremony'] },
  { name: 'Brazilian', traditions: ['Carnival celebrations', 'Capoeira martial art', 'Feijoada traditions'] },
  { name: 'Egyptian', traditions: ['Ramadan traditions', 'Whirling dervishes', 'Egyptian storytelling (Hakawati)'] },
  { name: 'Chinese', traditions: ['Chinese New Year', 'Calligraphy traditions', 'Moon Festival'] },
  { name: 'Turkish', traditions: ['Turkish bath (Hammam)', 'Whirling dervishes', 'Turkish coffee culture'] },
  { name: 'Ethiopian', traditions: ['Ethiopian coffee ceremony', 'Timkat festival', 'Injera food traditions'] },
  { name: 'Thai', traditions: ['Songkran water festival', 'Thai massage traditions', 'Loy Krathong lantern festival'] },
  { name: 'Russian', traditions: ['Maslenitsa pancake festival', 'Banya bath house tradition', 'Orthodox Easter traditions'] },
  { name: 'Greek', traditions: ['Name day celebrations', 'Greek Easter traditions', 'Olive harvest traditions'] },
  { name: 'Swahili', traditions: ['Ujamaa community values', 'Swahili poetry (Utenzi)', 'Mashujaa Day celebrations'] },
  { name: 'Italian', traditions: ['Passeggiata evening walk', 'Italian Sunday lunch', 'Venetian Carnevale'] },
  { name: 'Arabic', traditions: ['Arabic calligraphy art', 'Majlis gatherings', 'Arabic poetry (Nabati)'] },
  { name: 'Vietnamese', traditions: ['Tet Lunar New Year', 'Ao Dai traditional dress', 'Water puppet theater'] },
  { name: 'Polish', traditions: ['Wianki midsummer festival', 'Polish Easter traditions', 'St. Nicholas Day'] },
  { name: 'German', traditions: ['Oktoberfest', 'Christmas market traditions', 'Maibaum (Maypole)'] },
]

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetLang = searchParams.get('lang') || 'English'

    // Check if there's already a spotlight for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingSpotlight = await db.culturalSpotlight.findFirst({
      where: {
        createdAt: { gte: today },
      },
    })

    if (existingSpotlight) {
      // Translate if needed
      const translatedTitle =
        existingSpotlight.language !== targetLang
          ? await translateText(existingSpotlight.title, existingSpotlight.language, targetLang)
          : existingSpotlight.title

      const translatedContent =
        existingSpotlight.language !== targetLang
          ? await translateText(existingSpotlight.content, existingSpotlight.language, targetLang)
          : existingSpotlight.content

      return NextResponse.json({
        spotlight: {
          id: existingSpotlight.id,
          title: translatedTitle,
          content: translatedContent,
          culture: existingSpotlight.culture,
          language: targetLang,
          originalLanguage: existingSpotlight.language,
          mediaUrl: existingSpotlight.mediaUrl,
          createdAt: existingSpotlight.createdAt,
        },
      })
    }

    // Generate a new spotlight using z-ai-web-dev-sdk
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

    const selectedCulture = CULTURES[dayOfYear % CULTURES.length]
    const tradition = selectedCulture.traditions[dayOfYear % selectedCulture.traditions.length]

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a cultural anthropologist and engaging storyteller. Write a cultural spotlight about a specific tradition or custom. Be informative, respectful, and engaging. The content should be educational and help people appreciate cultural diversity. Keep the content to about 200-300 words.`,
        },
        {
          role: 'user',
          content: `Write a cultural spotlight about "${tradition}" from ${selectedCulture.name} culture. Include: 1) An engaging title, 2) A detailed description of the tradition/custom, 3) Its cultural significance, 4) How it's practiced today. Format your response as JSON with "title" and "content" fields.`,
        },
      ],
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ''

    // Parse the JSON from the response
    let title = `${tradition} — ${selectedCulture.name} Culture`
    let content = raw

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        title = parsed.title || title
        content = parsed.content || content
      }
    } catch {
      // Use raw content if JSON parsing fails
      content = raw
    }

    // Store the spotlight
    const spotlight = await db.culturalSpotlight.create({
      data: {
        title,
        content,
        language: 'English',
        culture: selectedCulture.name,
        authorId: payload.userId,
      },
    })

    // Translate if needed
    const translatedTitle =
      targetLang !== 'English'
        ? await translateText(title, 'English', targetLang)
        : title

    const translatedContent =
      targetLang !== 'English'
        ? await translateText(content, 'English', targetLang)
        : content

    return NextResponse.json({
      spotlight: {
        id: spotlight.id,
        title: translatedTitle,
        content: translatedContent,
        culture: selectedCulture.name,
        language: targetLang,
        originalLanguage: 'English',
        createdAt: spotlight.createdAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
