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

---
## Task ID: 1-2,5,7-9,11-12
### Work Task
Build ALL backend API routes for ChatLingo Phases 2-7: Status/Stories, Groups, Channels/Communities, Broadcast Lists, Explore/Language Matchmaking, Live Rooms, and Cultural Spotlight.

### Work Summary
Created 20 API route files covering 7 feature areas. All routes use JWT authentication via `getTokenFromHeader`/`verifyToken`, Prisma ORM via `db`, and proper error handling with try/catch. Routes using AI translation leverage `translateText` from `@/lib/translate` or inline `z-ai-web-dev-sdk`.

**1. STATUS/STORIES (3 files):**
- `src/app/api/status/route.ts` — GET lists statuses from user's contacts + own statuses, filters expired (>24h), includes owner info, viewCount, viewed status. POST creates status with auto-set language and 24h expiry.
- `src/app/api/status/[id]/route.ts` — GET single status with full details, viewer list, expiry check (returns 410 for expired).
- `src/app/api/status/[id]/view/route.ts` — POST marks status as viewed using upsert (idempotent).

**2. GROUPS (4 files):**
- `src/app/api/groups/route.ts` — GET lists groups with member count, last message, unread count. POST creates group with members, GroupMember records, and Conversation (isGroup=true).
- `src/app/api/groups/[id]/route.ts` — GET group details with members list, languages, roles. PATCH (owner only) updates name/description. DELETE (owner only) deletes group.
- `src/app/api/groups/[id]/members/route.ts` — GET lists members with languages and roles. POST adds member. DELETE removes member (owner or self).
- `src/app/api/groups/[id]/settings/route.ts` — PATCH updates current user's language in group.

**3. CHANNELS/COMMUNITIES (4 files):**
- `src/app/api/channels/route.ts` — GET lists joined channels + discoverable public channels (limit 20). POST creates channel with auto-join for owner.
- `src/app/api/channels/[id]/route.ts` — GET channel details. POST joins channel. DELETE leaves channel (owner blocked from leaving).
- `src/app/api/channels/[id]/posts/route.ts` — GET paginated posts (20/page) with auto-translation to viewer's language. POST creates post (members only).
- `src/app/api/channels/discover/route.ts` — GET discovers public channels with search (`q`) and language (`lang`) filters. Excludes already-joined channels.

**4. BROADCAST LISTS (2 files):**
- `src/app/api/broadcast/route.ts` — GET lists user's broadcast lists with member details. POST creates list with members.
- `src/app/api/broadcast/[id]/send/route.ts` — POST sends broadcast message to all members, auto-translates to each member's language. Creates individual messages via conversations. Returns sent count.

**5. EXPLORE / LANGUAGE MATCHMAKING (3 files):**
- `src/app/api/explore/route.ts` — GET discovers content by type (people/channels/groups/rooms) with search and language filters. For "people": excludes current user and contacts. For "channels": public only. For "groups": excludes joined. For "rooms": live only.
- `src/app/api/explore/match/route.ts` — GET returns top 10 language exchange partner suggestions. Compatibility scoring based on: my learning languages ↔ their preferred language (+3 each), shared learning languages (+1 each).
- `src/app/api/explore/word-of-day/route.ts` — GET returns daily rotating phrase from a library of 50 phrases, each with cultural notes. Changes based on day-of-year index.

**6. LIVE ROOMS (3 files):**
- `src/app/api/rooms/route.ts` — GET lists live rooms with participant/speaker counts. POST creates room with auto-join as speaker.
- `src/app/api/rooms/[id]/route.ts` — GET room details with speakers/listeners/participants. POST joins room (speaker or listener). DELETE leaves room with ownership transfer.
- `src/app/api/rooms/[id]/toggle-role/route.ts` — POST toggles between speaker and listener, adjusting speaker count.

**7. CULTURAL SPOTLIGHT (1 file):**
- `src/app/api/spotlight/route.ts` — GET returns today's cultural spotlight. Uses a library of 20 cultures with 3 traditions each (60 combinations). Generates content via z-ai-web-dev-sdk if none exists for today. Stores in DB and translates to requested language via `translateText`.

**All routes follow consistent patterns:**
- JWT auth middleware check on every handler
- NextRequest/NextResponse imports from next/server
- Async params handling with `params: Promise<{ id: string }>`
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 410, 500)
- Prisma includes for relational data
- Error type checking with `error instanceof Error`

**Verification:**
- `npm run lint` — zero errors, zero warnings
- Dev log shows successful compilation with 200 responses
- 20 API route files created across 7 feature domains

---
## Task ID: 3,4,6,10,12
### Work Task
Build ALL frontend UI components for ChatLingo Phases 2-7: Status/Stories, Voice Messages, Group Chat, Channels/Communities, Explore/Language Matchmaking, Live Rooms, Cultural Spotlight, and Word of the Day.

### Work Summary

**1. STORE UPDATE (`src/lib/store.ts`)**
- Added 3 new type exports: `StatusItem`, `RoomParticipant`, `RoomItem`
- Added navigation tab state: `activeTab` (chats|status|channels|calls|explore) + `setActiveTab`
- Added Status/Stories state: `statuses[]`, `showStatusViewer`, `activeStatusIndex`, `showCreateStatus` with all setters
- Added dialog toggles: `showCreateGroup`, `showCreateChannel`, `showExplore`, `showBroadcast`
- Added Live Room state: `activeRoom`, `isInRoom`, `roomRole`, `isMicOn`, `isHandRaised`, `roomSubtitles[]` with actions `addRoomSubtitle` (keeps last 5 entries)
- All existing state and actions preserved unchanged

**2. CSS ANIMATIONS (`src/app/globals.css`)**
- `.wa-voice-waveform` — 10-bar animated waveform for voice messages with staggered delays
- `.wa-recording-pulse` — red pulsing dot for recording indicator
- `.wa-status-progress` — status viewer progress bars with `.fill` child
- `.wa-speaking-ring` — green pulsing ring for active speakers in rooms
- `.wa-live-dot` — red pulsing dot for live indicators
- `.wa-gradient-rotate` — rotating gradient background for cultural spotlight
- `.wa-slide-panel` — slide-in animation for group info panel (right)

**3. NEW COMPONENTS CREATED (13 files):**

- **`status-bar.tsx`** — WhatsApp-style stories row below search bar in sidebar. Loads statuses from `/api/status`, groups by owner, sorts unseen first. Shows "My Status" with + icon, contact avatars with gradient/gray ring based on seen status, "Add" button at end. Horizontal scrollable with `scrollbar-thin`.

- **`status-viewer.tsx`** — Full-screen status viewer overlay (z-[100]). Progress bars at top auto-advance every 5s with `requestAnimationFrame`. Gradient backgrounds (6 color options). Tap left/right third to navigate, center does nothing. Reply button creates/opens conversation with status owner. Mark as viewed via `/api/status/[id]/view`.

- **`create-status-dialog.tsx`** — WhatsApp green header dialog. Live preview with gradient background. Textarea input (500 chars), 6 gradient color picker (emerald/blue/red/purple/orange/pink), "Disappears in 24h" notice. Posts to `/api/status`.

- **`create-group-dialog.tsx`** — WhatsApp "New Group" dialog. Group name input, search contacts, multi-select with pills + X remove, green checkmark on selected. Creates via `POST /api/groups` with memberIds, then refreshes conversations.

- **`group-info-panel.tsx`** — Right slide-in panel (wa-slide-panel). Group avatar, name, description, member count. Language pair display. Member list with Crown icon for owner, language flags. "Add participant" button. Loads from `/api/groups/[id]`.

- **`channels-tab.tsx`** — Full channels view with "My Channels" / "Discover" tabs. Channel list with Hash icon, member count, language flag. Post feed view when selecting a channel (author, content, translation, likes). Follow button on discover. Search bar for discover. Posts loaded from `/api/channels/[id]/posts`.

- **`create-channel-dialog.tsx`** — WhatsApp green header. Name input, description textarea, Public/Private toggle buttons. Posts to `/api/channels`.

- **`explore-tab.tsx`** — Full explore page. Search bar, 5 category pills (People/Groups/Channels/Rooms/Partners). People: grid of user cards with Connect button → creates conversation. Groups: list with Join button. Channels: list with Follow button. Partners: compatibility score, reason, "Say Hello" button. Rooms: live indicator, speaker/listener count, Join buttons. Inline Word of the Day component. All data from `/api/explore` and `/api/explore/match`.

- **`spotlight-card.tsx`** — Rotating gradient card (changes daily). Globe icon + "Today's Cultural Spotlight" header. Culture name, tradition, description. Share and Learn More buttons. Loads from `/api/spotlight`.

- **`word-of-the-day.tsx`** — Card with green header. Phrase in original language, translations in 4-5 languages with flags. Cultural note in gray box. "Practice in Chat" button. Loads from `/api/explore/word-of-day`.

- **`rooms-tab.tsx`** — Live rooms list. Red LIVE badge, room name, description, language. Speaker/listener counts. Listen (gray) and Speak (green) buttons. Join via `POST /api/rooms/[id]`. Search bar. Creates room state on join.

- **`room-screen.tsx`** — Full-screen dark theme (#1F2C34) room experience. Connecting overlay. Speaker avatars with green wa-speaking-ring and waveform animation. Listener count with hand-raised indicator. Bottom controls: mic toggle (green/red), hand raise (yellow), leave (red). For listeners: "Request to Speak" button. Live translated subtitles at bottom (animate-slideUp). Language pair indicator at top.

- **`create-room-dialog.tsx`** — WhatsApp green header with Radio icon. Name input, description textarea, language dropdown (all 24 languages). Creates via `POST /api/rooms` and auto-joins as speaker.

**4. MODIFIED COMPONENTS (3 files):**

- **`chat-area.tsx`** — Added voice message recording: MediaRecorder API on mic button press-and-hold, recording UI (red pulsing dot, timer, trash cancel button), stop on release sends via WebSocket with `messageType: 'voice'`. Voice message bubbles show Play/Pause button + 10-bar CSS waveform animation + duration label. Playback with HTMLAudioElement.

- **`sidebar.tsx`** — Added StatusBar component below search bar (on chats tab). Added FAB menu with 4 options: New Contact, New Group, New Channel, Broadcast List (each with colored icon circles). FAB available on both mobile and desktop. Menu overlay dismisses on click outside.

- **`chat-interface.tsx`** — Complete tab switching: activeTab from store switches between chats/status/channels/calls/explore views. Renders all new components: ChannelsTab, ExploreTab, RoomScreen. All dialogs rendered conditionally. Mobile bottom nav now has 5 tabs (Camera, Chats, Status, Calls, Explore) with globe icon for Explore. Sidebar visible on desktop always, on mobile when no active conversation or non-chats tab.

**5. VERIFICATION:**
- `npm run lint` — zero errors, zero warnings
- Dev log shows `✓ Compiled in 128ms` and successful `GET / 200` responses
- All existing chat, call, and WebSocket functionality preserved
- 13 new components + 3 modified components + 1 store update + 1 CSS update = 18 files changed
