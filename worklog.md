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

---
## Task ID: 4
### Work Task
Add learning-related state and actions to the existing Zustand store (`src/lib/store.ts`) for the ChatLingo Learning feature. Must not modify or remove any existing state/actions.

### Work Summary
Added 5 new exported TypeScript interfaces and 16 new state properties with their corresponding actions to the Zustand store, all placed between the Room state section and Call State section.

**New Types Added (before CallLingoState interface):**
- `LearningProfileData` — User learning profile with target/native languages, level, XP, streaks, lessons completed, last practice timestamp
- `LearningPairData` — Language exchange partner pairing with partner info, what user learns/teaches
- `LessonData` — Lesson metadata with title, category, languages, level, XP reward, exercises count, and optional progress tracking
- `ExerciseData` — Individual exercise with type (translation/fill_blank/listening/matching/speaking), question, answer, options, hint, XP reward
- `LeaderboardEntry` — Leaderboard ranking entry with user info, XP, level, streak, lessons, rank

**New State Properties Added to CallLingoState interface:**
- `learningProfile` / `setLearningProfile` — Current user's learning profile
- `learningPairs` / `setLearningPairs` — Language exchange partner pairs
- `availableLessons` / `setAvailableLessons` — List of available lessons
- `activeLesson` / `setActiveLesson` — Currently active lesson (also resets exercise state)
- `activeExercises` / `setActiveExercises` — Exercises for current lesson
- `currentExerciseIndex` / `setCurrentExerciseIndex` — Current exercise position
- `lessonInProgress` / `setLessonInProgress` — Whether a lesson is actively being taken
- `exerciseResults` / `addExerciseResult` / `resetExerciseResults` — Exercise answer tracking with auto score increment
- `lessonScore` / `setLessonScore` — Current lesson score (correct answers count)
- `showLearnSetup` / `setShowLearnSetup` — Learning setup dialog visibility
- `showLearnPairDialog` / `setShowLearnPairDialog` — Language pair dialog visibility
- `showLeaderboard` / `setShowLeaderboard` — Leaderboard dialog visibility
- `showLessonResult` / `setShowLessonResult` — Lesson result dialog visibility
- `lastLessonResult` / `setLastLessonResult` — Last completed lesson result (score, total, XP, completion status)

**Key Implementation Details:**
- `setActiveLesson` also resets `currentExerciseIndex`, `exerciseResults`, and `lessonScore` to 0
- `addExerciseResult` appends to results array and auto-increments `lessonScore` when answer is correct
- `resetExerciseResults` clears results, score, and exercise index together
- `activeTab` type kept as `'chats' | 'status' | 'channels' | 'calls' | 'explore'` (unchanged)
- All existing state and actions preserved exactly as-is

**Verification:**
- `npm run lint` — zero errors, zero warnings
- TypeScript compilation: no new errors introduced (all pre-existing errors unrelated to store changes)
- File: `src/lib/store.ts` only modified

---
## Task ID: 3
### Work Task
Create all 8 backend API route files for the Language Exchange Learning System: setup, profile, pair, lessons list, lesson detail, submit answers, leaderboard, and seed data.

### Work Summary
Created 8 API route files under `src/app/api/learn/` covering the complete Language Exchange Learning System backend. All routes follow the existing project patterns: JWT auth via `getTokenFromHeader`/`verifyToken`, Prisma ORM via `db`, NextRequest/NextResponse from `next/server`, proper try/catch error handling with HTTP status codes.

**1. `src/app/api/learn/setup/route.ts` — POST**
- Creates or updates LearningProfile for authenticated user
- Body: `{ targetLanguage, nativeLanguage }`
- Uses `prisma.learningProfile.upsert()` with userId unique constraint
- Returns the profile with 201 status

**2. `src/app/api/learn/profile/route.ts` — GET**
- Returns user's LearningProfile
- Also returns their LearningPairs (both as learner and tutor) with partner info (id, name, avatar, preferredLanguage)
- Returns 404 if no profile exists

**3. `src/app/api/learn/pair/route.ts` — POST**
- Body: `{ partnerId }`
- Validates partner exists and both users have LearningProfiles
- Creates TWO mutual LearningPair records in a transaction: User learns partner's native language, partner learns user's native language
- Prevents self-pairing and duplicate pairs (returns 409)
- Returns both pairs with 201 status

**4. `src/app/api/learn/lessons/route.ts` — GET**
- Query params: `targetLanguage` (required), `level` (optional)
- Returns published lessons with exercise count (`_count`)
- Ordered by level asc, then orderIndex asc

**5. `src/app/api/learn/lessons/[id]/route.ts` — GET**
- Returns single lesson with all exercises ordered by orderIndex
- Parses exercise options from JSON string to array
- Returns user's LessonProgress for this lesson if exists
- Uses async `params: Promise<{ id: string }>` pattern

**6. `src/app/api/learn/submit/route.ts` — POST**
- Body: `{ lessonId, answers: Array<{ exerciseId, userAnswer }> }`
- Verifies lesson exists, builds exercise map for lookup
- Calculates score (percentage), awards XP per correct exercise (5xp each)
- Upserts LessonProgress (updates bestScore, attempts, completed status)
- Creates ExerciseAttempt records in a transaction
- Updates LearningProfile: totalXp, currentStreak (consecutive day detection), longestStreak, lessonsCompleted, level (auto-calculated from XP thresholds: 100=L2, 500=L3), lastPracticeAt
- Returns: `{ score, totalExercises, xpEarned, newTotalXp, lessonCompleted, streak }`

**7. `src/app/api/learn/leaderboard/route.ts` — GET**
- Query params: `targetLanguage` (optional filter)
- Returns top 50 users by totalXp
- Includes contact/friend detection and current user rank
- Returns global leaderboard and friends-only leaderboard separately
- Each entry: rank, userId, name, avatar, totalXp, level, currentStreak, lessonsCompleted, isCurrentUser, isFriend

**8. `src/app/api/learn/seed/route.ts` — POST**
- Seeds comprehensive lesson content for 8 language pairs: Spanish, French, German, Chinese, Arabic, Yoruba, Hindi, Swahili
- Each language pair gets 18 lessons across categories:
  - Vocabulary (10 lessons): Greetings, Food & Drinks, Numbers, Colors, Family, Animals, Weather, Clothing, Body Parts, Emotions
  - Phrases (4 lessons): Common Expressions, Asking Directions, At Restaurant, Shopping
  - Grammar (4 lessons): Basic Sentence Structure, Articles/Gender (or Measure Words/Tones for non-European), Verb Conjugation Basics, Tenses
- Each lesson has 5-6 exercises of varying types: translation, fill_blank, listening, matching
- XP rewards: vocabulary 10xp, phrases 15xp, grammar 20xp; exercises 5xp each
- Levels range from 1 (Beginner) to 3 (Advanced)
- Distractors generated from other words/phrases in the same lesson
- Correct answers are always included in the options array
- Options stored as JSON strings in the database
- Idempotent: returns existing count if lessons already seeded

**Verification:**
- TypeScript compilation: zero errors in all new `api/learn/` files (pre-existing errors in other files remain unchanged)
- Dev server compiles successfully with 200 responses
- 8 API route files created following consistent project patterns

---
## Task ID: 5b
### Work Task
Create the main lesson/exercise flow screen component (`lesson-screen.tsx`) for the ChatLingo Language Learning System. The component renders when a user is actively taking a lesson and supports 5 exercise types (translation, fill_blank, listening, matching, speaking), a progress bar, correct/wrong feedback animations, and a lesson completion screen.

### Work Summary

**File Created: `src/components/chatlingo/lesson-screen.tsx`** — A comprehensive `'use client'` component (~1100 lines) implementing the complete lesson/exercise flow.

**1. Progress Bar (Top):**
- Full-width green progress bar showing `currentExerciseIndex / totalExercises` with smooth CSS transition
- Exercise counter text: "3 / 8 exercises"
- Correct count indicator
- X button with AlertDialog confirmation to quit lesson (calls `setLessonInProgress(false)`, `resetExerciseResults()`, `setActiveLesson(null)`)

**2. Exercise Display Area — 5 Exercise Types:**

- **TranslationExercise** (`type === 'translation'`):
  - Shows word/phrase in target language in a white card
  - "Translate this to [nativeLanguage]" instruction
  - 4 option buttons with selection highlight
  - Correct = green border + green bg + check icon + XP animation
  - Wrong = red border + red bg + X icon + shake animation + green highlight on correct answer
  - Hint button (Lightbulb icon) reveals hint text in amber box

- **FillBlankExercise** (`type === 'fill_blank'`):
  - Sentence with `___` replaced by styled inline blank that fills with selected option
  - "Fill in the blank" instruction
  - Same correct/wrong feedback pattern as translation
  - Hint support

- **ListeningExercise** (`type === 'listening'`):
  - Large speaker button (Volume2 icon) with pulse animation when not yet played
  - "Listen and choose the correct translation" instruction
  - Uses `speak()` from `@/lib/speech` (Web Speech Synthesis) to speak question text in target language
  - Replay button after first play
  - Same option feedback pattern

- **MatchingExercise** (`type === 'matching'`):
  - Two-column layout: left words + shuffled right translations
  - User taps left word (highlights green), then taps matching right translation
  - Correct match = both items turn green with checkmark + opacity fade
  - Wrong match = red flash + shake animation on wrong item
  - Progress bar showing matches completed
  - Parses `correctAnswer` format "word1:trans1,word2:trans2"
  - Auto-advances when all pairs matched

- **SpeakingExercise** (`type === 'speaking'`):
  - Shows word/phrase to pronounce with "Listen to pronunciation" button
  - "Say this in [targetLanguage]" instruction
  - Large microphone button: green when idle, red pulsing when recording, green/red for feedback
  - Uses `startRecognition()` from `@/lib/speech` (Web Speech Recognition)
  - Shows recognized text in real-time
  - Correct/wrong feedback with correct answer reveal on wrong
  - Recording indicator with red pulsing dot

**3. Bottom Bar:**
- "Show Hint" link (for exercises with hints, not matching/speaking)
- "Check" button (green, disabled until option selected, disabled during feedback)
- Matching shows instruction text instead of Check button
- Speaking shows "Start Speaking" / "Stop Recording" buttons

**4. Lesson Complete Screen:**
- Celebration header: 🏆 (perfect) / 🎉 (passed) / 💪 (keep practicing)
- Score display with color-coded percentage
- "You got X out of Y correct!" message
- 3-column stats grid: XP Earned (Star), Day Streak (Flame), Total XP (Trophy)
- Green "Lesson Completed!" badge when score ≥ 70%
- "Continue" button → quits lesson (returns to learn tab)
- "Try Again" button → resets results and restarts from exercise 1
- Submitting state with spinner during API call
- Calls `setShowLessonResult(true)` with result data for parent result dialog

**5. State Management:**
- Reads from store: `activeLesson`, `activeExercises`, `currentExerciseIndex`, `learningProfile`, `token`, `lessonScore`
- Uses store actions: `addExerciseResult()`, `resetExerciseResults()`, `setCurrentExerciseIndex()`, `setLessonInProgress()`, `setActiveLesson()`, `setLearningProfile()`, `setLastLessonResult()`, `setShowLessonResult()`
- On completion: POSTs to `/api/learn/submit` with `{ lessonId, answers }` array
- Updates `learningProfile` with response data (XP, streak, level, lessons completed)
- Local state resets on exercise change (selection, feedback, recording, matching)
- Cleanup: stops recognition and speech on quit

**6. Animations & Visual Polish:**
- XP floating animation (+XP pill) on correct answer using `animate-slideUp`
- Shake animation on wrong answers via Tailwind `animate-[shake_0.4s_ease-in-out]`
- Pulse animation on mic button while recording
- Fade-in on lesson complete screen
- Smooth progress bar transition (500ms ease-out)
- WhatsApp green theme throughout (#25D366, #075E54, #E7FCE3, #D9FDD3)
- Large touch-friendly buttons (py-3.5, min 48px height)
- Exercise type badges with emoji and color-coded backgrounds

**7. Utility Functions:**
- `parseMatchingPairs()` — Parses "word1:trans1,word2:trans2" format into Map
- `shuffleArray()` — Fisher-Yates shuffle for matching right column
- Sub-components extracted for each exercise type for maintainability

**Verification:**
- `npx tsc --noEmit` — zero errors related to lesson-screen.tsx
- `npm run lint` — zero errors, zero warnings
- All imports resolved: store, shadcn/ui (Button, AlertDialog), speech utilities, lucide-react icons

---
## Task ID: 5a
### Work Task
Create the main Learn Tab component (`src/components/chatlingo/learn-tab.tsx`) — the learning dashboard that shows when a user clicks the "Learn" tab in navigation.

### Work Summary
Created `src/components/chatlingo/learn-tab.tsx` — a comprehensive, WhatsApp-themed learning dashboard component with the following sections:

**1. Header Bar** — Green `#075E54` background with `GraduationCap` icon, "Language Exchange" title, Trophy (leaderboard) and Settings (setup) buttons using `wa-shadow-header` and hover:bg-white/10 effects.

**2. Welcome Screen (no profile)** — Shown when no learning profile exists:
- Animated globe illustration area with floating emojis (🗣️📚✨) using `animate-bounce`
- "Start Your Language Journey" heading with descriptive text
- Green "Get Started" button → calls `setShowLearnSetup(true)`
- "Already set up? Learn with a friend" link → calls `setShowLearnPairDialog(true)`

**3. Profile Stats Card (profile exists)** — Grid of 4 stat cells (🔥 Streak, ⭐ Total XP, 📚 Completed, 🏆 Best Streak) with dividers. Below: Level badge (Beginner/Intermediate/Advanced), target language flag indicator, and XP progress bar with gradient fill to next level threshold.

**4. Learning Partners Section** — Lists partner cards with avatar, name, "I learn/I teach" language flags, and "Chat" button. "Add Partner" button in header. Max height with scroll. Transforms raw API pair format to store's `LearningPairData` type.

**5. "Need a Partner?" Prompt (no pairs)** — Green gradient card with Users icon, description, and "Find a Partner" button.

**6. Lesson Categories Section** — Tab filters (All/Vocabulary/Phrases/Grammar) with category icons (📖💬📝). Grid of lesson cards, each showing:
- Category icon with colored background (blue/purple/amber)
- Lesson title with line-clamp-2
- Level badge (green/yellow/red) + 3 difficulty dots + XP reward + exercise count
- Progress: green checkmark for completed, score bar for in-progress, best score/attempts display
- Hover effects with border color change and shadow
- Click handler fetches full lesson detail from `/api/learn/lessons/[id]`, sets store state for active lesson/exercises/inProgress

**Helper Functions:**
- `getLevelLabel(level)` — Maps 1/2/3 → Beginner/Intermediate/Advanced
- `getLevelColor(level)` — Returns bg/text/dot colors per level
- `getNextLevelThreshold(xp)` — Calculates progress toward next level (0→100→500 XP thresholds)

**API Integration:**
- On mount: fetches `/api/learn/profile` (GET, JWT auth) for profile + pairs
- If profile found: fetches `/api/learn/lessons?targetLanguage={lang}` for lesson list
- `handleStartLesson` fetches `/api/learn/lessons/{id}` for exercises + progress
- Uses store token for all `Authorization: Bearer` headers
- Loading states: full-page spinner on initial load, inline spinner for lessons

**Style Guidelines Followed:**
- WhatsApp color palette (#075E54, #25D366, #D9FDD3, #ECE5DD, #E9EDEF, #F0F2F5, #111B21, #667781, #8696A0)
- Tailwind CSS classes throughout, responsive layout (grid-cols-1 sm:grid-cols-2)
- Custom scrollbar (scrollbar-thin), max-h with overflow-y-auto
- Smooth transitions, hover/active states
- Bottom spacing for mobile nav (h-16 md:hidden)

**Verification:**
- `npx tsc --noEmit` — zero errors in learn-tab.tsx
- `npm run lint` — zero errors/warnings
- Dev server compiles successfully with 200 responses

---
## Task ID: 5c
### Work Task
Create three learning dialog components for ChatLingo: learn-setup-dialog, learn-pair-dialog, and leaderboard-dialog. All using WhatsApp styling with fixed overlay pattern.

### Work Summary
Created 3 new dialog components under `src/components/chatlingo/` following the WhatsApp design system and overlay dialog pattern.

**1. `src/components/chatlingo/learn-setup-dialog.tsx` — Learning Profile Setup Dialog**
- Fixed overlay pattern: `fixed inset-0 z-50 bg-black/40 flex items-center justify-center`
- WhatsApp green header (#075E54) with 🎓 icon and "Start Learning" title
- Visual language pair display showing native → target language with flag circles and ArrowRight icon
- Native language dropdown auto-filled from `user.preferredLanguage`, editable with custom dropdown (all 24 LANGUAGES)
- Target language dropdown excludes native language from options
- Info box explaining the learning features with GraduationCap icon
- "Begin Learning" button: POST to `/api/learn/setup` with `{ targetLanguage, nativeLanguage }`
- On success: updates `learningProfile` in store via `setLearningProfile`, closes dialog
- Click-outside detection to close dropdowns
- Loading state on submit button ("Setting up...")

**2. `src/components/chatlingo/learn-pair-dialog.tsx` — Language Exchange Partner Dialog**
- Same fixed overlay pattern and green header with 🤝 icon
- Guard: if no `learningProfile`, shows "Set up your learning profile first" message with AlertCircle icon
- Fetches contacts from `/api/contacts` with JWT auth on mount
- Contact list with: avatar (initials fallback), name, preferred language with flag, online status (green dot)
- Tap contact to select → highlighted with green border and checkmark
- Exchange preview panel appears: shows language pair visual ("You learn [their language], they learn [your language]")
- "Pair with [name]" button: POST to `/api/learn/pair` with `{ partnerId }`
- On success: refreshes pairs via `/api/learn/profile`, closes dialog
- Loading spinner during contact fetch and pairing submit
- Empty state for no contacts

**3. `src/components/chatlingo/leaderboard-dialog.tsx` — Leaderboard Dialog**
- Same fixed overlay pattern and green header with 🏆 icon
- Tab filter: "🌍 Global" and "👥 Friends" with green underline active indicator
- Fetches from `/api/learn/leaderboard` with `?friends=true` for friends tab
- Each entry displays: rank number, avatar (initials or image), name, level with Star icon, streak with Flame icon, XP count
- Top 3 special styling: 🥇🥈🥉 medals, colored avatar borders (gold/silver/bronze), light gray background
- Current user highlighted with green background (#25D366/10) and "(You)" label
- Empty state: "No learners yet. Be the first!" with Trophy icon
- Level labels: Beginner (L1), Elementary (L2), Intermediate (L3), Advanced (L4), Expert (L5+)

**Consistent Patterns Across All 3 Files:**
- `'use client'` directive
- `useChatLingoStore` for state (token, learningProfile, dialog visibility, etc.)
- JWT `Authorization: Bearer ${token}` header on all API calls
- WhatsApp color scheme: header #075E54, buttons #075E54/#128C7E, borders #E9EDEF, bg #F0F2F5, text #111B21/#667781
- Inner card: `bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto`
- X close button in header (top-right)
- lucide-react icons throughout
- Loading spinners for async operations

**Verification:**
- `npx tsc --noEmit` — zero TypeScript errors in all 3 new files
- `npm run lint` — zero errors, zero warnings
- Dev server compiles successfully with 200 responses
