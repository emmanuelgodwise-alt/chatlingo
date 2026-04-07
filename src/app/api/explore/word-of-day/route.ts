import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { LANGUAGES } from '@/lib/languages'

const PHRASES = [
  { phrase: "Hello, how are you?", culturalNote: "A universal greeting that varies in formality across cultures. In Japan, one asks about health (お元気ですか？), while in Arabic-speaking countries, greetings often include 'Peace be upon you' (السلام عليكم)." },
  { phrase: "Thank you very much", culturalNote: "Gratitude is expressed differently worldwide. In Japanese, 'Arigatou gozaimasu' (ありがとうございます) has different politeness levels. In Korean, 'Gamsahamnida' (감사합니다) is used." },
  { phrase: "Where is the nearest restaurant?", culturalNote: "Food is central to culture. In Mediterranean countries, asking for a restaurant often leads to warm recommendations and lengthy descriptions of local cuisine." },
  { phrase: "Nice to meet you", culturalNote: "In many Asian cultures, bowing accompanies this phrase. In France, a light kiss on each cheek (la bise) is common among friends, while in Latin America, an abrazo (hug) is typical." },
  { phrase: "I am learning your language", culturalNote: "Showing effort to learn someone's language is universally appreciated. In many cultures, locals will warmly respond and often offer to help practice." },
  { phrase: "Could you speak more slowly, please?", culturalNote: "A crucial phrase for language learners. In Germany, you might say 'Können Sie bitte langsamer sprechen?' and people are generally very accommodating." },
  { phrase: "What does this word mean?", culturalNote: "Asking about vocabulary shows genuine interest. In many African languages, words often carry deep cultural significance and stories behind their origins." },
  { phrase: "I love your culture", culturalNote: "Cultural appreciation opens doors to deeper connections. In Brazil, showing interest in Brazilian culture often leads to invitations for feijoada or samba." },
  { phrase: "Let's be friends", culturalNote: "Friendship norms vary widely. In Scandinavia, friendship is built slowly over years, while in Latin America and the Middle East, warmth and hospitality create instant bonds." },
  { phrase: "The weather is beautiful today", culturalNote: "Weather conversations (small talk) are universal ice-breakers. In the UK, discussing weather is practically a national pastime with surprising depth." },
  { phrase: "I'm sorry, I don't understand", culturalNote: "Admitting misunderstanding is an important skill. In high-context cultures like Japan, people often infer meaning, so explicitly stating confusion is helpful for foreigners." },
  { phrase: "Can you recommend a good book?", culturalNote: "Literature reveals cultural values. In Russia, recommending Dostoevsky or Tolstoy is common. In Nigeria, Chinua Achebe's works are cultural touchstones." },
  { phrase: "What time is it?", culturalNote: "Time perception varies culturally. In 'monochronic' cultures (Germany, Switzerland), punctuality is sacred. In 'polychronic' cultures (Latin America, Middle East), time is more fluid." },
  { phrase: "I would like to try the local food", culturalNote: "Food is perhaps the most accessible aspect of culture. In Thailand, street food is an institution. In Italy, each region fiercely guards its culinary traditions." },
  { phrase: "How do you say this in your language?", culturalNote: "This phrase shows respect and curiosity. Many languages have untranslatable words—like 'hygge' (Danish coziness) or 'saudade' (Portuguese longing)." },
  { phrase: "Good morning", culturalNote: "Morning greetings reveal cultural rhythms. In Egypt, 'Sabah el-kheir' (صباح الخير) is often followed by elaborate well-wishing exchanges." },
  { phrase: "Goodbye, see you later", culturalNote: "Parting words vary from the casual 'Ciao' in Italy to the elaborate 'Khuda hafiz' (خدا حافظ) in Urdu-speaking regions, literally meaning 'May God be your protector.'" },
  { phrase: "I am from...", culturalNote: "Sharing your origin often sparks cultural exchange. In many African cultures, your hometown, family lineage, and ethnic group are central to your identity." },
  { phrase: "What is your name?", culturalNote: "Names carry deep cultural meaning. In Yoruba culture, names often describe circumstances of birth. In Iceland, a strict naming committee approves all new names." },
  { phrase: "Congratulations!", culturalNote: "Celebrations differ worldwide. In China, red envelopes (hongbao) filled with money are given. In Mexico, '¡Felicidades!' is used for both congratulations and birthdays." },
  { phrase: "I need help, please", culturalNote: "In many cultures, asking for help directly is considered rude. In Japan, one might hint at needing help rather than ask outright. In Mediterranean cultures, asking directly is normal." },
  { phrase: "That's very interesting", culturalNote: "Showing curiosity about another's culture builds bridges. In India, 'Bahut interesting hai' might lead to hours of fascinating cultural stories." },
  { phrase: "Please and thank you", culturalNote: "In some languages, like Japanese, politeness is baked into grammar itself through keigo (敬語) honorific system with multiple formality levels." },
  { phrase: "Happy birthday!", culturalNote: "Birthday traditions range from the quinceañera in Latin America (15th birthday celebration) to eating long noodles (changshou mian) in China for longevity." },
  { phrase: "Excuse me", culturalNote: "In Japan, 'Sumimasen' (すみません) is used constantly and can mean excuse me, sorry, or thank you depending on context—a uniquely multi-purpose phrase." },
  { phrase: "I enjoy learning new things", culturalNote: "Lifelong learning is valued in Confucian-influenced cultures. In South Korea, the concept of 'nunchi' (눈치)—the art of listening and gauging mood—is considered essential." },
  { phrase: "What do you do for fun?", culturalNote: "Leisure activities reflect cultural values. In Brazil, football is almost a religion. In Finland, sauna culture is an integral part of social life." },
  { phrase: "Can we practice together?", culturalNote: "Language exchange partnerships are built on mutual learning. Tandem learning, where two people alternate between languages, has been practiced for centuries." },
  { phrase: "Your country is beautiful", culturalNote: "Praising someone's homeland is a powerful connector. In Iran, 'Iran zibast' (ایران زیباست) will earn you immediate warmth and hospitality." },
  { phrase: "I'm a language learner", culturalNote: "The language learning community is global and welcoming. Apps, meetups, and online communities connect millions of polyglots worldwide." },
  { phrase: "Let me think about it", culturalNote: "Decision-making speed varies culturally. In many Asian and Middle Eastern cultures, taking time to consider is expected and respected, unlike in some Western business contexts." },
  { phrase: "One more time, please", culturalNote: "Repetition is key to learning. In Swahili-speaking East Africa, 'Marra moja tena' shows your willingness to learn and is met with patience and encouragement." },
  { phrase: "I am lost, can you help me?", culturalNote: "Getting lost is often how you discover the best parts of a new place. In many cultures, locals will personally escort you to your destination rather than just give directions." },
  { phrase: "What is this place?", culturalNote: "Asking about places reveals history. Every market square, temple, and neighborhood has stories that locals love to share with curious visitors." },
  { phrase: "Water, please", culturalNote: "Hospitality around drinks is universal. In Morocco, mint tea is served ritualistically. In Argentina, mate is shared in a circle as a symbol of friendship." },
  { phrase: "How much does this cost?", culturalNote: "Bargaining is expected in many cultures—from Middle Eastern souks to Southeast Asian markets. In Japan and Korea, prices are fixed and haggling is considered rude." },
  { phrase: "I'm happy to be here", culturalNote: "Expressing genuine joy about being somewhere is universally appreciated. In Hawai'i, the spirit of 'aloha' embodies this warmth and welcome." },
  { phrase: "Do you speak English?", culturalNote: "English is the world's lingua franca, but showing you tried to say something in the local language first always earns respect and better service." },
  { phrase: "The food here is delicious", culturalNote: "Complimenting food is a sure way to win hearts. In Georgia (country), an elaborate supra (feast) with toasts is a cornerstone of hospitality." },
  { phrase: "Good night and sweet dreams", culturalNote: "Bedtime wishes vary beautifully—from the French 'Fais de beaux rêves' (Have beautiful dreams) to the Spanish 'Que sueñes con los angelitos' (May you dream of little angels)." },
  { phrase: "I want to travel the world", culturalNote: "Travel aspiration is universal. The concept of 'wanderlust' has equivalents worldwide—the Japanese 'tabibito' (旅人, traveler) carries a romantic, spiritual connotation." },
  { phrase: "Can you teach me a phrase?", culturalNote: "Asking someone to teach you their language shows humility and respect. It often leads to discovering beautiful expressions unique to that culture." },
  { phrase: "I appreciate your help", culturalNote: "Gratitude styles differ—some cultures express it verbally and elaborately, while others show it through actions and reciprocal favors." },
  { phrase: "Music brings people together", culturalNote: "Music is the universal language. From West African djembe circles to Irish pub sessions, music creates community across all cultural boundaries." },
  { phrase: "Tell me about your traditions", culturalNote: "Traditions connect past to present. From Diwali in India to Carnival in Brazil, learning about traditions offers deep insight into cultural values." },
  { phrase: "What is your favorite food?", culturalNote: "Food identity is profound. Asking about favorite dishes opens conversations about family recipes, regional specialties, and cultural heritage." },
  { phrase: "I believe in cultural exchange", culturalNote: "Cultural exchange has shaped human civilization for millennia—through trade routes like the Silk Road to modern digital globalization." },
  { phrase: "Let's keep in touch", culturalNote: "Staying connected across cultures has never been easier. In Chinese, 'Bǎochí liánxì' (保持联系) embodies the value of maintaining relationships (guanxi)." },
  { phrase: "Every culture has something beautiful to offer", culturalNote: "Cultural relativism—the idea that cultures should be understood on their own terms—is fundamental to genuine cross-cultural appreciation." },
  { phrase: "I'm still learning, bear with me", culturalNote: "Language learners who acknowledge their level while showing effort are universally encouraged. The phrase 'poco a poco' (little by little) in Spanish captures this spirit." },
  { phrase: "Family is important everywhere", culturalNote: "Family structures vary—from the extended family networks in Africa and Latin America to the nuclear family model common in Western countries—but family love is universal." },
  { phrase: "What is your hobby?", culturalNote: "Hobbies reveal personality and culture. From origami in Japan to capoeira in Brazil, many hobbies carry deep cultural significance." },
  { phrase: "I respect your culture", culturalNote: "Respect is the foundation of all cultural interaction. In Māori culture, the hongi (pressing noses together) is a traditional greeting that shares the 'breath of life.'" },
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
    const lang = searchParams.get('lang') || ''

    // Pick phrase based on day of year (changes daily)
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const phraseIndex = dayOfYear % PHRASES.length

    const selected = PHRASES[phraseIndex]

    // Build translations object for common languages
    const translations: Record<string, string> = {}
    const languagesToTranslate = lang
      ? [lang, ...LANGUAGES.slice(0, 5).map((l) => l.code)]
      : LANGUAGES.slice(0, 10).map((l) => l.code)

    // For efficiency, provide the phrase as the base (English) and
    // indicate translation targets. The actual translation would be done
    // via the translate utility, but for a cached word-of-day, we use inline AI.
    // We'll translate to a few languages inline.

    translations['English'] = selected.phrase

    // Return the phrase with cultural note; translations can be fetched via /api/translate
    return NextResponse.json({
      phrase: selected.phrase,
      translations,
      culturalNote: selected.culturalNote,
      dayOfYear,
      translationLanguages: languagesToTranslate.filter((l) => l !== 'English'),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
