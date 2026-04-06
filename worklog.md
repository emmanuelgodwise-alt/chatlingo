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
