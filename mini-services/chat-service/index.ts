import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const onlineUsers = new Map<string, { userId: string; socketId: string }>()

async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (!text.trim() || sourceLanguage === targetLanguage) return text

  try {
    const { default: ZAI } = await import('z-ai-web-dev-sdk')
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translation, nothing else. No explanations, no notes, no quotation marks. Preserve the original tone and meaning.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    })
    return completion.choices[0]?.message?.content?.trim() || text
  } catch (error) {
    console.error('Translation error:', error)
    return `[${targetLanguage}] ${text}`
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('authenticate', async (data: { userId: string }) => {
    const { userId } = data

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { online: true },
      })
    } catch {
      console.error(`User not found: ${userId}`)
    }

    onlineUsers.set(userId, { userId, socketId: socket.id })

    io.emit('user-online', { userId })
    console.log(`User authenticated: ${userId}, total online: ${onlineUsers.size}`)
  })

  socket.on('join-conversation', (data: { conversationId: string }) => {
    socket.join(`conversation:${data.conversationId}`)
    console.log(`Socket ${socket.id} joined conversation: ${data.conversationId}`)
  })

  socket.on('leave-conversation', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`)
  })

  socket.on(
    'send-message',
    async (data: {
      conversationId: string
      senderId: string
      content: string
      senderLanguage: string
      receiverLanguage: string
    }) => {
      const { conversationId, senderId, content, senderLanguage, receiverLanguage } = data

      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' })
          return
        }

        const isParticipant1 = conversation.participant1Id === senderId
        const effectiveSenderLang = isParticipant1
          ? conversation.participant1Lang
          : conversation.participant2Lang
        const effectiveReceiverLang = isParticipant1
          ? conversation.participant2Lang
          : conversation.participant1Lang

        let translatedContent = content
        if (effectiveSenderLang !== effectiveReceiverLang) {
          translatedContent = await translateText(
            content,
            effectiveSenderLang,
            effectiveReceiverLang
          )
        }

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
            content,
            translatedContent:
              effectiveSenderLang !== effectiveReceiverLang ? translatedContent : null,
            senderLanguage: effectiveSenderLang,
            receiverLanguage: effectiveReceiverLang,
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        })

        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: content,
            lastMessageAt: new Date(),
          },
        })

        const recipientId = isParticipant1
          ? conversation.participant2Id
          : conversation.participant1Id

        const recipientSocket = onlineUsers.get(recipientId)

        const messagePayload = {
          id: message.id,
          conversationId,
          senderId,
          content: message.content,
          translatedContent: message.translatedContent,
          senderLanguage: message.senderLanguage,
          receiverLanguage: message.receiverLanguage,
          createdAt: message.createdAt,
          sender: message.sender,
        }

        io.to(`conversation:${conversationId}`).emit('new-message', messagePayload)

        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('conversation-updated', {
            conversationId,
            lastMessage: content,
            lastMessageAt: new Date(),
          })
        }

        socket.emit('message-sent', messagePayload)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    }
  )

  socket.on('typing', (data: { conversationId: string; userId: string }) => {
    socket
      .to(`conversation:${data.conversationId}`)
      .emit('user-typing', { userId: data.userId })
  })

  socket.on('stop-typing', (data: { conversationId: string; userId: string }) => {
    socket
      .to(`conversation:${data.conversationId}`)
      .emit('user-stop-typing', { userId: data.userId })
  })

  socket.on(
    'update-languages',
    async (data: {
      conversationId: string
      userId: string
      myLanguage: string
      theirLanguage: string
    }) => {
      const { conversationId, userId, myLanguage, theirLanguage } = data

      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        })

        if (!conversation) return

        const isParticipant1 = conversation.participant1Id === userId

        const updateData: Record<string, string> = {}
        if (myLanguage) {
          updateData[isParticipant1 ? 'participant1Lang' : 'participant2Lang'] =
            myLanguage
        }
        if (theirLanguage) {
          updateData[isParticipant1 ? 'participant2Lang' : 'participant1Lang'] =
            theirLanguage
        }

        const updated = await prisma.conversation.update({
          where: { id: conversationId },
          data: updateData,
        })

        io.to(`conversation:${conversationId}`).emit('languages-updated', {
          conversationId,
          participant1Lang: updated.participant1Lang,
          participant2Lang: updated.participant2Lang,
        })
      } catch (error) {
        console.error('Language update error:', error)
      }
    }
  )

  socket.on('read-messages', async (data: { conversationId: string; userId: string }) => {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId: data.conversationId,
          senderId: { not: data.userId },
          read: false,
        },
        data: { read: true },
      })

      io.to(`conversation:${data.conversationId}`).emit('messages-read', {
        conversationId: data.conversationId,
        readBy: data.userId,
      })
    } catch (error) {
      console.error('Read messages error:', error)
    }
  })

  socket.on('disconnect', async () => {
    let disconnectedUserId: string | null = null

    for (const [userId, user] of onlineUsers.entries()) {
      if (user.socketId === socket.id) {
        disconnectedUserId = userId
        onlineUsers.delete(userId)
        break
      }
    }

    if (disconnectedUserId) {
      try {
        await prisma.user.update({
          where: { id: disconnectedUserId },
          data: { online: false },
        })
      } catch {
        // User might not exist
      }

      io.emit('user-offline', { userId: disconnectedUserId })
      console.log(`User disconnected: ${disconnectedUserId}`)
    }

    console.log(`Socket disconnected: ${socket.id}, total online: ${onlineUsers.size}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`ChatLingo WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...')
  httpServer.close(() => {
    prisma.$disconnect()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...')
  httpServer.close(() => {
    prisma.$disconnect()
    process.exit(0)
  })
})
