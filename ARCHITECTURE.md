# 🏗️ Architecture Documentation

This document provides a comprehensive overview of the Firezone Tracker application architecture, data flow, and key design decisions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Data Flow](#data-flow)
4. [Component Hierarchy](#component-hierarchy)
5. [State Management](#state-management)
6. [Styling Strategy](#styling-strategy)
7. [Database Schema](#database-schema)
8. [Real-time Subscriptions](#real-time-subscriptions)
9. [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

Firezone Tracker follows a **feature-based layered architecture** that separates concerns into distinct layers:

```
┌─────────────────────────────────────────┐
│           UI Components Layer           │
│  (Presentational components)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Custom Hooks Layer              │
│  (State management & side effects)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Services Layer                 │
│  (Business logic & API calls)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Supabase / Database              │
│  (Data persistence & real-time)         │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

- **UI Components**: Pure presentation, receive data via props, emit events via callbacks
- **Custom Hooks**: Manage component state, handle side effects, orchestrate service calls
- **Services**: Encapsulate all database operations, provide clean API for hooks
- **Database**: Supabase handles persistence, real-time updates, and authentication

---

## Folder Structure

### `/src/app` - Next.js App Router

Contains page routes and app-level configuration:

- **`page.js`**: Main application page (lobby + room views)
- **`login/page.js`**: Login/authentication page
- **`layout.js`**: Root layout with ThemeProvider
- **`ThemeProvider.js`**: React context for theme management
- **`actions.js`**: Next.js server actions (admin password verification)
- **`globals.css`**: Global styles and CSS variable definitions

### `/src/components` - React Components

Organized by **feature** and **reusability**:

#### `/common` - Shared Components
Reusable across multiple features:
- `Header.js` - App header with logo and user info
- `LoadingSpinner.js` - Loading state indicator
- `PasswordModal.js` - Admin password input modal
- `ThemeToggle.js` - Light/dark mode toggle button

#### `/features/lobby` - Lobby Feature
Components specific to the lobby screen:
- `LobbyScreen.js` - Main lobby container
- `RoomCard.js` - Individual room display
- `CreateRoomButton.js` - Room creation button
- `AdminToggleButton.js` - Admin mode toggle

#### `/features/room` - Room Feature
Components specific to room views:
- `RoomScreen.js` - Main room container
- `RoomHeader.js` - Room header with back button
- `RoomNavigation.js` - Tab navigation (My Tab / Ranking)
- `MyTabView.js` - User's personal tab view
- `AddItemCard.js` - Form for adding items
- `ItemCard.js` - Individual item display with controls
- `RankingView.js` - Ranking view container
- `RankingCard.js` - Individual user ranking card
- `TotalDock.js` - Fixed bottom total display

### `/src/hooks` - Custom React Hooks

Encapsulate stateful logic and side effects:

- **`useRealtimeSubscription.js`**: Manages Supabase real-time subscriptions for a room

### `/src/services` - Business Logic Layer

Encapsulate all database operations:

- **`supabase/client.js`**: Supabase client configuration
- **`auth.service.js`**: User authentication and localStorage management
- **`rooms.service.js`**: Room CRUD operations
- **`items.service.js`**: Item/comanda CRUD operations

### `/src/types` - Type Definitions

JSDoc type definitions for IDE IntelliSense:

- **`user.types.js`**: User object types
- **`room.types.js`**: Room object types
- **`item.types.js`**: Item/comanda object types
- **`theme.types.js`**: Theme system types

### `/src/utils` - Utility Functions

Pure utility functions and constants:

- **`currency.js`**: Currency formatting and parsing (BRL)
- **`constants.js`**: Application-wide constants (storage keys, view modes, etc.)

---

## Data Flow

### User Authentication Flow

```
1. User visits app
   ↓
2. Check localStorage for saved user
   ↓
3a. User found → Load user data → Continue to lobby
3b. No user → Redirect to /login
   ↓
4. User enters name on login page
   ↓
5. Create user object with unique ID
   ↓
6. Save to localStorage via auth.service
   ↓
7. Redirect to main page (lobby)
```

### Room Selection & Real-time Updates

```
1. User clicks room card in lobby
   ↓
2. Save room ID/name to localStorage
   ↓
3. Update currentRoom state
   ↓
4. useEffect triggers → fetchItems() from items.service
   ↓
5. useRealtimeSubscription hook sets up Supabase channel
   ↓
6. Listen for INSERT/UPDATE/DELETE on comandas table
   ↓
7. On change → fetchItems() → Update items state
   ↓
8. React re-renders affected components
```

### Item CRUD Operations

#### Adding an Item

```
User clicks "Adicionar" button
   ↓
AddItemCard collects: name, price, quantity
   ↓
Callback to page.js → handleAddItem()
   ↓
parseCurrency() converts price string to number
   ↓
items.service.addItem() → Supabase INSERT
   ↓
Real-time subscription triggers
   ↓
fetchItems() → Update state → Re-render
```

#### Editing an Item

```
User clicks edit icon on ItemCard
   ↓
ItemCard enters edit mode (local state)
   ↓
User modifies name/price → Clicks "OK"
   ↓
Callback to page.js → handleSaveEdit()
   ↓
items.service.updateItem() → Supabase UPDATE
   ↓
Real-time subscription triggers
   ↓
fetchItems() → Update state → Re-render
```

#### Reordering Items

```
User clicks up/down arrow on ItemCard
   ↓
Callback to page.js → handleReorder()
   ↓
Find adjacent item in user's list
   ↓
Optimistic update: Swap created_at in local state
   ↓
items.service.reorderItems() → Supabase UPDATE (both items)
   ↓
Real-time subscription triggers
   ↓
fetchItems() confirms order
```

### Admin Operations

Admin operations follow the same pattern but include an admin check:

```
Admin clicks edit/delete in RankingCard
   ↓
Check user.isAdmin === true
   ↓
If true → Execute operation via service
   ↓
Real-time subscription updates all clients
```

---

## Component Hierarchy

```
App (page.js)
├── PasswordModal
├── Header
│   └── ThemeToggle
├── LobbyScreen (when currentRoom === null)
│   ├── RoomCard (for each room)
│   ├── CreateRoomButton
│   └── AdminToggleButton
└── RoomScreen (when currentRoom !== null)
    ├── RoomHeader
    ├── RoomNavigation
    ├── MyTabView (when view === 'minha')
    │   ├── AddItemCard
    │   └── ItemCard (for each user item)
    ├── RankingView (when view === 'ranking')
    │   └── RankingCard (for each player)
    │       └── (Admin controls if isAdmin)
    └── TotalDock
```

### Component Communication

- **Props down**: Parent components pass data and callbacks to children
- **Events up**: Children call parent callbacks to trigger actions
- **No prop drilling**: Services and hooks prevent deep prop passing

---

## State Management

### Application State (page.js)

The main page manages global application state:

```javascript
const [user, setUser] = useState(null);              // Current user
const [rooms, setRooms] = useState([]);              // All rooms (lobby)
const [currentRoom, setCurrentRoom] = useState(null); // Active room
const [items, setItems] = useState([]);              // Items in current room
const [lobbyItems, setLobbyItems] = useState([]);    // All items (for stats)
const [view, setView] = useState('minha');           // Current view mode
```

### Local Component State

Components manage their own UI state:

- **AddItemCard**: Form inputs (name, price, quantity, isOpen)
- **ItemCard**: Edit mode state (isEditing, editName, editPrice)
- **RankingCard**: Expansion state (isOpen, editingItemId, isAdding)

### Persistent State (localStorage)

Managed via `auth.service.js`:

```javascript
// User data
localStorage.setItem('fz_user', JSON.stringify(user));

// Current room
localStorage.setItem('fz_current_room_id', roomId);
localStorage.setItem('fz_current_room_name', roomName);

// Theme preference
localStorage.setItem('fz_theme', theme);
```

---

## Styling Strategy

### CSS Variables for Theming

All colors and theme-dependent values are defined as CSS variables in `globals.css`:

```css
:root {
  --bg-page: #F4F4F4;
  --bg-card: #FFFFFF;
  --text-primary: #000000;
  /* ... more variables */
}

[data-theme='dark'] {
  --bg-page: #121212;
  --bg-card: #1E1E1E;
  --text-primary: #EDEDED;
  /* ... dark mode overrides */
}
```

### Theme Switching

The `ThemeProvider` sets the `data-theme` attribute on `<html>`:

```javascript
document.documentElement.setAttribute('data-theme', theme);
```

CSS automatically applies the correct variable values based on this attribute.

### Styled JSX

Components use Next.js **styled-jsx** for scoped styles:

```jsx
<style jsx>{`
  .component {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`}</style>
```

Benefits:
- **Scoped**: Styles don't leak to other components
- **Dynamic**: Can use JavaScript variables
- **Theme-aware**: Uses CSS variables that change with theme

---

## Database Schema

### Tables

#### `rooms`

Stores room information:

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| `id`        | UUID (PK)    | Unique room identifier         |
| `name`      | TEXT         | Display name of the room       |
| `created_at`| TIMESTAMPTZ  | When the room was created      |

#### `comandas`

Stores individual items/orders:

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| `id`        | BIGSERIAL (PK)| Unique item identifier        |
| `room_id`   | UUID (FK)    | References `rooms.id`          |
| `user_id`   | TEXT         | User identifier (from localStorage) |
| `user_name` | TEXT         | User display name              |
| `nome`      | TEXT         | Item name/description          |
| `preco`     | FLOAT8       | Price per unit                 |
| `qtd`       | INT4         | Quantity                       |
| `created_at`| TIMESTAMPTZ  | When item was added (for ordering) |

### Relationships

- One room has many comandas (one-to-many)
- Deleting a room cascades to delete all its comandas
- Users are not stored in the database (localStorage only)

### Indexes

Recommended indexes for performance:

```sql
CREATE INDEX idx_comandas_room_id ON comandas(room_id);
CREATE INDEX idx_comandas_user_id ON comandas(user_id);
CREATE INDEX idx_comandas_created_at ON comandas(created_at);
```

---

## Real-time Subscriptions

### How It Works

Supabase provides real-time updates via WebSocket connections:

```javascript
const channel = supabase
  .channel(`room_${roomId}`)
  .on('postgres_changes', {
    event: '*',                    // Listen to all events
    schema: 'public',
    table: 'comandas',
    filter: `room_id=eq.${roomId}` // Only this room
  }, () => {
    fetchItems(); // Refresh data
  })
  .subscribe();
```

### Subscription Lifecycle

1. **Setup**: When user enters a room, `useRealtimeSubscription` creates a channel
2. **Listen**: Channel listens for INSERT, UPDATE, DELETE events on `comandas` table
3. **Filter**: Only events matching `room_id` are received
4. **Callback**: On event, `fetchItems()` is called to refresh data
5. **Cleanup**: When user exits room or component unmounts, channel is removed

### Benefits

- **Instant updates**: All users see changes immediately
- **No polling**: Efficient WebSocket connection
- **Filtered**: Only relevant events are received
- **Automatic**: No manual refresh needed

---

## Key Design Decisions

### 1. Feature-Based Architecture

**Decision**: Organize components by feature (lobby, room) rather than by type (buttons, cards).

**Rationale**:
- Easier to locate related code
- Scales better as features grow
- Clear ownership and boundaries
- Facilitates code splitting

### 2. Service Layer Abstraction

**Decision**: Separate all database operations into service modules.

**Rationale**:
- Components don't need to know about Supabase
- Easy to swap data sources if needed
- Centralized error handling
- Testable business logic

### 3. JSDoc Instead of TypeScript

**Decision**: Use JSDoc annotations instead of TypeScript.

**Rationale**:
- No build-time overhead
- Still get IDE IntelliSense
- Easier for JavaScript developers
- Gradual adoption possible

### 4. localStorage for User Data

**Decision**: Store user data in localStorage instead of database.

**Rationale**:
- Simpler authentication flow
- No user management overhead
- Faster initial load
- Sufficient for use case (casual tab tracking)

**Trade-off**: Users can't access their data from different devices.

### 5. Optimistic Updates for Reordering

**Decision**: Update UI immediately before database confirms.

**Rationale**:
- Better perceived performance
- Smoother drag-and-drop feel
- Real-time subscription confirms or corrects

### 6. CSS Variables for Theming

**Decision**: Use CSS custom properties instead of CSS-in-JS libraries.

**Rationale**:
- Native browser support
- Instant theme switching
- No runtime overhead
- Simple to understand and maintain

### 7. Styled JSX for Component Styles

**Decision**: Use Next.js styled-jsx instead of CSS Modules or Tailwind.

**Rationale**:
- Scoped styles prevent conflicts
- Co-located with components
- Dynamic styling with JavaScript
- No build configuration needed

---

## Performance Considerations

### Optimizations Implemented

1. **Real-time subscriptions**: Only subscribe to current room, not all data
2. **Optimistic updates**: UI updates before server confirms
3. **Lazy loading**: Components only render when needed
4. **Memoization**: Framer Motion layout animations are optimized
5. **CSS variables**: Theme switching has no JavaScript overhead

### Potential Improvements

- Implement pagination for rooms with many items
- Add debouncing to search/filter inputs
- Use React.memo for expensive components
- Implement virtual scrolling for long lists

---

## Security Considerations

### Current Implementation

- **Admin password**: Server-side only (not exposed to client)
- **Server actions**: Admin verification runs on server
- **RLS**: Should be configured in Supabase for production

### Recommendations for Production

1. **Enable RLS** on both tables
2. **Implement user authentication** (Supabase Auth)
3. **Add rate limiting** to prevent abuse
4. **Validate all inputs** on server side
5. **Use environment-specific admin passwords**

---

## Future Enhancements

### Potential Features

- **User accounts**: Persistent cross-device access
- **Payment splitting**: Calculate individual shares
- **Export**: Download tab as PDF or CSV
- **History**: View past rooms and orders
- **Notifications**: Alert users when items are added to their tab
- **Multi-language**: i18n support for Portuguese and English

### Technical Improvements

- **TypeScript migration**: Gradual conversion from JSDoc
- **Unit tests**: Jest + React Testing Library
- **E2E tests**: Playwright for critical flows
- **PWA**: Offline support and install prompt
- **Analytics**: Track usage patterns

---

## Conclusion

The Firezone Tracker architecture prioritizes:

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Feature-based organization
3. **Developer Experience**: Comprehensive JSDoc annotations
4. **Performance**: Real-time updates with minimal overhead
5. **User Experience**: Smooth animations and instant feedback

This architecture provides a solid foundation for future growth while remaining simple enough for new developers to understand quickly.
