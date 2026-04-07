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

// ============================================
// Call State Types
// ============================================

export interface CallSubtitle {
  original: string
  translated: string
  timestamp: Date
}

export interface CallPartner {
  id: string
  name: string
  avatar?: string | null
}

// ============================================
// Status Types
// ============================================
export interface StatusItem {
  id: string
  owner: { id: string; name: string; avatar?: string | null }
  content: string
  mediaUrl?: string | null
  mediaType?: string
  language: string
  bgGradient: string
  createdAt: string
  expiresAt: string
  viewCount: number
  viewed: boolean
}

// ============================================
// Room Types
// ============================================
export interface RoomParticipant {
  id: string
  name: string
  avatar?: string | null
  role: 'speaker' | 'listener'
  preferredLanguage: string
}

export interface RoomItem {
  id: string
  name: string
  description?: string
  language: string
  speakerCount: number
  listenerCount: number
  isLive: boolean
  owner: { id: string; name: string; avatar?: string | null }
  participants: RoomParticipant[]
}

interface CallLingoState {
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

  // Navigation Tabs
  activeTab: 'chats' | 'status' | 'channels' | 'calls' | 'explore'
  setActiveTab: (tab: 'chats' | 'status' | 'channels' | 'calls' | 'explore') => void

  // Status/Stories
  statuses: StatusItem[]
  setStatuses: (statuses: StatusItem[]) => void
  showStatusViewer: boolean
  setShowStatusViewer: (show: boolean) => void
  activeStatusIndex: number
  setActiveStatusIndex: (index: number) => void
  showCreateStatus: boolean
  setShowCreateStatus: (show: boolean) => void

  // Group/Channel/Room/Explore dialogs
  showCreateGroup: boolean
  setShowCreateGroup: (show: boolean) => void
  showCreateChannel: boolean
  setShowCreateChannel: (show: boolean) => void
  showExplore: boolean
  setShowExplore: (show: boolean) => void
  showBroadcast: boolean
  setShowBroadcast: (show: boolean) => void

  // Room state
  activeRoom: RoomItem | null
  setActiveRoom: (room: RoomItem | null) => void
  isInRoom: boolean
  setIsInRoom: (inRoom: boolean) => void
  roomRole: 'speaker' | 'listener' | null
  setRoomRole: (role: 'speaker' | 'listener' | null) => void
  isMicOn: boolean
  setIsMicOn: (on: boolean) => void
  isHandRaised: boolean
  setIsHandRaised: (raised: boolean) => void
  roomSubtitles: Array<{ original: string; translated: string; speakerName: string }>
  addRoomSubtitle: (original: string, translated: string, speakerName: string) => void

  // Call State
  isInCall: boolean
  callType: 'voice' | 'video' | null
  callStatus: 'ringing' | 'incoming' | 'connected' | 'ended' | null
  callPartner: CallPartner | null
  callConversationId: string | null
  callMyLanguage: string
  callTheirLanguage: string
  callSubtitles: CallSubtitle[]
  callMuted: boolean
  callSpeakerOn: boolean
  callVideoEnabled: boolean
  callDuration: number
  callTranslationPending: boolean

  startCall: (params: {
    type: 'voice' | 'video'
    partner: CallPartner
    conversationId: string
    myLanguage: string
    theirLanguage: string
  }) => void
  receiveCall: (params: {
    type: 'voice' | 'video'
    partner: CallPartner
    conversationId: string
    callerId: string
    myLanguage: string
    theirLanguage: string
  }) => void
  answerCall: () => void
  rejectCall: () => void
  endCall: () => void
  setCallStatus: (status: 'ringing' | 'incoming' | 'connected' | 'ended' | null) => void
  addCallSubtitle: (original: string, translated: string) => void
  setCallMuted: (muted: boolean) => void
  setCallSpeakerOn: (on: boolean) => void
  setCallVideoEnabled: (enabled: boolean) => void
  setCallDuration: (duration: number) => void
  setCallTranslationPending: (pending: boolean) => void
}

export const useChatLingoStore = create<CallLingoState>((set) => ({
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

  // Navigation Tabs
  activeTab: 'chats',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Status/Stories
  statuses: [],
  setStatuses: (statuses) => set({ statuses }),
  showStatusViewer: false,
  setShowStatusViewer: (show) => set({ showStatusViewer: show }),
  activeStatusIndex: 0,
  setActiveStatusIndex: (index) => set({ activeStatusIndex: index }),
  showCreateStatus: false,
  setShowCreateStatus: (show) => set({ showCreateStatus: show }),

  // Group/Channel/Room/Explore dialogs
  showCreateGroup: false,
  setShowCreateGroup: (show) => set({ showCreateGroup: show }),
  showCreateChannel: false,
  setShowCreateChannel: (show) => set({ showCreateChannel: show }),
  showExplore: false,
  setShowExplore: (show) => set({ showExplore: show }),
  showBroadcast: false,
  setShowBroadcast: (show) => set({ showBroadcast: show }),

  // Room state
  activeRoom: null,
  setActiveRoom: (room) => set({ activeRoom: room }),
  isInRoom: false,
  setIsInRoom: (inRoom) => set({ isInRoom: inRoom }),
  roomRole: null,
  setRoomRole: (role) => set({ roomRole: role }),
  isMicOn: true,
  setIsMicOn: (on) => set({ isMicOn: on }),
  isHandRaised: false,
  setIsHandRaised: (raised) => set({ isHandRaised: raised }),
  roomSubtitles: [],
  addRoomSubtitle: (original, translated, speakerName) =>
    set((state) => ({
      roomSubtitles: [
        ...state.roomSubtitles.slice(-4),
        { original, translated, speakerName },
      ],
    })),

  // Call State - Initial values
  isInCall: false,
  callType: null,
  callStatus: null,
  callPartner: null,
  callConversationId: null,
  callMyLanguage: '',
  callTheirLanguage: '',
  callSubtitles: [],
  callMuted: false,
  callSpeakerOn: true,
  callVideoEnabled: true,
  callDuration: 0,
  callTranslationPending: false,

  // Call Actions
  startCall: (params) =>
    set({
      isInCall: true,
      callType: params.type,
      callStatus: 'ringing',
      callPartner: params.partner,
      callConversationId: params.conversationId,
      callMyLanguage: params.myLanguage,
      callTheirLanguage: params.theirLanguage,
      callSubtitles: [],
      callMuted: false,
      callSpeakerOn: true,
      callVideoEnabled: params.type === 'video',
      callDuration: 0,
      callTranslationPending: false,
    }),

  receiveCall: (params) =>
    set({
      isInCall: true,
      callType: params.type,
      callStatus: 'incoming',
      callPartner: params.partner,
      callConversationId: params.conversationId,
      callMyLanguage: params.myLanguage,
      callTheirLanguage: params.theirLanguage,
      callSubtitles: [],
      callMuted: false,
      callSpeakerOn: true,
      callVideoEnabled: params.type === 'video',
      callDuration: 0,
      callTranslationPending: false,
    }),

  answerCall: () => set({ callStatus: 'connected' }),

  rejectCall: () =>
    set({
      isInCall: false,
      callType: null,
      callStatus: null,
      callPartner: null,
      callConversationId: null,
      callSubtitles: [],
    }),

  endCall: () =>
    set({
      isInCall: false,
      callType: null,
      callStatus: null,
      callPartner: null,
      callConversationId: null,
      callSubtitles: [],
      callMuted: false,
      callSpeakerOn: true,
      callVideoEnabled: true,
      callDuration: 0,
      callTranslationPending: false,
    }),

  setCallStatus: (status) => set({ callStatus: status }),

  addCallSubtitle: (original, translated) =>
    set((state) => ({
      callSubtitles: [
        ...state.callSubtitles.slice(-4), // Keep last 5 subtitles max
        { original, translated, timestamp: new Date() },
      ],
      callTranslationPending: false,
    })),

  setCallMuted: (muted) => set({ callMuted: muted }),
  setCallSpeakerOn: (on) => set({ callSpeakerOn: on }),
  setCallVideoEnabled: (enabled) => set({ callVideoEnabled: enabled }),
  setCallDuration: (duration) => set({ callDuration: duration }),
  setCallTranslationPending: (pending) => set({ callTranslationPending: pending }),
}))
