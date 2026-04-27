import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_USER_ID = 'cmnnz32950000l7mngyz1x5nl'
const PASSWORD_HASH = '$2b$12$.dvA/M0vB5RWGGAhVrOuueFoEhOb7U/mWgnyxkecBI/m3xiXt/9yy'

interface DemoUser {
  name: string
  email: string
  preferredLanguage: string
  learningLanguages: string[]
  bio: string
  online: boolean
  messages: Array<{
    content: string
    translatedContent: string | null
    senderId: string
    senderLanguage: string
    receiverLanguage: string
  }>
}

const demoUsers: DemoUser[] = [
  {
    name: 'Sakura Yamamoto',
    email: 'sakura.yamamoto@example.com',
    preferredLanguage: 'Japanese',
    learningLanguages: ['English'],
    bio: 'Learning English to connect with the world 🌍',
    online: true,
    messages: [
      { content: 'こんにちは！お元気ですか？', translatedContent: 'Hello! How are you?', senderId: 'sakura', senderLanguage: 'Japanese', receiverLanguage: 'English' },
      { content: 'I\'m doing great! How about you?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Japanese' },
      { content: '今日はとてもいい天気ですね。桜が咲いています！', translatedContent: 'The weather is very nice today. The cherry blossoms are blooming!', senderId: 'sakura', senderLanguage: 'Japanese', receiverLanguage: 'English' },
      { content: 'That sounds beautiful! I love cherry blossoms 🌸', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Japanese' },
    ],
  },
  {
    name: 'Pierre Dubois',
    email: 'pierre.dubois@example.com',
    preferredLanguage: 'French',
    learningLanguages: ['English'],
    bio: 'Passionate about languages and culture 🇫🇷',
    online: true,
    messages: [
      { content: 'Bonjour! Comment allez-vous?', translatedContent: 'Hello! How are you?', senderId: 'pierre', senderLanguage: 'French', receiverLanguage: 'English' },
      { content: 'I\'m fine, thanks! How\'s life in Paris?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'French' },
      { content: 'Paris est magnifique en ce moment! Vous devriez visiter un jour.', translatedContent: 'Paris is magnificent right now! You should visit one day.', senderId: 'pierre', senderLanguage: 'French', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Maria García',
    email: 'maria.garcia@example.com',
    preferredLanguage: 'Spanish',
    learningLanguages: ['English'],
    bio: '¡Hola! Aprendiendo inglés paso a paso 💃',
    online: true,
    messages: [
      { content: '¡Hola! ¿Cómo estás?', translatedContent: 'Hello! How are you?', senderId: 'maria', senderLanguage: 'Spanish', receiverLanguage: 'English' },
      { content: 'Hey Maria! I\'m good, learning Spanish too!', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Spanish' },
      { content: '¡Qué bueno! Podemos practicar juntos. El español es un idioma hermoso.', translatedContent: 'That\'s great! We can practice together. Spanish is a beautiful language.', senderId: 'maria', senderLanguage: 'Spanish', receiverLanguage: 'English' },
      { content: 'Definitely! Can you teach me some common phrases?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Spanish' },
    ],
  },
  {
    name: 'Hans Mueller',
    email: 'hans.mueller@example.com',
    preferredLanguage: 'German',
    learningLanguages: ['English'],
    bio: 'Guten Tag! Learning English for work and travel 🇩🇪',
    online: false,
    messages: [
      { content: 'Guten Tag! Wie geht es Ihnen?', translatedContent: 'Good day! How are you?', senderId: 'hans', senderLanguage: 'German', receiverLanguage: 'English' },
      { content: 'Hello Hans! I\'m well. Are you from Germany?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'German' },
      { content: 'Ja, ich komme aus München. Es ist eine wunderschöne Stadt.', translatedContent: 'Yes, I come from Munich. It is a beautiful city.', senderId: 'hans', senderLanguage: 'German', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    preferredLanguage: 'Korean',
    learningLanguages: ['English'],
    bio: '안녕하세요! Making friends worldwide 🇰🇷',
    online: true,
    messages: [
      { content: '안녕하세요! 만나서 반갑습니다.', translatedContent: 'Hello! Nice to meet you.', senderId: 'yuki', senderLanguage: 'Korean', receiverLanguage: 'English' },
      { content: 'Nice to meet you too, Yuki! How are you?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Korean' },
    ],
  },
  {
    name: 'Mei Lin Chen',
    email: 'meilin.chen@example.com',
    preferredLanguage: 'Chinese',
    learningLanguages: ['English'],
    bio: '你好！Improving my English skills 🇨🇳',
    online: false,
    messages: [
      { content: '你好！很高兴认识你。', translatedContent: 'Hello! Nice to meet you.', senderId: 'meilin', senderLanguage: 'Chinese', receiverLanguage: 'English' },
      { content: 'Nice to meet you too! Are you from China?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Chinese' },
      { content: '是的，我来自北京。你喜欢吃中国菜吗？', translatedContent: 'Yes, I\'m from Beijing. Do you like Chinese food?', senderId: 'meilin', senderLanguage: 'Chinese', receiverLanguage: 'English' },
      { content: 'I love Chinese food! Dumplings are my favorite 🥟', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Chinese' },
      { content: '饺子很好吃！下次我教你做饺子。', translatedContent: 'Dumplings are delicious! Next time I\'ll teach you how to make dumplings.', senderId: 'meilin', senderLanguage: 'Chinese', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    preferredLanguage: 'Arabic',
    learningLanguages: ['English'],
    bio: 'مرحبا! Building bridges through language 🇪🇬',
    online: true,
    messages: [
      { content: 'مرحبا! كيف حالك؟', translatedContent: 'Hello! How are you?', senderId: 'ahmed', senderLanguage: 'Arabic', receiverLanguage: 'English' },
      { content: 'Hi Ahmed! I\'m doing well. How\'s Cairo?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Arabic' },
      { content: 'القاهرة رائعة اليوم! أتمنى أن تزورها someday.', translatedContent: 'Cairo is wonderful today! I hope you visit someday.', senderId: 'ahmed', senderLanguage: 'Arabic', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    preferredLanguage: 'Hindi',
    learningLanguages: ['English'],
    bio: 'नमस्ते! Learning English for my career dreams 🇮🇳',
    online: false,
    messages: [
      { content: 'नमस्ते! आप कैसे हैं?', translatedContent: 'Hello! How are you?', senderId: 'priya', senderLanguage: 'Hindi', receiverLanguage: 'English' },
      { content: 'Hello Priya! I\'m great. How are you doing?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Hindi' },
      { content: 'मैं बहुत अच्छा कर रही हूं। भारत में मौसम बहुत अच्छा है।', translatedContent: 'I\'m doing very well. The weather in India is very nice.', senderId: 'priya', senderLanguage: 'Hindi', receiverLanguage: 'English' },
      { content: 'That\'s wonderful! I\'d love to visit India someday 🙏', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Hindi' },
    ],
  },
  {
    name: 'Sofia Rossi',
    email: 'sofia.rossi@example.com',
    preferredLanguage: 'Italian',
    learningLanguages: ['English'],
    bio: 'Ciao! Learning English with passion 🇮🇹',
    online: true,
    messages: [
      { content: 'Ciao! Come stai?', translatedContent: 'Hello! How are you?', senderId: 'sofia', senderLanguage: 'Italian', receiverLanguage: 'English' },
      { content: 'Hi Sofia! I\'m doing well. How\'s Rome?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Italian' },
      { content: 'Roma è bellissima come sempre! Mangiamo una pizza insieme un giorno.', translatedContent: 'Rome is beautiful as always! Let\'s eat pizza together one day.', senderId: 'sofia', senderLanguage: 'Italian', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Carlos Silva',
    email: 'carlos.silva@example.com',
    preferredLanguage: 'Portuguese',
    learningLanguages: ['English'],
    bio: 'Olá! Brazilian learning English 🇧🇷⚽',
    online: true,
    messages: [
      { content: 'Olá! Tudo bem?', translatedContent: 'Hello! How are you?', senderId: 'carlos', senderLanguage: 'Portuguese', receiverLanguage: 'English' },
      { content: 'Hey Carlos! All good here. Are you from Brazil?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Portuguese' },
      { content: 'Sim! Sou do Rio de Janeiro. Você gosta de futebol?', translatedContent: 'Yes! I\'m from Rio de Janeiro. Do you like football?', senderId: 'carlos', senderLanguage: 'Portuguese', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Olga Petrov',
    email: 'olga.petrov@example.com',
    preferredLanguage: 'Russian',
    learningLanguages: ['English'],
    bio: 'Привет! Expanding my world through English 🇷🇺',
    online: false,
    messages: [
      { content: 'Привет! Как дела?', translatedContent: 'Hello! How are you?', senderId: 'olga', senderLanguage: 'Russian', receiverLanguage: 'English' },
      { content: 'Hi Olga! I\'m doing well. Is it cold in Moscow?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Russian' },
      { content: 'Сейчас тепло! Весна наконец-то пришла в Москву.', translatedContent: 'It\'s warm now! Spring has finally come to Moscow.', senderId: 'olga', senderLanguage: 'Russian', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Fatima Al-Rashid',
    email: 'fatima.alrashid@example.com',
    preferredLanguage: 'Arabic',
    learningLanguages: ['English'],
    bio: 'مرحبا! English opens doors to the world 🇸🇦',
    online: true,
    messages: [
      { content: 'مرحبا! كيف حالك اليوم؟', translatedContent: 'Hello! How are you today?', senderId: 'fatima', senderLanguage: 'Arabic', receiverLanguage: 'English' },
      { content: 'Hello Fatima! I\'m good. How\'s Saudi Arabia?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Arabic' },
    ],
  },
  {
    name: 'Kofi Mensah',
    email: 'kofi.mensah@example.com',
    preferredLanguage: 'Twi',
    learningLanguages: ['English'],
    bio: 'Akwaaba! Sharing Ghanaian culture with the world 🇬🇭',
    online: false,
    messages: [
      { content: 'Akwaaba! Éte sɛn?', translatedContent: 'Welcome! How are you?', senderId: 'kofi', senderLanguage: 'Twi', receiverLanguage: 'English' },
      { content: 'Hey Kofi! Welcome to you too! I\'m great.', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Twi' },
      { content: 'Medaase! Ghana is a beautiful country with rich culture.', translatedContent: 'Thank you! Ghana is a beautiful country with rich culture.', senderId: 'kofi', senderLanguage: 'Twi', receiverLanguage: 'English' },
    ],
  },
  {
    name: 'Anna Kowalski',
    email: 'anna.kowalski@example.com',
    preferredLanguage: 'Polish',
    learningLanguages: ['English'],
    bio: 'Cześć! Learning English to travel the world 🇵🇱',
    online: true,
    messages: [
      { content: 'Cześć! Jak się masz?', translatedContent: 'Hello! How are you?', senderId: 'anna', senderLanguage: 'Polish', receiverLanguage: 'English' },
      { content: 'Hi Anna! I\'m doing great. How\'s Poland?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Polish' },
      { content: 'Polska jest piękna wiosną! Zapraszam do Krakowa.', translatedContent: 'Poland is beautiful in spring! I invite you to Krakow.', senderId: 'anna', senderLanguage: 'Polish', receiverLanguage: 'English' },
      { content: 'That sounds amazing! I\'d love to visit Krakow one day', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'Polish' },
    ],
  },
  {
    name: 'Liam O\'Brien',
    email: 'liam.obrien@example.com',
    preferredLanguage: 'English',
    learningLanguages: ['Spanish'],
    bio: 'Top of the morning! Learning Spanish 🇮🇪',
    online: false,
    messages: [
      { content: 'Hey there! I\'m trying to learn Spanish. Can you help?', translatedContent: null, senderId: 'liam', senderLanguage: 'English', receiverLanguage: 'Spanish' },
      { content: 'Of course! ¡Claro que sí! What would you like to learn?', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'English' },
      { content: 'How do you say "The weather is nice today" in Spanish?', translatedContent: null, senderId: 'liam', senderLanguage: 'English', receiverLanguage: 'Spanish' },
      { content: '"El clima está agradable hoy" - You\'re doing great!', translatedContent: null, senderId: TEST_USER_ID, senderLanguage: 'English', receiverLanguage: 'English' },
      { content: '¡Muchas gracias! You\'re a great teacher! 🙏', translatedContent: null, senderId: 'liam', senderLanguage: 'English', receiverLanguage: 'Spanish' },
    ],
  },
]

// Map of sender placeholder IDs to real user IDs (will be filled after creation)
const senderIdMap: Record<string, string> = {
  [TEST_USER_ID]: TEST_USER_ID,
}

async function main() {
  console.log('🌱 Starting ChatLingo seed...')

  // Create or find test user
  let testUser = await prisma.user.findUnique({ where: { id: TEST_USER_ID } })
  if (!testUser) {
    console.log('📝 Test user not found, creating...')
    testUser = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        name: 'Test User',
        email: 'test@test.com',
        password: PASSWORD_HASH,
        preferredLanguage: 'English',
        learningLanguages: '["Spanish","French"]',
        bio: 'ChatLingo test account',
        online: true,
      },
    })
  }
  console.log(`✅ Test user: ${testUser.name} (${testUser.email})`)

  // Clean up existing demo data (contacts, conversations, messages for demo users)
  const existingDemoEmails = demoUsers.map(u => u.email)
  const existingDemoUsers = await prisma.user.findMany({
    where: { email: { in: existingDemoEmails } },
    select: { id: true, email: true },
  })

  if (existingDemoUsers.length > 0) {
    console.log(`🧹 Cleaning up ${existingDemoUsers.length} existing demo users...`)
    const existingIds = existingDemoUsers.map(u => u.id)

    // Delete contacts
    await prisma.contact.deleteMany({
      where: {
        OR: [
          { userId: { in: existingIds } },
          { contactUserId: { in: existingIds } },
        ],
      },
    })

    // Delete messages in conversations with demo users
    const convs = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: { in: existingIds } },
          { participant2Id: { in: existingIds } },
        ],
      },
      select: { id: true },
    })
    if (convs.length > 0) {
      await prisma.message.deleteMany({
        where: { conversationId: { in: convs.map(c => c.id) } },
      })
    }

    // Delete conversations
    await prisma.conversation.deleteMany({
      where: {
        OR: [
          { participant1Id: { in: existingIds } },
          { participant2Id: { in: existingIds } },
        ],
      },
    })

    // Delete users
    await prisma.user.deleteMany({
      where: { id: { in: existingIds } },
    })
    console.log('✅ Cleanup done')
  }

  // Create demo users
  console.log('\n👤 Creating 15 demo users...')
  for (const demo of demoUsers) {
    const user = await prisma.user.create({
      data: {
        name: demo.name,
        email: demo.email,
        password: PASSWORD_HASH,
        preferredLanguage: demo.preferredLanguage,
        learningLanguages: JSON.stringify(demo.learningLanguages),
        bio: demo.bio,
        online: demo.online,
      },
    })
    // Map the placeholder senderId to real ID
    // Use first part of email as key (e.g., 'sakura' from 'sakura.yamamoto@example.com')
    const key = demo.email.split('.')[0]
    senderIdMap[key] = user.id
    console.log(`  ✅ ${demo.name} (${demo.preferredLanguage}) - ${demo.online ? '🟢 online' : '⚫ offline'}`)
  }

  // Create bidirectional contacts and conversations
  console.log('\n🤝 Creating contacts and conversations...')
  const conversationIds: string[] = []

  for (const demo of demoUsers) {
    const key = demo.email.split('.')[0]
    const demoUserId = senderIdMap[key]
    if (!demoUserId) {
      console.error(`  ❌ Could not find user ID for ${demo.name}`)
      continue
    }

    // Bidirectional contacts
    await prisma.contact.create({
      data: { userId: TEST_USER_ID, contactUserId: demoUserId },
    })
    await prisma.contact.create({
      data: { userId: demoUserId, contactUserId: TEST_USER_ID },
    })

    // Conversation
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: TEST_USER_ID,
        participant2Id: demoUserId,
        participant1Lang: testUser.preferredLanguage,
        participant2Lang: demo.preferredLanguage,
      },
    })
    conversationIds.push(conversation.id)

    // Create messages
    let lastMessage = ''
    let lastMessageAt: Date | null = null

    for (const msg of demo.messages) {
      const resolvedSenderId = msg.senderId === TEST_USER_ID
        ? TEST_USER_ID
        : senderIdMap[msg.senderId]

      if (!resolvedSenderId) {
        console.error(`  ❌ Could not resolve sender: ${msg.senderId}`)
        continue
      }

      const now = new Date()
      now.setMinutes(now.getMinutes() - (demo.messages.indexOf(msg) * 5))

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: resolvedSenderId,
          content: msg.content,
          translatedContent: msg.translatedContent,
          senderLanguage: msg.senderLanguage,
          receiverLanguage: msg.receiverLanguage,
          read: true,
          createdAt: now,
        },
      })

      lastMessage = msg.translatedContent || msg.content
      lastMessageAt = now
    }

    // Update conversation with last message
    if (lastMessage) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: lastMessage.length > 100 ? lastMessage.slice(0, 100) + '...' : lastMessage,
          lastMessageAt,
          updatedAt: lastMessageAt || new Date(),
        },
      })
    }

    console.log(`  ✅ ${demo.name}: ${demo.messages.length} messages`)
  }

  // Summary
  const totalContacts = await prisma.contact.count({
    where: { userId: TEST_USER_ID },
  })
  const totalConversations = await prisma.conversation.count({
    where: {
      OR: [
        { participant1Id: TEST_USER_ID },
        { participant2Id: TEST_USER_ID },
      ],
    },
  })
  const totalMessages = await prisma.message.count({
    where: { conversationId: { in: conversationIds } },
  })

  console.log('\n📊 Seed Complete!')
  console.log(`  👥 Contacts: ${totalContacts}`)
  console.log(`  💬 Conversations: ${totalConversations}`)
  console.log(`  📝 Messages: ${totalMessages}`)
  console.log('✅ All done!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
