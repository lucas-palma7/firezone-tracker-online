'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  Trophy,
  LogOut,
  User,
  Users,
  Settings,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyAdminPassword } from '@/app/actions';
import ThemeToggle from './components/ThemeToggle';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCurrencyInput = (val) => {
  let v = val.replace(/\D/g, '');
  v = (v / 100).toFixed(2) + '';
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return "R$ " + v;
};

const parseCurrency = (val) => {
  return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [lobbyItems, setLobbyItems] = useState([]);
  const [view, setView] = useState('minha'); // 'minha' or 'ranking'
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('R$ 0,00');
  const [newItemQty, setNewItemQty] = useState(1);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordCallback, setPasswordCallback] = useState(null);




  useEffect(() => {
    setMounted(true);

    async function init() {
      const savedUser = localStorage.getItem('fz_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        router.push('/login');
        return;
      }

      const savedRoomId = localStorage.getItem('fz_current_room_id');
      const savedRoomName = localStorage.getItem('fz_current_room_name');
      if (savedRoomId && savedRoomName) {
        setCurrentRoom({ id: savedRoomId, name: savedRoomName });
      }

      await fetchRooms();
      setLoading(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      fetchItems();
      const channel = supabase
        .channel(`room_${currentRoom.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comandas',
          filter: `room_id=eq.${currentRoom.id}`
        }, () => fetchItems())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentRoom]);

  async function fetchRooms() {
    const { data: roomsData } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    const { data: itemsData } = await supabase.from('comandas').select('*');
    setRooms(roomsData || []);
    setLobbyItems(itemsData || []);
  }

  async function fetchItems() {
    if (!currentRoom) return;
    const { data } = await supabase.from('comandas').select('*').eq('room_id', currentRoom.id).order('created_at', { ascending: true });
    setItems(data || []);
  }

  const promptAdminPassword = (callback) => {
    setPasswordCallback(() => callback);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = async (password) => {
    const isValid = await verifyAdminPassword(password);
    if (isValid) {
      setShowPasswordModal(false);
      if (passwordCallback) passwordCallback();
    } else {
      alert("Senha incorreta.");
    }
  };

  const toggleAdmin = () => {
    if (user.isAdmin) {
      if (confirm("Sair do modo Admin?")) {
        const updated = { ...user, isAdmin: false };
        setUser(updated);
        localStorage.setItem('fz_user', JSON.stringify(updated));
      }
    } else {
      promptAdminPassword(() => {
        const updated = { ...user, isAdmin: true };
        setUser(updated);
        localStorage.setItem('fz_user', JSON.stringify(updated));
      });
    }
  };

  const createRoom = async () => {
    const proceed = () => {
      setTimeout(() => {
        const name = prompt("Nome da Sala:");
        if (!name) return;

        supabase.from('rooms').insert({ name }).select().then(({ data, error }) => {
          if (error) {
            alert("Erro ao criar sala.");
          } else {
            enterRoom(data[0].id, data[0].name);
            fetchRooms();
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

  const deleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!user.isAdmin) return;
    if (confirm("🚨 ATENÇÃO: Deletar esta sala e TODOS os pedidos nela?")) {
      // Cascade delete is usually handled by RLS/DB, but let's be explicit if needed
      await supabase.from('comandas').delete().eq('room_id', roomId);
      await supabase.from('rooms').delete().eq('id', roomId);
      fetchRooms();
    }
  };

  const enterRoom = (id, name) => {
    setItems([]); // Clear previous items to avoid pollution
    setCurrentRoom({ id, name });
    localStorage.setItem('fz_current_room_id', id);
    localStorage.setItem('fz_current_room_name', name);
  };


  const exitRoom = () => {
    setCurrentRoom(null);
    localStorage.removeItem('fz_current_room_id');
    localStorage.removeItem('fz_current_room_name');
    fetchRooms(); // Refresh lobby data to update totals
  };

  const addItem = async () => {
    const price = parseCurrency(newItemPrice);
    if (newItemName && price > 0) {
      await supabase.from('comandas').insert({
        room_id: currentRoom.id,
        user_id: user.id,
        user_name: user.name,
        nome: newItemName,
        preco: price,
        qtd: newItemQty
      });
      setNewItemName('');
      setNewItemPrice('R$ 0,00');
      setNewItemQty(1);
      setIsFormOpen(false);
      fetchItems();
    }
  };

  const updateQty = async (id, newQty) => {
    if (newQty <= 0) {
      setTimeout(async () => {
        if (confirm("Remover item?")) {
          await supabase.from('comandas').delete().eq('id', id);
          fetchItems();
        }
      }, 50);
    } else {
      await supabase.from('comandas').update({ qtd: newQty }).eq('id', id);
      fetchItems();
    }
  };

  const saveEdit = async (id, name, priceStr) => {
    const price = parseCurrency(priceStr);
    if (name && price > 0) {
      await supabase.from('comandas').update({ nome: name, preco: price }).eq('id', id);
      setEditingId(null);
      fetchItems();
    }
  };

  const reorder = async (currentId, direction) => {
    const myItems = items.filter(i => i.user_id === user.id);
    const currentIndex = myItems.findIndex(i => i.id === currentId);
    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= myItems.length) return;

    const itemA = myItems[currentIndex];
    const itemB = myItems[targetIndex];

    const tempDate = itemA.created_at;

    // Opt-outs for instant feedback
    const originalItems = [...items];
    const updatedItems = items.map(i => {
      if (i.id === itemA.id) return { ...i, created_at: itemB.created_at };
      if (i.id === itemB.id) return { ...i, created_at: tempDate };
      return i;
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setItems(updatedItems);

    await supabase.from('comandas').update({ created_at: itemB.created_at }).eq('id', itemA.id);
    await supabase.from('comandas').update({ created_at: tempDate }).eq('id', itemB.id);
  };

  const clearMyComanda = async () => {
    if (confirm("Apagar toda a sua comanda?")) {
      await supabase.from('comandas').delete().eq('room_id', currentRoom.id).eq('user_id', user.id);
      fetchItems();
    }
  };

  const adminDeleteUser = async (playerId) => {
    if (!user.isAdmin) return;
    if (confirm("🚨 ATENÇÃO: Deletar este usuário e TODOS os seus pedidos?")) {
      await supabase.from('comandas').delete().eq('room_id', currentRoom.id).eq('user_id', playerId);
      fetchItems();
    }
  };

  const adminDeleteItem = async (itemId) => {
    if (!user.isAdmin) return;
    await supabase.from('comandas').delete().eq('id', itemId);
    fetchItems();
  };

  const adminAddItem = async (playerId, playerName, itemData) => {
    if (!user.isAdmin) return;
    await supabase.from('comandas').insert({
      room_id: currentRoom.id,
      user_id: playerId,
      user_name: playerName,
      nome: itemData.nome,
      preco: itemData.preco,
      qtd: itemData.qtd
    });
    fetchItems();
  };

  const adminUpdateItem = async (itemId, updates) => {
    if (!user.isAdmin) return;
    await supabase.from('comandas').update(updates).eq('id', itemId);
    fetchItems();
  };

  const formatCurrencyInput = (val) => {
    let v = val.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return "R$ " + v;
  };


  if (!mounted || loading || !user) return <div className="loading">Carregando...</div>;

  return (
    <div className="container">
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
      <div className="theme-toggle-mobile">
        <ThemeToggle />
      </div>
      <header>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <ThemeToggle />
        </div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg" alt="Botafogo" className="bfr-logo" />
        <h1>Firezone</h1>
        <div className="subtitle">
          Olá, {user.name} {user.isAdmin && <span className="admin-tag">(Admin)</span>}
        </div>
      </header>

      {!currentRoom ? (
        <>
          <div id="lobbyScreen">
            <div id="roomsList">
              {rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Nenhuma sala aberta.</div>
              ) : (
                rooms.map(room => {
                  const roomItems = lobbyItems.filter(i => i.room_id === room.id);
                  const participants = new Set(roomItems.map(i => i.user_id)).size;
                  const roomTotal = roomItems.reduce((acc, curr) => acc + (curr.preco * curr.qtd), 0);

                  return (
                    <div key={room.id} className="room-card" onClick={() => enterRoom(room.id, room.name)}>
                      <div className="room-info">
                        <h3>{room.name}</h3>
                        <div className="room-users">
                          <Users size={14} />
                          <span>{participants}</span>
                        </div>
                      </div>
                      <div className="room-actions">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '4px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total</span>
                          <div className="room-total-preview">{BRL.format(roomTotal)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {user.isAdmin && (
                            <button
                              className="btn-admin-small"
                              onClick={(e) => deleteRoom(e, room.id)}
                              style={{ border: 'none', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <ChevronDown className="arrow-right" style={{ transform: 'rotate(-90deg)', color: 'var(--text-secondary)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button className="btn-create-room" onClick={createRoom}>+ Criar Nova Sala</button>
            <button className={`btn-admin-login ${user.isAdmin ? 'is-logged' : ''}`} onClick={toggleAdmin}>
              {user.isAdmin ? '✅ Admin Logado' : '🔑 Acesso Admin'}
            </button>
          </div>
        </>
      ) : (
        <div id="roomScreen">
          <div className="room-header-bar">
            <button className="btn-back" onClick={exitRoom}><ArrowLeft size={16} /> Voltar</button>
            <div className="room-title-display">{currentRoom.name}</div>
            <div style={{ width: '60px' }}></div>
          </div>

          <div className="room-nav">
            <button className={`nav-btn ${view === 'minha' ? 'active' : ''}`} onClick={() => setView('minha')}>Minha Comanda</button>
            <button className={`nav-btn ${view === 'ranking' ? 'active' : ''}`} onClick={() => setView('ranking')}>Ranking</button>
          </div>

          {view === 'minha' ? (
            <div id="visaoMinha">
              <div className={`card-expand ${isFormOpen ? 'open' : ''}`}>
                <div className="card-header" onClick={() => setIsFormOpen(!isFormOpen)}>
                  <span>Adicionar Item</span>
                  <span>{isFormOpen ? '-' : '+'}</span>
                </div>
                <div className="card-body">
                  <input
                    type="text"
                    placeholder="Item (ex: Cerveja)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <div className="input-group" style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(formatCurrencyInput(e.target.value))}
                    />
                    <input
                      type="number"
                      style={{ width: '80px', textAlign: 'center' }}
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <button className="btn-add" onClick={addItem}>Adicionar</button>
                </div>
              </div>

              <ul>
                <AnimatePresence mode="popLayout">
                  {items.filter(i => i.user_id === user.id).map((item, index, filtered) => {
                    const isEditing = editingId === item.id;
                    return (
                      <motion.li
                        key={item.id}
                        className="item-card"
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {isEditing ? (
                          <div style={{ width: '100%', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <input id={`edit-name-${item.id}`} defaultValue={item.nome} />
                            <input id={`edit-price-${item.id}`} defaultValue={BRL.format(item.preco)} onInput={(e) => e.target.value = formatCurrencyInput(e.target.value)} />
                            <button className="btn-add" onClick={() => saveEdit(item.id, document.getElementById(`edit-name-${item.id}`).value, document.getElementById(`edit-price-${item.id}`).value)}>OK</button>
                          </div>
                        ) : (
                          <>
                            <div className="info-container">
                              <div className="item-nome">{item.nome}</div>
                              <div className="item-details">{item.qtd}x {BRL.format(item.preco)}</div>
                              <div className="item-total">{BRL.format(item.preco * item.qtd)}</div>
                            </div>
                            <div className="controls-container">
                              <div className="arrow-stack">
                                <button style={{ visibility: index > 0 ? 'visible' : 'hidden' }} onClick={() => reorder(item.id, 'UP')}><ChevronUp size={14} /></button>
                                <button style={{ visibility: index < filtered.length - 1 ? 'visible' : 'hidden' }} onClick={() => reorder(item.id, 'DOWN')}><ChevronDown size={14} /></button>
                              </div>
                              <button className="btn-edit-square" onClick={() => setEditingId(item.id)}><Pencil size={14} /></button>
                              <div className="qty-pill">
                                <button className="qty-btn" onClick={() => updateQty(item.id, item.qtd - 1)}>-</button>
                                <div className="qty-value">{item.qtd}</div>
                                <button className="qty-btn" onClick={() => updateQty(item.id, item.qtd + 1)}>+</button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            </div>
          ) : (
            <div id="visaoRanking">
              {Object.values(items.reduce((acc, item) => {
                if (!acc[item.user_id]) acc[item.user_id] = { id: item.user_id, name: item.user_name, total: 0, items: [] };
                acc[item.user_id].total += (item.preco * item.qtd);
                acc[item.user_id].items.push(item);
                return acc;
              }, {})).sort((a, b) => b.total - a.total).map((player, index) => (
                <RankingCard
                  key={player.id}
                  player={player}
                  index={index}
                  isAdmin={user.isAdmin}
                  onDeleteUser={() => adminDeleteUser(player.id)}
                  onUpdateItem={adminUpdateItem}
                  onDeleteItem={adminDeleteItem}
                  onAddItem={adminAddItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {currentRoom && (
        <div className="total-dock" style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {view === 'minha' ? 'Total da Minha Comanda' : 'Total da Mesa Inteira'}
            </div>
            <div className="total-value">
              {BRL.format(items.reduce((acc, curr) => {
                if (view === 'minha') return curr.user_id === user.id ? acc + (curr.preco * curr.qtd) : acc;
                return acc + (curr.preco * curr.qtd);
              }, 0))}
            </div>
          </div>
          {view === 'minha' && (
            <button className="btn-trash-dock" onClick={clearMyComanda}>
              <Trash2 size={20} />
            </button>
          )}
        </div>
      )}



      <style jsx>{`
        header { text-align: center; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; width: 100%; position: relative; }
        .theme-toggle-mobile { display: none; position: absolute; top: 20px; right: 20px; z-index: 10; }
        @media (max-width: 600px) {
           .theme-toggle-mobile { display: block; }
           header > div { display: none !important; }
        }
        .bfr-logo { width: 60px; height: 60px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
        h1 { font-size: 24px; letter-spacing: -1px; margin: 0; font-weight: 800; text-align: center; width: 100%; color: var(--text-primary); }
        .subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 5px; font-weight: 500; text-align: center; width: 100%; }
        .admin-tag { color: var(--danger); font-weight: 700; font-size: 12px; margin-left: 4px; vertical-align: middle; }

        .room-nav { display: flex; gap: 10px; margin-bottom: 20px; background: var(--nav-bg); padding: 4px; border-radius: 10px; }
        .nav-btn { flex: 1; padding: 8px; border-radius: 8px; border: none; background: transparent; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
        .nav-btn.active { background: var(--nav-item-active-bg); color: var(--nav-item-active-text); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

        .room-card { 
          background: var(--bg-card); border-radius: 16px; padding: 15px 20px; margin-bottom: 15px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; 
          cursor: pointer;
          border: 1px solid var(--border-color);
        }
        .room-info h3 { margin: 0 0 5px 0; font-size: 18px; font-weight: 700; word-break: break-word; color: var(--text-primary); }
        .room-users { font-size: 14px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; font-weight: 600; margin-top: 5px; }
        .room-actions { display: flex; align-items: center; gap: 20px; }
        .room-total-preview { font-weight: 800; font-size: 16px; color: var(--text-primary); }

        .btn-create-room { width: 100%; background: var(--bg-card); border: 2px dashed var(--border-color); color: var(--text-secondary); padding: 15px; border-radius: 16px; font-weight: 700; margin-bottom: 15px; }
        .btn-admin-login { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 8px 15px; border-radius: 20px; font-size: 12px; margin: 0 auto; font-weight: 600; display: block; }
        .btn-admin-login.is-logged { background: var(--success-bg); color: var(--success-text); border-color: var(--success-border); }

        .room-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-back { background: var(--btn-secondary-border); border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; display: flex; align-items: center; gap: 4px; color: var(--text-primary); }
        .room-title-display { font-size: 16px; font-weight: 800; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }

        .card-expand { background: var(--bg-card); border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; border: 1px solid var(--border-color); }
        .card-header { padding: 15px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 600; color: var(--text-primary); }
        .card-body { height: 0; opacity: 0; padding: 0 18px; transition: all 0.3s; pointer-events: none; }
        .card-expand.open .card-body { height: auto; min-height: 160px; opacity: 1; padding-bottom: 18px; pointer-events: auto; }
        .input-group { display: flex; gap: 8px; margin-bottom: 10px; }
        .btn-add { width: 100%; background: var(--btn-primary-bg); color: var(--btn-primary-text); padding: 12px; border-radius: 8px; border: none; font-weight: 600; }

        :global(.item-card) { 
          background: var(--bg-card) !important; 
          padding: 12px 15px !important; 
          border-radius: 14px !important; 
          margin-bottom: 10px !important; 
          border: 1px solid var(--border-color) !important;
          border-left: 8px solid var(--text-primary) !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important; 
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          min-height: 80px !important;
          box-sizing: border-box !important;
          width: 100% !important;
          list-style: none !important;
        }

        .info-container { display: flex; flex-direction: column; justify-content: center; flex-grow: 1; padding-right: 15px; gap: 2px; }
        .item-nome { font-weight: 800; font-size: 15px; color: var(--text-primary); letter-spacing: -0.4px; line-height: 1.1; }
        .item-details { color: var(--text-secondary); font-size: 12px; font-weight: 500; }
        .item-total { font-weight: 900; font-size: 16px; color: var(--text-primary); margin-top: 2px; }

        .controls-container { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .arrow-stack { display: flex; flex-direction: column; background: var(--bg-hover); border-radius: 8px; width: 28px; height: 40px; justify-content: space-evenly; align-items: center; border: 1px solid var(--border-color); }
        .arrow-stack button { border: none; background: transparent; color: var(--text-secondary); padding: 2px; width: 100%; display: flex; justify-content: center; cursor: pointer; transition: color 0.2s; }
        .arrow-stack button:hover { color: var(--text-primary); }
        .btn-edit-square { width: 34px; height: 34px; background: var(--bg-hover); border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .btn-edit-square:hover { background: var(--border-color); color: var(--text-primary); }
        
        .qty-pill { display: flex; align-items: center; background: var(--bg-hover); border-radius: 8px; padding: 3px 5px; height: 34px; box-sizing: border-box; gap: 4px; border: 1px solid var(--border-color); }
        .qty-btn { width: 24px; height: 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); cursor: pointer; color: var(--text-primary); display: flex; align-items: center; justify-content: center; }
        .qty-btn:active { transform: scale(0.92); }
        .qty-value { min-width: 18px; text-align: center; font-weight: 800; font-size: 13px; color: var(--text-primary); }

        .total-dock { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 30px); max-width: 420px; background: var(--dock-bg); color: var(--dock-text); padding: 12px 20px; border-radius: 14px; justify-content: space-between; align-items: center; z-index: 100; box-sizing: border-box; box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .total-value { font-size: 20px; font-weight: 700; }
        .btn-trash-dock { background: var(--dock-btn-bg); color: #ff6b6b; border: none; padding: 8px; border-radius: 8px; font-size: 18px; transition: transform 0.2s; }
        .btn-trash-dock:active { transform: scale(0.9); }


      `}</style>
    </div>
  );
}

function PasswordModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Senha Admin</h3>
        <input
          type="password"
          placeholder="Digite a senha..."
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSuccess(password);
              setPassword('');
            }
          }}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn-confirm" onClick={() => { onSuccess(password); setPassword(''); }}>Confirmar</button>
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: var(--bg-card); padding: 20px; border-radius: 12px; width: 90%; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: var(--text-primary); }
        h3 { margin-top: 0; margin-bottom: 15px; text-align: center; }
        input { width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 8px; margin-bottom: 15px; box-sizing: border-box; font-size: 16px; background: var(--input-bg); color: var(--text-primary); }
        .modal-actions { display: flex; gap: 10px; }
        button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-confirm { background: var(--btn-primary-bg); color: var(--btn-primary-text); }
        .btn-cancel { background: var(--btn-secondary-bg); color: var(--btn-secondary-text); }
      `}</style>
    </div>
  );
}

function RankingCard({ player, index, isAdmin, onDeleteUser, onUpdateItem, onDeleteItem, onAddItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  let posIcon = `${index + 1}º`;
  let posClass = 'pos-n';
  if (index === 0) { posIcon = '🥇'; posClass = 'pos-1'; }
  else if (index === 1) { posIcon = '🥈'; posClass = 'pos-2'; }
  else if (index === 2) { posIcon = '🥉'; posClass = 'pos-3'; }

  return (
    <div className="rank-card">
      <div className="rank-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="rank-info">
          <div className={`rank-pos ${posClass}`}>{posIcon}</div>
          <div className="rank-name">{player.name}</div>
        </div>
        <div className="rank-total">
          {BRL.format(player.total)}
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      {isOpen && (
        <div className="rank-details">
          {player.items && player.items.map((i, idx) => {
            const isEditing = editingItemId === i.id;
            return (
              <div key={i.id || idx} className="detail-item-container">
                {isEditing ? (
                  <div className="admin-edit-form">
                    <input defaultValue={i.nome} id={`admin-edit-name-${i.id}`} placeholder="Nome" />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        defaultValue={formatCurrencyInput(i.preco.toFixed(2))}
                        id={`admin-edit-price-${i.id}`}
                        placeholder="R$ 0,00"
                        onInput={(e) => e.target.value = formatCurrencyInput(e.target.value)}
                      />
                      <input defaultValue={i.qtd} id={`admin-edit-qty-${i.id}`} placeholder="Qtd" type="number" style={{ width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      <button className="btn-save-admin" onClick={(e) => {
                        e.stopPropagation();
                        // Use Number() for robust parsing
                        let qtyInput = document.getElementById(`admin-edit-qty-${i.id}`).value;
                        const newQtd = qtyInput === '' ? 0 : parseInt(qtyInput);

                        if (newQtd <= 0) {
                          if (confirm("Remover este item?")) {
                            onDeleteItem(i.id);
                            setEditingItemId(null);
                          }
                          // If cancelled, keep editing? Or close? User said "pop up doesn't appear", so let's ensure it does.
                          // If they explicitly put 0, they probably mean delete.
                        } else {
                          const updates = {
                            nome: document.getElementById(`admin-edit-name-${i.id}`).value,
                            preco: parseCurrency(document.getElementById(`admin-edit-price-${i.id}`).value),
                            qtd: newQtd
                          };
                          onUpdateItem(i.id, updates);
                          setEditingItemId(null);
                        }
                      }}>Salvar</button>
                      <button className="btn-cancel-admin" onClick={(e) => { e.stopPropagation(); setEditingItemId(null); }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="detail-item">
                    <span>{i.qtd}x {i.nome} <span style={{ color: '#999', fontSize: '11px' }}>({BRL.format(i.preco)})</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{BRL.format(i.preco * i.qtd)}</span>
                      {isAdmin && (
                        <button className="btn-admin-small" onClick={(e) => { e.stopPropagation(); setEditingItemId(i.id); }}>
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isAdmin && (
            <>
              {isAdding ? (
                <div className="admin-edit-form" style={{ borderTop: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>Adicionar Item para {player.name}</div>
                  <input id={`admin-add-name-${player.id}`} placeholder="Nome do Item" />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      id={`admin-add-price-${player.id}`}
                      placeholder="R$ 0,00"
                      defaultValue="R$ 0,00"
                      onInput={(e) => e.target.value = formatCurrencyInput(e.target.value)}
                    />
                    <input id={`admin-add-qty-${player.id}`} placeholder="Qtd" type="number" defaultValue="1" style={{ width: '60px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button className="btn-save-admin" onClick={(e) => {
                      e.stopPropagation();
                      const itemData = {
                        nome: document.getElementById(`admin-add-name-${player.id}`).value,
                        preco: parseCurrency(document.getElementById(`admin-add-price-${player.id}`).value),
                        qtd: parseInt(document.getElementById(`admin-add-qty-${player.id}`).value)
                      };
                      if (itemData.nome && itemData.preco > 0) {
                        onAddItem(player.id, player.name, itemData);
                        setIsAdding(false);
                      } else {
                        alert("Preencha nome e preço.");
                      }
                    }}>Adicionar</button>
                    <button className="btn-cancel-admin" onClick={(e) => { e.stopPropagation(); setIsAdding(false); }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="admin-actions" style={{ gap: '10px' }}>
                  <button className="btn-admin-small" onClick={(e) => { e.stopPropagation(); setIsAdding(true); }} style={{ width: 'auto', padding: '8px 12px', background: '#e8f5e9', color: '#2e7d32', fontWeight: '700', fontSize: '12px', gap: '6px' }}>
                    <Plus size={14} /> Adicionar Item
                  </button>
                  <button className="btn-delete-user" onClick={(e) => { e.stopPropagation(); onDeleteUser(); }}>
                    <Trash2 size={14} /> Deletar Usuário
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <style jsx>{`
        .rank-card { background: var(--bg-card); border-radius: 12px; margin-bottom: 10px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .rank-header { padding: 15px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background 0.2s; }
        .rank-header:active { background: var(--bg-hover); }
        .rank-info { display: flex; align-items: center; gap: 10px; }
        .rank-pos { font-weight: 900; width: 25px; font-size: 18px; text-align: center; }
        .rank-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
        .rank-total { font-weight: 800; font-size: 15px; color: var(--text-primary); display: flex; align-items: center; }
        .rank-details { background: var(--bg-hover); border-top: 1px solid var(--border-color); }
        .detail-item-container { border-bottom: 1px solid var(--border-color); }
        .detail-item { padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-secondary); }
        
        .admin-edit-form { padding: 15px; display: flex; flex-direction: column; gap: 8px; background: var(--bg-hover); }
        .admin-actions { padding: 12px; border-top: 1px dashed var(--border-color); display: flex; justify-content: center; align-items: center; }
        .btn-delete-user { background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger-border); padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .btn-admin-small { background: var(--bg-hover); border: none; padding: 6px; border-radius: 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; }
        .btn-save-admin { background: var(--btn-primary-bg); color: var(--btn-primary-text); border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; flex: 1; cursor: pointer; }
        .btn-cancel-admin { background: var(--btn-secondary-bg); color: var(--btn-secondary-text); border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }

        .pos-1 { color: var(--gold); }
        .pos-2 { color: var(--silver); }
        .pos-3 { color: var(--bronze); }
        .pos-n { color: var(--text-secondary); font-size: 14px; }
      `}</style>
    </div>
  );
}
