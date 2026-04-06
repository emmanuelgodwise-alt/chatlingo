---
Task ID: 1
Agent: Main Agent
Task: Build ChatLingo - Complete Phase 1 (Auth, Chat UI, Real-time Translation)

Work Log:
- Initialized fullstack dev environment
- Installed bcryptjs, jsonwebtoken, socket.io, socket.io-client
- Designed and pushed Prisma schema: User, Contact, Conversation, Message models
- Created auth utility (JWT sign/verify)
- Created languages utility (24 languages with flags)
- Created translation utility (z-ai-web-dev-sdk integration)
- Built API routes: signup, login, users, contacts, conversations, messages, language settings
- Built WebSocket mini-service on port 3003 with real-time translation
- Built Zustand state management store
- Built all UI components: SignUpForm, LoginForm, ChatInterface, Sidebar, ChatArea, ConversationItem, ContactItem, AddContactDialog, LanguageSettingsDialog, EmptyChatState
- Updated global CSS with scrollbar styles
- Fixed lint errors (require import, setState in effect)
- Both servers running (Next.js on 3000, WebSocket on 3003)

Stage Summary:
- Full ChatLingo app built with sign up, login, contact management, real-time chat, and automatic translation
- Database schema supports users, contacts, conversations with per-conversation language settings, and messages with original + translated content
- Translation engine uses z-ai-web-dev-sdk to translate messages in real-time via WebSocket
- 24 languages supported including English, Spanish, French, Yoruba, Igbo, Hausa, Arabic, Chinese, Japanese, Korean, etc.

---
## Task ID: r1-r12
### Work Task
Rebuild all ChatLingo frontend UI components to mirror WhatsApp's exact look and feel, while preserving all existing TypeScript logic, state management, API calls, and WebSocket connections.

### Work Summary
All 10 component files, the global CSS, layout, and chat interface were rebuilt with WhatsApp-accurate styling. Here is a detailed list of every change made:

**1. `src/app/globals.css` — Complete color scheme and pattern overhaul:**
- Replaced default shadcn color system with WhatsApp's exact palette (header #075E54, green #25D366, sent bubble #D9FDD3, chat bg #ECE5DD, received bubble #FFFFFF, input bg #F0F2F5, text primary #111B21, text secondary #667781, blue tick #53BDEB, border #E9EDEF)
- Added CSS custom properties for WhatsApp colors in the Tailwind theme
- Added `.wa-chat-bg` class with subtle doodle-like wallpaper pattern using CSS radial/linear gradients
- Added `.wa-bubble-tail-left` and `.wa-bubble-tail-right` CSS triangle tails for first message in bubble groups
- Added `.typing-dots` animation with 3-dot bounce effect (1.4s ease-in-out)
- Updated `.scrollbar-thin` to WhatsApp-style (6px, rgba(0,0,0,0.2) thumb)
- Added `.wa-shadow-sm`, `.wa-shadow-md`, `.wa-shadow-header` shadow utilities
- Added `.wa-fab` floating action button styles (green circle, shadow, hover scale)
- Added `.wa-bottom-nav` mobile navigation with active/inactive states
- Added `.wa-unread-badge` green badge with rounded pill styling
- Added `.wa-auth-gradient` for login/signup pages (135deg, #075E54 → #128C7E)

**2. `src/components/chatlingo/sign-up-form.tsx` — WhatsApp green auth page:**
- Background: WhatsApp green gradient (`wa-auth-gradient`)
- Brand header: white glassmorphic circle with Globe icon, white text
- Card: clean white, no border, rounded-lg
- Form inputs: `#E9EDEF` borders, `#25D366` focus ring
- Language selector: Globe icon with WhatsApp green color
- Submit button: `#25D366` WhatsApp green with "Next" text
- Sign-in link: `#075E54` color scheme
- All original form logic, validation, API calls preserved exactly

**3. `src/components/chatlingo/login-form.tsx` — WhatsApp green login:**
- Same gradient header, glassmorphic branding
- WhatsApp green "Login" button (`#25D366`)
- All original login logic preserved

**4. `src/components/chatlingo/sidebar.tsx` — Pixel-perfect WhatsApp sidebar:**
- Header: `#075E54` dark teal background, white text, ChatLingo title, search icon, three-dot menu
- Tabs: Chats/Contacts with green underline indicator on active, unread badge count on Chats tab
- Search bar: `#F0F2F5` bg, rounded-lg, search icon prefix
- Chat/Contact list items: delegated to child components
- FAB: `#25D366` green circle (visible on mobile only) for "New Chat"
- Bottom user bar: avatar with `#DFE5E7` bg, name, language flag indicator, logout button
- All original state management, WebSocket connections, API calls preserved

**5. `src/components/chatlingo/chat-area.tsx` — WhatsApp chat experience:**
- **Header**: `#075E54` bg, white text, back arrow (mobile), round avatar with online indicator, name + "online"/"last seen" status, subtle language flag pair, video/phone call icons, three-dot dropdown menu (language settings, search, contact info)
- **Messages area**: `.wa-chat-bg` doodle wallpaper background, encryption/translation notice banner, messages with:
  - Sent: `#D9FDD3` bg with right tail (CSS triangle), `#111B21` text, time bottom-right in dark semi-transparent
  - Received: `#FFFFFF` bg with left tail, sender name in `#53BDEB` for groups
  - Translation is INVISIBLE by default: receiver sees only translated text
  - "View original" button with Globe icon to reveal original text in gray italic
  - Blue double ticks (`#53BDEB`) on sent messages
  - Tail only on first message of consecutive group from same sender
- **Typing indicator**: CSS `.typing-dots` animation in white bubble with left tail
- **Input bar**: `#F0F2F5` bg, emoji (😊) button, attach (📎) button, rounded-full text input, language flag watermark, mic icon when empty → green send icon when text entered
- All original message sending, typing, WebSocket, read receipt logic preserved

**6. `src/components/chatlingo/conversation-item.tsx` — WhatsApp chat list item:**
- Avatar: 49px, `#DFE5E7` bg, green online indicator
- Name: 16px `#111B21`, bold when unread
- Last message: 14px `#667781` (or `#111B21` when unread), truncated single line
- Time: 12px, `#25D366` when unread, `#667781` otherwise
- Unread badge: green pill with white count
- Subtle language flag next to name
- Bottom border: `#E9EDEF` divider
- Active state: `#F0F2F5` bg highlight

**7. `src/components/chatlingo/contact-item.tsx` — WhatsApp contact item:**
- Same avatar styling (49px, online indicator)
- Name + language flag, language label in gray
- Bottom border divider, hover state

**8. `src/components/chatlingo/add-contact-dialog.tsx` — WhatsApp green dialog:**
- Green `#075E54` header with UserPlus icon and white text
- Search input: `#F0F2F5` bg, `#25D366` focus ring
- Search results: hover `#F0F2F5`, avatar, language info
- Add button: `#25D366` green, "✓ Added" state in green text
- All original search, add contact API logic preserved

**9. `src/components/chatlingo/language-settings-dialog.tsx` — WhatsApp language dialog:**
- Green `#075E54` header with Languages icon
- Language selectors: `#F0F2F5` bg, `#25D366` focus ring, flag + label format
- Language pair visual: centered card showing "You ↔ Them" with large flags and green ArrowRightLeft icon
- "How it works" info box: `#F0F2F5` bg
- Footer: Cancel + Save buttons, Save is `#25D366` green
- All original save/PATCH API logic preserved

**10. `src/components/chatlingo/empty-chat-state.tsx` — WhatsApp welcome:**
- Welcome variant: large green circle with Globe logo, light gray `#F0F2F5` background, "Welcome to ChatLingo" heading, Lock + encryption notice, numbered steps with green circles
- Select variant: "ChatLingo for Web" heading, MessageCircle icon in `#E9EDEF` circle, lock notice

**11. `src/components/chatlingo/chat-interface.tsx` — Mobile navigation:**
- Mobile-responsive sidebar (full width on mobile, hidden on desktop when chat active)
- Mobile bottom tab bar: Camera, Chats (active in green), Status, Calls — hidden on desktop (md:hidden)
- All original WebSocket, conversation loading, room join/leave logic preserved

**12. `src/app/layout.tsx` — Metadata update:**
- Title changed to "ChatLingo"
- Added WhatsApp system font stack as inline style

**13. Files NOT changed (as required):**
- `src/lib/store.ts` — Zustand store unchanged
- `src/lib/languages.ts` — Language utilities unchanged
- All API routes — unchanged
- Prisma schema — unchanged
- WebSocket service — unchanged
- Auth utilities — unchanged

**Verification:**
- `npm run lint` passes with zero errors
- Dev log shows successful compilation (✓ Compiled) and 200 responses on GET /

---
## Task ID: c1-c8
### Work Task
Add voice call and video call features with real-time translation to ChatLingo. Implement WebRTC peer-to-peer audio/video, Web Speech API for speech recognition and synthesis, Socket.io signaling, and backend translation via z-ai-web-dev-sdk.

### Work Summary

**Files Created:**

1. **`src/lib/webrtc.ts`** — WebRTC Peer Connection Manager
   - `getLocalStream(includeVideo)` — Gets microphone (and camera for video) with echo cancellation, noise suppression
   - `createPeerConnection(callbacks)` — Creates RTCPeerConnection with Google STUN servers (stun.l.google.com:19302, stun1, stun2)
   - `createOffer()` / `createAnswer()` — SDP offer/answer creation with local description set
   - `setRemoteDescription()` / `addIceCandidate()` — Remote peer handling
   - `toggleLocalAudio()` / `toggleLocalVideo()` — Mute/unmute controls
   - `closePeerConnection()` — Full cleanup of connection, local stream, and remote stream
   - `isWebRTCSupported()` — Browser capability check

2. **`src/lib/speech.ts`** — Speech Recognition & Synthesis Utilities
   - `LANGUAGE_BCP47_MAP` — Maps all 24 ChatLingo languages to BCP-47 codes (e.g., English→en-US, French→fr-FR, Yoruba→yo-NG)
   - `getBCP47Code(language)` — Language code converter
   - `startRecognition(language, onResult)` — Continuous speech recognition with interim results, auto-restart on silence/end
   - `stopRecognition()` — Cleanup
   - `speak(text, language)` — TTS with best available voice matching (prefix + exact match fallback)
   - `queueSpeak()` — Speech queue management
   - `stopSpeaking()` — Cancel all pending speech
   - `loadVoices()` — Async voice loading for browsers that load voices lazily

3. **`src/app/api/translate/route.ts`** — Real-time Translation API Endpoint
   - POST `/api/translate` — Accepts `{ text, sourceLanguage, targetLanguage }`
   - Uses z-ai-web-dev-sdk for translation, optimized for real-time call use (temperature 0.3, max_tokens 200)
   - Same-language shortcut returns text directly
   - Proper error handling with 400/500 responses

4. **`src/components/chatlingo/call-screen.tsx`** — Full WhatsApp-style Call Screen
   - **Ringing (Outgoing) screen**: Dark green gradient (#075E54→#064E46), large avatar with pulse/ping animations, "Calling..." with spinning loader, language pair indicator (flags + labels), end call button (#D32F2F)
   - **Incoming Call screen**: Same gradient, pulsing ring animations on avatar, "Incoming Voice/Video Call" text, "ChatLingo will translate your conversation" subtitle, Decline (red) + Accept (green #25D366) buttons
   - **Connected Call screen**: Voice calls show large avatar + duration timer; Video calls show remote video full-screen + local video PIP; live subtitles bar (semi-transparent black/40 backdrop blur with original text in white/40 and translated text in white with Globe icon); call controls: Mute, Speaker (voice), Video toggle (video), End call; translation badge showing "English → French" with spinning "Translating..." state

5. **CSS Animations** added to `src/app/globals.css`:
   - `.animate-fadeIn` — Scale + opacity entrance animation (0.3s)
   - `.animate-slideUp` — Slide up + opacity animation for subtitles (0.3s)

**Files Modified:**

6. **`src/lib/store.ts`** — Added call state to Zustand store
   - New types: `CallSubtitle`, `CallPartner`
   - State: `isInCall`, `callType`, `callStatus`, `callPartner`, `callConversationId`, `callMyLanguage`, `callTheirLanguage`, `callSubtitles[]`, `callMuted`, `callSpeakerOn`, `callVideoEnabled`, `callDuration`, `callTranslationPending`
   - Actions: `startCall()`, `receiveCall()`, `answerCall()`, `rejectCall()`, `endCall()`, `setCallStatus()`, `addCallSubtitle()`, `setCallMuted()`, `setCallSpeakerOn()`, `setCallVideoEnabled()`, `setCallDuration()`, `setCallTranslationPending()`
   - Subtitle auto-pruning: keeps last 5 entries max

7. **`mini-services/chat-service/index.ts`** — Added 6 call signaling Socket.io events
   - `call-offer` — Forwards SDP offer to callee, handles offline callee gracefully
   - `call-answer` — Forwards SDP answer to caller
   - `call-reject` — Notifies caller of rejection
   - `call-end` — Notifies other party when call ends
   - `ice-candidate` — Relays ICE candidates between peers
   - `call-translation` — Server-side translation of speech text, forwards translated result to target user

8. **`src/components/chatlingo/chat-area.tsx`** — Wired call buttons
   - Video button now calls `startCall({ type: 'video', ... })`
   - Phone button now calls `startCall({ type: 'voice', ... })`
   - Both disabled when already in a call (`isInCall`)

9. **`src/components/chatlingo/chat-interface.tsx`** — Complete call lifecycle management
   - Imports and renders `CallScreen` as full-screen overlay when `isInCall`
   - Socket event listeners: `incoming-call`, `call-answered`, `call-rejected`, `call-ended`, `ice-candidate`, `call-translated`
   - WebRTC initialization for outgoing calls: gets local stream → creates peer connection → creates offer → emits `call-offer`
   - ICE candidate relay between peers
   - Speech recognition auto-starts 1.5s after call connects, sends recognized text via `call-translation` socket event
   - Received translations displayed as subtitles and spoken via TTS
   - Call duration timer (updates every second)
   - Full cleanup on call end: stops recognition, stops TTS, closes WebRTC peer connection
   - Socket stored globally on `window.__chatlingo_socket` for use in CallScreen component

**Architecture:**
- Outgoing call flow: User clicks call button → store.startCall() → WebRTC init + getLocalStream → createOffer → socket 'call-offer' → peer receives 'incoming-call' → peer accepts → createAnswer → 'call-answer' → setRemoteDescription → connected → speech recognition starts → speech sent for translation → translated text received → subtitles + TTS
- Translation path: Browser SpeechRecognition → socket 'call-translation' → Server z-ai-web-dev-sdk translate → socket 'call-translated' → receiver sees subtitles + hears TTS

**Verification:**
- `npm run lint` — zero errors, zero warnings
- Dev log shows successful compilation with 200 responses
- Chat service running on port 3003 (confirmed with `lsof -i :3003`)
- All existing chat functionality preserved
