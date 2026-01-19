# Firezone Hub

Firezone Hub is a real-time, progressive web application (PWA) designed to track shared expenses among groups of people in a simple and intuitive way.

## Features

- **Real-time Updates:** All data is synchronized in real-time across all devices in the same room.
- **PWA (Progressive Web App):** Can be installed on mobile and desktop devices for a native-like experience and offline access.
- **Rooms System:** Create and join rooms to share expenses with your friends.
- **Expense Tracking:** Add, edit, and remove items from your personal tab.
- **Ranking:** View a real-time ranking of who has spent the most in the room.
- **Admin Functionality:** Admins can create, rename, and delete rooms.

## Getting Started

To run this project locally, you will need to have a Supabase account.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/seu-usuario/firezone-hub.git
    ```
2.  **Set up Supabase:**
    - Create a new project on [Supabase](https://supabase.com/).
    - In your Supabase project, go to the SQL Editor and run the following commands to create the necessary tables:
      ```sql
      CREATE TABLE rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE comandas (
        id SERIAL PRIMARY KEY,
        room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        qtd INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - In the `index.html` file, replace the placeholder Supabase URL and Key with your own credentials:
      ```javascript
      const SUPABASE_URL = 'YOUR_SUPABASE_URL';
      const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
      ```

3.  **Open the `index.html` file in your browser.**

## How to Use

1.  **Enter your name:** When you first open the application, you will be prompted to enter your name.
2.  **Create or join a room:**
    - If you are the first to use the app, create a new room by clicking on the "+ Create New Room" button (Admin access required).
    - If there are already existing rooms, simply click on one to join.
3.  **Add items:**
    - In the "My Tab" section, you can add new items by filling in the name, price, and quantity.
4.  **Manage your items:**
    - You can edit, remove, or change the quantity of the items you have added.
5.  **View the ranking:**
    - Click on the "Ranking" tab to see a summary of the expenses for each person in the room.

## Admin Section

To access the admin features, you need to log in with the master password.

1.  **Click on the "🔑 Admin Access" button.**
2.  **Enter the master password (default: `BFR10`).**

As an admin, you can:

- **Create new rooms.**
- **Rename existing rooms.**
- **Delete rooms.**
