# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A WhatsApp clone built with React/Vite featuring real-time messaging, Firebase authentication, and responsive design. The app supports multiple authentication methods (Google, phone number, anonymous) and includes features like voice messaging, image sharing, and emoji support with Arabic language support.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

# Preview production build
npm run preview
```

## Architecture

### Authentication Flow
- Multiple auth methods: Google OAuth, phone verification, anonymous login
- Users progress through welcome → signup → OTP verification → userInfo setup → main app
- Authentication state managed in `useUser` store with localStorage persistence
- Protected routes use `RequireAuth` component checking user verification status

### Core Application Structure

**Main Layout (Home.jsx)**:
- Split-screen desktop layout (sidebar + chat area)
- Mobile-responsive with single-screen navigation
- Left sidebar: `HomePage` component (user list, search)
- Right area: `ChatPage` (placeholder) or `ChatPageUser` (active chat)

**State Management (Zustand stores)**:
- `useUser`: Current user, authentication state, profile management
- `useSelectedUser`: Active chat selection
- `useMessages`: Message data and operations
- `useUsers`: UI state (profile view, user list visibility)
- `useSignUp`: Registration flow state

### Firebase Integration

**Firestore Collections Structure**:
```
users/
  {userId}/
    lastMessage/{partnerId} - Most recent message with each user
    messages/{partnerId}/chat/{messageId} - Individual chat messages

messages/{uniqueChatId} - Chat connection tracking (sender/receiver presence)
```

**Storage**: User avatars and message media in organized folders

### Real-time Features

**Message Handling**:
- Real-time message updates using Firebase `onSnapshot`
- Bidirectional message storage (both users have copies)
- Read/unread status tracking
- Connection tracking (both users viewing chat)
- Pagination with `lastDoc` cursors for chat history

**Presence System**:
- Online/offline status updates on visibility change
- Last seen timestamps with Arabic formatting
- Chat view tracking for message delivery status

### Key Components Architecture

**HomePage**: Main user interface with search, user list, and friend management
- Manages user discovery, friend connections, and last message previews
- Real-time user list updates and search functionality
- Handles unread message filtering and notifications

**ChatPage Components**: Located in `src/components/ChatePage/`
- `ChatPageUser`: Main chat interface with message input/display
- `Message`: Individual message rendering with media support
- `AudioPlayer`: Voice message playback with waveform visualization
- `ViewFullImage`: Image viewer with download capabilities

### Custom Hooks

**useChat**: Comprehensive chat functionality
- Message sending/receiving with real-time updates
- File upload handling (images, voice messages)
- Chat pagination and loading states
- Emoji integration with URL replacement
- Arabic text detection and RTL support
- Chat deletion and cleanup operations

**useAudio**: Voice message recording and playback management

### Responsive Design
- Mobile-first approach with breakpoint at 768px
- Single-screen mobile navigation vs split desktop layout
- Touch-friendly UI elements and gestures
- Arabic language support with RTL text handling

### Media Features
- Image sharing with Firebase Storage integration
- Voice message recording using `react-audio-voice-recorder`
- Audio playback with `wavesurfer.js` visualization
- File download capabilities with `file-saver`
- Lazy image loading with `react-lazy-load-image-component`

### Development Notes
- Uses React Router v6 with lazy loading for code splitting
- Vite build system with React plugin
- Environment variables for Firebase configuration (prefix: `VITE_`)
- Emoji picker integration with custom category labels in Arabic
- Moment.js for date/time formatting with Arabic locale support
- React Icons for consistent iconography
- Toast notifications using `react-toastify`

### Code Patterns
- Functional components with hooks throughout
- Zustand for lightweight state management
- Custom hooks for complex logic encapsulation
- Lazy loading for performance optimization
- Error boundaries and loading states
- Firebase real-time subscriptions with cleanup
- Local state sync with Firebase for optimistic updates

## Available MCP Servers

**Configured MCP Servers:**
- **Context7** - Library documentation and framework patterns (`@upstash/context7-mcp`)
- **Sequential Thinking** - Complex problem solving and architectural analysis (`@modelcontextprotocol/server-sequential-thinking`)
- **Shadcn/ui** - Pre-built React UI component library (`@jpisnice/shadcn-ui-mcp-server`)

**Global MCP Servers (Available):**
- **Serena** - Advanced codebase analysis and semantic navigation
- **Brave Search** - Real-time web search and local business search
- **Exa Search** - AI-powered web search with content extraction
- **IDE Integration** - VS Code diagnostics and code execution

**Built-in Claude Code Tools:**
- **Native Tools** - File operations (Read, Write, Edit, MultiEdit), search (Grep, Glob), execution (Bash)
- **Web Research** - WebSearch and WebFetch for documentation and troubleshooting

### When to Use Each MCP Server

**📚 Context7 MCP** - *Use for official documentation and framework patterns*
- **When**: Need library docs, best practices, framework-specific patterns
- **Best for**: React patterns, Firebase documentation, Vite configurations, wavesurfer.js docs
- **Examples**: Getting React 18 hooks patterns, Firebase v10 authentication flows

**🧠 Sequential Thinking MCP** - *Use for complex analysis and problem-solving*
- **When**: Debugging complex issues, architectural decisions, systematic analysis
- **Best for**: Multi-step reasoning, root cause analysis, system design
- **Examples**: Performance bottleneck analysis, Firebase real-time sync issues

**🧩 Shadcn/ui MCP** - *Use for consistent UI components*
- **When**: Need proven UI patterns, quick component implementation
- **Best for**: Standard components (buttons, dialogs, forms, tables)
- **Examples**: Modal dialogs, input fields, navigation components

**🔍 Serena MCP** - *Use for codebase exploration and intelligent editing*
- **When**: Navigating complex code, finding symbols, refactoring
- **Best for**: Understanding project structure, symbol-based editing
- **Examples**: Finding all component exports, locating hook definitions, intelligent refactoring

**🔍 Brave Search MCP** - *Use for real-time web research*
- **When**: Quick searches, finding resources, troubleshooting
- **Best for**: Real-time information, documentation discovery
- **Examples**: Latest React updates, Firebase best practices, Arabic localization

**🕷️ Exa Search MCP** - *Use for advanced web content extraction*
- **When**: Need structured data from websites, research, documentation scraping
- **Best for**: Technical documentation research, feature inspiration
- **Examples**: Scraping messaging app UX patterns, React component libraries

**💻 IDE Integration MCP** - *Use for development environment integration*
- **When**: Need VS Code diagnostics, code execution
- **Best for**: Running Python code, getting language diagnostics
- **Examples**: Testing algorithms, checking TypeScript errors

**🛠️ Native Claude Code Tools** - *Use for direct codebase operations*
- **Grep/Glob**: Fast pattern searching and file discovery
- **Read/Write/Edit**: File operations and code modifications
- **Bash**: Running development commands and scripts
- **Examples**: Project analysis, code refactoring, running tests

### MCP Usage Examples for WhatsApp Clone

**Adding New Chat Features:**
```javascript
// 1. Use Serena to understand existing chat structure
mcp__serena__get_symbols_overview("src/components/ChatePage/ChatPageUser.jsx")

// 2. Use Context7 for React patterns and Firebase v10
mcp__context7__resolve-library-id("firebase")
mcp__context7__get-library-docs("/firebase/firebase-js-sdk", "firestore")

// 3. Use Magic to generate React components
// Note: Magic generates TypeScript, adapt to JSX as needed
// 4. Check existing audio components for patterns
mcp__serena__find_symbol("AudioPlayer", "src/components/ChatePage")
```

**Debugging Firebase Real-time Issues:**
```javascript
// 1. Use Sequential for systematic analysis
// Available via: mcp__sequential-thinking__sequentialthinking("Analyze Firebase onSnapshot memory leaks")

// 2. Use Serena to find Firebase-related code
mcp__serena__search_for_pattern("onSnapshot|collection|doc", "src")
mcp__serena__find_symbol("useChat", "src/hooks")

// 3. Use Context7 for Firebase v10 documentation
mcp__context7__get-library-docs("/firebase/firebase-js-sdk", "firestore-lite")
```

**Enhancing Audio/Voice Features:**
```javascript
// 1. Use Serena to understand current audio implementation
mcp__serena__get_symbols_overview("src/hooks/useAudio.js")
mcp__serena__find_symbol("AudioPlayer", "src/components/ChatePage")

// 2. Use Context7 for wavesurfer.js documentation
mcp__context7__resolve-library-id("wavesurfer.js")

// 3. Use Brave Search for react-audio-voice-recorder patterns
mcp__brave-search__brave_web_search("react-audio-voice-recorder best practices")

// 4. Use Exa Search for advanced audio component research
mcp__exa-search__web_search_exa("React audio waveform components wavesurfer examples")
```

**Improving State Management:**
```javascript
// 1. Use Serena to analyze Zustand stores
mcp__serena__list_dir("src/store", false)
mcp__serena__get_symbols_overview("src/store/useMessages.jsx")

// 2. Use Context7 for Zustand patterns
mcp__context7__resolve-library-id("zustand")

// 3. Use Sequential for store optimization analysis
// Note: Sequential Thinking available for systematic analysis
```

**Adding Shadcn/ui Components:**
```javascript
// 1. List available components
mcp__shadcn-ui__list_components()

// 2. Get specific component (e.g., for modals)
mcp__shadcn-ui__get_component("dialog")

// 3. Get component demo for implementation
mcp__shadcn-ui__get_component_demo("button")

// 4. Adapt to your JSX structure (components are in TypeScript)
```

### Key Serena Commands
- `find_symbol` - Locate functions, classes, exports by name/path pattern
- `search_for_pattern` - Regex-based semantic search across files
- `get_symbols_overview` - Analyze file structure and exports
- `replace_symbol_body` - Edit specific symbols intelligently
- `list_dir` - Get project structure with intelligent filtering