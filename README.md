# 🔥 Firezone Tracker Online

Firezone Tracker Online is a modern, real-time web application for managing tabs and orders. Built with **Next.js 16** and **Supabase**, it offers a seamless, app-like experience optimized for mobile devices.

---

## 🚀 Technologies

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Backend/Database**: [Supabase](https://supabase.com/) with real-time subscriptions
- **Styling**: CSS Modules & CSS Variables for theming
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: JavaScript with JSDoc type annotations

---

## ✨ Features

### Dynamic Lobby
- Real-time room creation and selection
- Live preview of total room value and active participants per room
- Admin controls for room management

### My Tab
- Add items with quantity adjustment
- Edit item names and prices
- Visual reordering with drag-and-drop feel
- Real-time updates across all connected clients

### Ranking View
- Consolidated view of all users in the room
- Sorted by total value with medal indicators for top 3
- Expandable cards showing individual items

### Admin Panel
- **Secure Access**: Password-protected admin mode
- **Room Management**: Create and delete rooms (cascades to all orders)
- **User Management**: Remove specific users and wipe their tabs
- **Item Control**:
  - Edit: Modify name, price (R$ X,XX format), and quantity for any user
  - Add: Directly add new items to any user's tab from Ranking view
  - Delete: Remove items with confirmation

### Theme System
- Light and dark mode support
- Automatic system preference detection
- Persistent user preference
- Smooth transitions between themes

### High-Fidelity Design
- Minimalist interface optimized for mobile devices
- Smooth animations with Framer Motion
- Responsive layout that works on all screen sizes

---

## 📁 Project Structure

The project follows a **feature-based architecture** for better organization and maintainability:

```
src/
├── app/                          # Next.js App Router pages
│   ├── login/                    # Login page
│   ├── actions.js                # Server actions (admin auth)
│   ├── globals.css               # Global styles & CSS variables
│   ├── layout.js                 # Root layout with ThemeProvider
│   ├── page.js                   # Main application page
│   └── ThemeProvider.js          # Theme context provider
├── components/                   # React components
│   ├── common/                   # Shared components
│   │   ├── Header.js
│   │   ├── LoadingSpinner.js
│   │   ├── PasswordModal.js
│   │   └── ThemeToggle.js
│   └── features/                 # Feature-specific components
│       ├── lobby/                # Lobby screen components
│       │   ├── AdminToggleButton.js
│       │   ├── CreateRoomButton.js
│       │   ├── LobbyScreen.js
│       │   └── RoomCard.js
│       └── room/                 # Room screen components
│           ├── AddItemCard.js
│           ├── ItemCard.js
│           ├── MyTabView.js
│           ├── RankingCard.js
│           ├── RankingView.js
│           ├── RoomHeader.js
│           ├── RoomNavigation.js
│           ├── RoomScreen.js
│           └── TotalDock.js
├── hooks/                        # Custom React hooks
│   └── useRealtimeSubscription.js
├── services/                     # Business logic & API calls
│   ├── supabase/
│   │   └── client.js             # Supabase client config
│   ├── auth.service.js           # User & localStorage management
│   ├── items.service.js          # Item/comanda operations
│   └── rooms.service.js          # Room operations
├── types/                        # JSDoc type definitions
│   ├── item.types.js
│   ├── room.types.js
│   ├── theme.types.js
│   └── user.types.js
└── utils/                        # Utility functions
    ├── constants.js              # App-wide constants
    └── currency.js               # Currency formatting utils
```

For a detailed explanation of the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 💻 Installation & Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- A **Supabase** account and project

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd firezone-tracker-online
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_master_password
```

> **Note**: The `ADMIN_PASSWORD` should NOT have the `NEXT_PUBLIC_` prefix to keep it server-side only.

### 4. Set Up Supabase Database

Create the following tables in your Supabase project:

**rooms** table:
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**comandas** table:
```sql
CREATE TABLE comandas (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco FLOAT8 NOT NULL,
  qtd INT4 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Configure Row Level Security (RLS) policies as needed for your security requirements.

### 5. Run the Development Server
```bash
npm run dev
```

Access the application at `http://localhost:3000`.

---

## 🌐 Deployment (Vercel)

The application is optimized for deployment on **Vercel**:

1. Push your code to a GitHub repository
2. Connect the repository in the [Vercel Dashboard](https://vercel.com)
3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD` (without `NEXT_PUBLIC_` prefix)
4. Vercel will automatically detect Next.js and deploy

The `vercel.json` configuration is already included in the project.

---

## 📜 Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

---

## 🏗️ Development Workflow

### Adding a New Feature

1. **Plan**: Identify which layer(s) need changes (services, hooks, components)
2. **Services**: Add any new database operations to appropriate service files
3. **Hooks**: Create custom hooks if complex state management is needed
4. **Components**: Build UI components in the appropriate feature directory
5. **Document**: Add JSDoc annotations to all new functions and components
6. **Test**: Verify functionality in development mode

### Code Style Guidelines

- **JSDoc**: All functions and components must have JSDoc annotations
- **Naming**: Use descriptive names (e.g., `handleCreateRoom` not `create`)
- **Separation**: Keep UI components separate from business logic
- **Constants**: Define magic strings and numbers in `utils/constants.js`
- **Types**: Add type definitions to `types/` directory for complex objects

---

## 🐛 Troubleshooting

### Real-time updates not working
- Check Supabase connection in browser console
- Verify RLS policies allow read access
- Ensure `room_id` filter matches in subscription

### Theme not persisting
- Check browser localStorage is enabled
- Verify `STORAGE_KEYS.THEME` is being used consistently

### Admin password not working
- Ensure `ADMIN_PASSWORD` is set in environment variables (server-side only)
- Restart development server after changing `.env.local`

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Add JSDoc annotations to all new code
4. Test thoroughly in development mode
5. Submit a pull request with a clear description

---

## 📞 Support

For issues or questions, please open an issue in the repository.
