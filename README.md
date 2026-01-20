# 🔥 Firezone Tracker Online

Firezone Tracker Online is a modern web application designed to facilitate real-time management of tabs and orders. Originally built in pure HTML/JS, the application was migrated to **Next.js 16** with **Supabase** to offer an "app-like", secure, and scalable experience.

## 🚀 Technologies

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Backend/Database**: [Supabase](https://supabase.com/) (Real-time subscriptions)
- **Styling**: CSS Modules & Styled JSX
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Features

- **Dynamic Lobby**: Real-time room creation and selection.
- **My Tab**: Add items with quantity adjustment, editing, and reordering (visual drag & drop).
- **Table Ranking**: Consolidated view of all users in the room, sorted by total value.
- **Admin Panel**:
  - Delete entire rooms.
  - Edit prices and quantities for any user in the Ranking.
  - Remove specific users from the room.
- **High-Fidelity Design**: Minimalist interface optimized for mobile devices.

---

## 💻 Installation (Dev Environment)

Follow the steps below to run the project locally:

### 1. Requirements
- Node.js (v18 or higher)
- NPM or Yarn

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd firezone-tracker-online
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the project root with the following keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_master_password
```

### 5. Run the Development Server
```bash
npm run dev
```
Access `http://localhost:3000` in your browser.

---

## 🌐 Deployment (Production - Vercel)

The application is configured to be hosted on **Vercel**:

1. Push the code to your GitHub repository.
2. Connect the repository in the [Vercel](https://vercel.com) dashboard.
3. In Vercel's **Environment Variables**, add the same keys as your `.env.local`.
   - *Note: Do not use the `NEXT_PUBLIC_` prefix for `ADMIN_PASSWORD` to ensure it remains secure on the server.*
4. Vercel will automatically detect `vercel.json` settings and perform the build.

---

## 🗄️ Database Strategy (Supabase)

The Database must contain the following tables:

1. **rooms**: `id` (uuid), `name` (text), `created_at` (timestamptz).
2. **comandas**: `id` (bigint), `room_id` (uuid - FK), `user_id` (text), `user_name` (text), `nome` (text), `preco` (float8), `qtd` (int4), `created_at` (timestamptz).

*Make sure to configure RLS (Row Level Security) policies in Supabase if you want strict security in production.*
