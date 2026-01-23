/**
 * Main application page - Firezone Tracker
 * @module app/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword } from '@/app/actions';

// Services
import { fetchRooms, createRoom as createRoomService, deleteRoom as deleteRoomService } from '@/services/rooms.service';
import { fetchItems, fetchAllItems, addItem as addItemService, updateItem, deleteItem, deleteUserItems, reorderItems } from '@/services/items.service';
import { getUser, saveUser, getCurrentRoom, saveCurrentRoom, clearCurrentRoom, toggleAdminMode } from '@/services/auth.service';

// Hooks
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

// Components
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PasswordModal from '@/components/common/PasswordModal';
import LobbyScreen from '@/components/features/lobby/LobbyScreen';
import RoomScreen from '@/components/features/room/RoomScreen';

// Utils
import { parseCurrency } from '@/utils/currency';
import { VIEW_MODES } from '@/utils/constants';

/**
 * Main application component
 * Manages the overall application state and routing between lobby and room views
 * 
 * @returns {JSX.Element} Main application page
 */
export default function Home() {
  const router = useRouter();

  // State management
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [lobbyItems, setLobbyItems] = useState([]);
  const [view, setView] = useState(VIEW_MODES.MY_TAB);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordCallback, setPasswordCallback] = useState(null);

  /**
   * Initialize application on mount
   * Checks for saved user and room in localStorage
   */
  useEffect(() => {
    setMounted(true);

    async function init() {
      const savedUser = getUser();
      if (savedUser) {
        setUser(savedUser);
      } else {
        router.push('/login');
        return;
      }

      const savedRoom = getCurrentRoom();
      if (savedRoom) {
        setCurrentRoom(savedRoom);
      }

      await loadRooms();
      setLoading(false);
    }

    init();
  }, [router]);

  /**
   * Set up real-time subscription when in a room
   * Automatically fetches items when changes occur
   */
  useRealtimeSubscription(currentRoom?.id, () => {
    loadItems();
  });

  /**
   * Fetch items when current room changes
   */
  useEffect(() => {
    if (currentRoom) {
      loadItems();
    }
  }, [currentRoom]);

  /**
   * Loads all rooms and lobby items from the database
   */
  async function loadRooms() {
    const roomsData = await fetchRooms();
    const itemsData = await fetchAllItems();
    setRooms(roomsData);
    setLobbyItems(itemsData);
  }

  /**
   * Loads items for the current room
   */
  async function loadItems() {
    if (!currentRoom) return;
    const data = await fetchItems(currentRoom.id);
    setItems(data);
  }

  /**
   * Prompts user for admin password
   * @param {() => void} callback - Function to execute after successful authentication
   */
  const promptAdminPassword = (callback) => {
    setPasswordCallback(() => callback);
    setShowPasswordModal(true);
  };

  /**
   * Handles successful password verification
   * @param {string} password - The entered password
   */
  const handlePasswordSuccess = async (password) => {
    const isValid = await verifyAdminPassword(password);
    if (isValid) {
      setShowPasswordModal(false);
      if (passwordCallback) passwordCallback();
    } else {
      alert("Senha incorreta.");
    }
  };

  /**
   * Toggles admin mode for the current user
   */
  const handleToggleAdmin = () => {
    if (user.isAdmin) {
      if (confirm("Sair do modo Admin?")) {
        const updated = toggleAdminMode(user, false);
        setUser(updated);
      }
    } else {
      promptAdminPassword(() => {
        const updated = toggleAdminMode(user, true);
        setUser(updated);
      });
    }
  };

  /**
   * Creates a new room
   * Requires admin password if user is not already admin
   */
  const handleCreateRoom = async () => {
    const proceed = () => {
      setTimeout(() => {
        const name = prompt("Nome da Sala:");
        if (!name) return;

        createRoomService(name).then((newRoom) => {
          if (newRoom) {
            handleEnterRoom(newRoom.id, newRoom.name);
            loadRooms();
          } else {
            alert("Erro ao criar sala.");
          }
        });
      }, 50);
    };

    if (!user.isAdmin) {
      promptAdminPassword(proceed);
    } else {
      proceed();
    }
  };

  /**
   * Deletes a room and all its items
   * @param {React.MouseEvent} e - Click event
   * @param {string} roomId - ID of the room to delete
   */
  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!user.isAdmin) return;

    if (confirm("🚨 ATENÇÃO: Deletar esta sala e TODOS os pedidos nela?")) {
      const success = await deleteRoomService(roomId);
      if (success) {
        loadRooms();
      }
    }
  };

  /**
   * Enters a room
   * @param {string} id - Room ID
   * @param {string} name - Room name
   */
  const handleEnterRoom = (id, name) => {
    setItems([]); // Clear previous items
    setCurrentRoom({ id, name });
    saveCurrentRoom(id, name);
  };

  /**
   * Exits the current room and returns to lobby
   */
  const handleExitRoom = () => {
    setCurrentRoom(null);
    clearCurrentRoom();
    loadRooms(); // Refresh lobby data
  };

  /**
   * Adds a new item to the current user's tab
   * @param {string} name - Item name
   * @param {string} priceStr - Formatted price string
   * @param {number} qty - Quantity
   */
  const handleAddItem = async (name, priceStr, qty) => {
    const price = parseCurrency(priceStr);
    if (name && price > 0) {
      await addItemService(currentRoom.id, user.id, user.name, {
        nome: name,
        preco: price,
        qtd: qty
      });
      loadItems();
    }
  };

  /**
   * Updates an item's quantity
   * Prompts for deletion if quantity becomes 0 or negative
   * @param {number} id - Item ID
   * @param {number} newQty - New quantity
   */
  const handleUpdateQty = async (id, newQty) => {
    if (newQty <= 0) {
      setTimeout(async () => {
        if (confirm("Remover item?")) {
          await deleteItem(id);
          loadItems();
        }
      }, 50);
    } else {
      await updateItem(id, { qtd: newQty });
      loadItems();
    }
  };

  /**
   * Saves edits to an item
   * @param {number} id - Item ID
   * @param {string} name - New name
   * @param {string} priceStr - New formatted price
   */
  const handleSaveEdit = async (id, name, priceStr) => {
    const price = parseCurrency(priceStr);
    if (name && price > 0) {
      await updateItem(id, { nome: name, preco: price });
      loadItems();
    }
  };

  /**
   * Reorders items by swapping their created_at timestamps
   * @param {number} currentId - ID of the item to move
   * @param {'UP' | 'DOWN'} direction - Direction to move the item
   */
  const handleReorder = async (currentId, direction) => {
    const myItems = items.filter(i => i.user_id === user.id);
    const currentIndex = myItems.findIndex(i => i.id === currentId);
    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= myItems.length) return;

    const itemA = myItems[currentIndex];
    const itemB = myItems[targetIndex];

    // Optimistic update for instant feedback
    const updatedItems = items.map(i => {
      if (i.id === itemA.id) return { ...i, created_at: itemB.created_at };
      if (i.id === itemB.id) return { ...i, created_at: itemA.created_at };
      return i;
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setItems(updatedItems);

    // Persist to database
    await reorderItems(itemA.id, itemB.id, itemB.created_at, itemA.created_at);
  };

  /**
   * Clears all items for the current user
   */
  const handleClearMyComanda = async () => {
    if (confirm("Apagar toda a sua comanda?")) {
      await deleteUserItems(currentRoom.id, user.id);
      loadItems();
    }
  };

  /**
   * Admin function: Deletes a user and all their items
   * @param {string} playerId - User ID to delete
   */
  const handleAdminDeleteUser = async (playerId) => {
    if (!user.isAdmin) return;
    if (confirm("🚨 ATENÇÃO: Deletar este usuário e TODOS os seus pedidos?")) {
      await deleteUserItems(currentRoom.id, playerId);
      loadItems();
    }
  };

  /**
   * Admin function: Deletes a specific item
   * @param {number} itemId - Item ID to delete
   */
  const handleAdminDeleteItem = async (itemId) => {
    if (!user.isAdmin) return;
    await deleteItem(itemId);
    loadItems();
  };

  /**
   * Admin function: Adds an item to another user's tab
   * @param {string} playerId - User ID
   * @param {string} playerName - User name
   * @param {Object} itemData - Item data (nome, preco, qtd)
   */
  const handleAdminAddItem = async (playerId, playerName, itemData) => {
    if (!user.isAdmin) return;
    await addItemService(currentRoom.id, playerId, playerName, itemData);
    loadItems();
  };

  /**
   * Admin function: Updates an item
   * @param {number} itemId - Item ID
   * @param {Object} updates - Updates to apply
   */
  const handleAdminUpdateItem = async (itemId, updates) => {
    if (!user.isAdmin) return;
    await updateItem(itemId, updates);
    loadItems();
  };

  // Show loading spinner while initializing
  if (!mounted || loading || !user) return <LoadingSpinner />;

  return (
    <div className="container">
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />

      <Header user={user} showThemeToggle={true} />

      {!currentRoom ? (
        <LobbyScreen
          rooms={rooms}
          lobbyItems={lobbyItems}
          user={user}
          onEnterRoom={handleEnterRoom}
          onDeleteRoom={handleDeleteRoom}
          onCreateRoom={handleCreateRoom}
          onToggleAdmin={handleToggleAdmin}
        />
      ) : (
        <RoomScreen
          currentRoom={currentRoom}
          user={user}
          items={items}
          view={view}
          onViewChange={setView}
          onExit={handleExitRoom}
          onAddItem={handleAddItem}
          onUpdateQty={handleUpdateQty}
          onReorder={handleReorder}
          onEdit={handleSaveEdit}
          onClearMyTab={handleClearMyComanda}
          onDeleteUser={handleAdminDeleteUser}
          onUpdateItem={handleAdminUpdateItem}
          onDeleteItem={handleAdminDeleteItem}
          onAddItemToUser={handleAdminAddItem}
        />
      )}

      <style jsx>{`
        .container {
          width: 100%;
          max-width: 450px;
          padding: 20px 15px;
          padding-bottom: 90px;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
