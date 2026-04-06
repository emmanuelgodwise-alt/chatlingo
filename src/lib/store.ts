import { create } from 'zustand'

export type AppView = 'signup' | 'login' | 'chat'

interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLanguage: string
  avatar?: string | null
}

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string | null
    online: boolean
    preferredLanguage: string
  }
  myLanguage: string
  theirLanguage: string
  lastMessage?: string | null
  lastMessageAt?: string | null
  unreadCount: number
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  translatedContent?: string | null
  senderLanguage: string
  receiverLanguage: string
  createdAt: string
  sender?: {
    id: string
    name: string
    avatar?: string | null
  }
}

interface ChatLingoState {
  // Auth
  view: AppView
  user: User | null
  token: string | null
  setView: (view: AppView) => void
  setUser: (user: User | null, token: string | null) => void
  logout: () => void

  // Contacts
  contacts: User[]
  setContacts: (contacts: User[]) => void

  // Conversations
  conversations: Conversation[]
  setConversations: (conversations: Conversation[]) => void
  activeConversation: Conversation | null
  setActiveConversation: (conversation: Conversation | null) => void

  // Messages
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void

  // UI State
  showAddContact: boolean
  setShowAddContact: (show: boolean) => void
  showLanguageSettings: boolean
  setShowLanguageSettings: (show: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useChatLingoStore = create<ChatLingoState>((set) => ({
  // Auth
  view: 'login',
  user: null,
  token: null,
  setView: (view) => set({ view }),
  setUser: (user, token) => {
    if (user && token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatlingo_token', token)
        localStorage.setItem('chatlingo_user', JSON.stringify(user))
      }
    }
    set({ user, token, view: user ? 'chat' : 'login' })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatlingo_token')
      localStorage.removeItem('chatlingo_user')
    }
    set({ user: null, token: null, view: 'login', conversations: [], messages: [], activeConversation: null })
  },

  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  activeConversation: null,
  setActiveConversation: (conversation) => set({ activeConversation: conversation, messages: [] }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id)
      if (exists) return state
      return { messages: [...state.messages, message] }
    }),

  // UI State
  showAddContact: false,
  setShowAddContact: (show) => set({ showAddContact: show }),
  showLanguageSettings: false,
  setShowLanguageSettings: (show) => set({ showLanguageSettings: show }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
