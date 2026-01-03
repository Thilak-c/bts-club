# Design Document: AI Chat Assistant

## Overview

The AI Chat Assistant is a conversational interface integrated into the BTS DISC QR ordering system's menu page. It provides customers with intelligent menu guidance, order tracking, and service requests while automatically understanding their table and zone context. The assistant uses OpenAI's API for natural language processing and integrates with the existing Convex backend for real-time data access.

## Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Menu Page)"]
        CP[ChatProvider Context]
        CC[ChatAssistant Component]
        CB[ChatButton FAB]
        CS[ChatSheet Bottom Panel]
        QR[QuickReply Buttons]
    end
    
    subgraph API["Next.js API Routes"]
        CA[/api/chat]
        SC[/api/staff-call]
        ZR[/api/zone-request]
    end
    
    subgraph External["External Services"]
        OAI[OpenAI API]
    end
    
    subgraph Convex["Convex Backend"]
        TQ[tables.getByNumber]
        MQ[menuItems.listForZone]
        OQ[orders.getActiveByTable]
        SM[staffCalls.create]
        ZM[zoneRequests.create]
    end
    
    CC --> CP
    CB --> CS
    CS --> QR
    CS -->|User Message| CA
    CA -->|Fetch Context| Convex
    CA -->|Generate Response| OAI
    CA -->|Response| CS
    QR -->|Quick Action| CA
    CS -->|Staff Call| SC
    SC --> SM
    CS -->|Zone Request| ZR
    ZR --> ZM
```

## Components and Interfaces

### 1. ChatProvider (Context)

Manages chat state and provides context to child components.

```typescript
interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  tableContext: TableContext | null;
  sendMessage: (content: string) => Promise<void>;
  sendQuickReply: (action: QuickReplyAction) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  callStaff: (reason?: string) => Promise<void>;
  requestZoneChange: (targetZone: string) => Promise<void>;
}

interface TableContext {
  tableId: string;
  tableNumber: number;
  zoneId: string | null;
  zoneName: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type QuickReplyAction = 
  | 'popular_items'
  | 'available_items'
  | 'track_order'
  | 'call_staff'
  | 'request_vip';
```

### 2. ChatAssistant Component

Main wrapper that initializes context and renders the chat interface.

```typescript
interface ChatAssistantProps {
  tableId: string;
}
```

### 3. ChatButton Component

Floating action button to open the chat.

```typescript
// No props - uses context
// Renders as fixed position FAB in bottom-right
// Shows unread indicator when new messages arrive
```

### 4. ChatSheet Component

Bottom sheet panel containing the chat interface.

```typescript
interface ChatSheetProps {
  // Uses context for all state
}

// Sections:
// - Header: "BTS DISC Assistant" + close button
// - Context bar: "Table X • Zone Name"
// - Messages area: scrollable message list
// - Quick replies: horizontal scrollable buttons
// - Input area: text input + send button
```

### 5. QuickReplyButton Component

Pre-defined action buttons for common queries.

```typescript
interface QuickReplyButtonProps {
  label: string;
  action: QuickReplyAction;
  icon: React.ReactNode;
}

const QUICK_REPLIES = [
  { label: 'Popular here', action: 'popular_items', icon: '🔥' },
  { label: 'What can I order?', action: 'available_items', icon: '📋' },
  { label: 'Track order', action: 'track_order', icon: '📦' },
  { label: 'Call staff', action: 'call_staff', icon: '🔔' },
  { label: 'Move to VIP', action: 'request_vip', icon: '⭐' },
];
```

### 6. ChatMessage Component

Individual message bubble.

```typescript
interface ChatMessageProps {
  message: ChatMessage;
}

// User messages: right-aligned, orange background
// Assistant messages: left-aligned, dark card background
```

## Data Models

### Convex Schema Additions

```typescript
// Add to schema.ts

staffCalls: defineTable({
  tableId: v.string(),
  tableNumber: v.number(),
  zoneName: v.optional(v.string()),
  reason: v.optional(v.string()),
  status: v.string(), // 'pending' | 'acknowledged' | 'resolved'
  createdAt: v.number(),
}).index("by_status", ["status"]),

zoneRequests: defineTable({
  tableId: v.string(),
  tableNumber: v.number(),
  currentZone: v.optional(v.string()),
  requestedZone: v.string(),
  status: v.string(), // 'pending' | 'approved' | 'denied'
  createdAt: v.number(),
}).index("by_status", ["status"]),
```

### API Request/Response Types

```typescript
// POST /api/chat
interface ChatRequest {
  message: string;
  tableContext: TableContext;
  conversationHistory: ChatMessage[];
}

interface ChatResponse {
  message: string;
  suggestedActions?: QuickReplyAction[];
}

// POST /api/staff-call
interface StaffCallRequest {
  tableId: string;
  tableNumber: number;
  zoneName?: string;
  reason?: string;
}

interface StaffCallResponse {
  success: boolean;
  callId: string;
}

// POST /api/zone-request
interface ZoneRequestPayload {
  tableId: string;
  tableNumber: number;
  currentZone?: string;
  requestedZone: string;
}

interface ZoneRequestResponse {
  success: boolean;
  requestId: string;
}
```

## API Routes

### POST /api/chat

Handles AI chat interactions.

**Flow:**
1. Receive message and table context
2. Fetch current menu items for zone from Convex
3. Fetch active order for table (if exists)
4. Build system prompt with context
5. Call OpenAI API with conversation history
6. Return AI response

**System Prompt Template:**
```
You are BTS DISC Assistant, a premium restaurant concierge. You are helping a customer at Table {tableNumber} in the {zoneName} zone.

CONTEXT:
- Available menu items in this zone: {menuItemsList}
- Current order status: {orderStatus}
- Restaurant hours: 12:00 PM - 12:00 AM daily
- Address: BTS DISC Restaurant, Premium Location

RULES:
1. Only mention items from the provided menu list
2. Never invent prices, offers, or unavailable items
3. If unsure, say "I will check with the staff for you."
4. Keep responses under 150 words
5. Use a premium, polite tone
6. For zone-restricted items, explain they're available in other zones
7. Offer to help with zone change requests when relevant

CAPABILITIES:
- Answer menu questions
- Recommend items available in this zone
- Explain zone restrictions
- Track current order
- Call staff (suggest quick reply)
- Request zone/VIP change (suggest quick reply)
```

### POST /api/staff-call

Creates a staff call notification.

**Flow:**
1. Validate request
2. Create staffCalls record in Convex
3. Return confirmation

### POST /api/zone-request

Creates a zone change request.

**Flow:**
1. Validate request
2. Create zoneRequests record in Convex
3. Return confirmation

## Error Handling

| Scenario | Handling |
|----------|----------|
| Table not found | Display error message, disable chat input |
| OpenAI API failure | Return fallback message: "I'm having trouble connecting. Please try again or call staff for assistance." |
| Network error | Show retry button, preserve message in input |
| Convex query failure | Use cached data if available, show degraded mode indicator |
| Rate limiting | Queue messages, show "Please wait..." indicator |

## Testing Strategy

### Unit Tests
- ChatProvider state management
- Message formatting utilities
- Quick reply action handlers
- API request/response validation

### Integration Tests
- Chat flow with mocked OpenAI responses
- Staff call creation and confirmation
- Zone request creation and confirmation
- Table context fetching

### E2E Tests
- Full chat conversation flow
- Quick reply button interactions
- Bottom sheet open/close behavior
- Mobile responsiveness

## UI Specifications

### Color Palette
- Background: `#000000` (--bg)
- Card: `#0B0B0D` (--card)
- Border: `#1C1C1F` (--border)
- Accent: `#F4A259` (--primary)
- Text: `#FFFFFF` (--text-primary)
- Muted: `#9A9A9A` (--muted)

### Layout
- Chat button: 56px FAB, bottom-right, 16px margin
- Bottom sheet: 70vh max height, rounded top corners (16px)
- Message bubbles: max-width 80%, 12px padding, 8px border-radius
- Quick replies: horizontal scroll, 8px gap, pill-shaped buttons

### Animations
- Sheet: slide-up 300ms ease-out
- Messages: fade-in 200ms
- Button: scale on press (0.95)
- Loading: pulse animation on assistant typing indicator

### Accessibility
- ARIA labels on all interactive elements
- Focus management when sheet opens/closes
- Keyboard navigation support
- Screen reader announcements for new messages
