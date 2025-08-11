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