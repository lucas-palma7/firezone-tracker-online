'use client';

import { useState, useEffect, useRef } from 'react';
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
  Settings,
  Circle
} from 'lucide-react';
import { verifyAdminPassword } from '@/app/actions';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Home() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('minha'); // 'minha' or 'ranking'
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('R$ 0,00');
  const [newItemQty, setNewItemQty] = useState(1);

  useEffect(() => {
    // 1. Initialize User
    const savedUser = localStorage.getItem('fz_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const name = prompt("Qual seu nome?") || "Torcedor";
      const newUser = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name,
        isAdmin: false
      };
      localStorage.setItem('fz_user', JSON.stringify(newUser));
      setUser(newUser);
    }

    // 2. Clear room if not saved
    const savedRoomId = localStorage.getItem('fz_current_room_id');
    const savedRoomName = localStorage.getItem('fz_current_room_name');
    if (savedRoomId && savedRoomName) {
      setCurrentRoom({ id: savedRoomId, name: savedRoomName });
    }

    fetchRooms();
    setLoading(false);
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
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    setRooms(data || []);
  }

  async function fetchItems() {
    if (!currentRoom) return;
    const { data } = await supabase.from('comandas').select('*').eq('room_id', currentRoom.id).order('created_at', { ascending: true });
    setItems(data || []);
  }

  const toggleAdmin = async () => {
    if (user.isAdmin) {
      if (confirm("Sair do modo Admin?")) {
        const updated = { ...user, isAdmin: false };
        setUser(updated);
        localStorage.setItem('fz_user', JSON.stringify(updated));
      }
    } else {
      const senha = prompt("Senha Admin:");
      const isValid = await verifyAdminPassword(senha);
      if (isValid) {
        const updated = { ...user, isAdmin: true };
        setUser(updated);
        localStorage.setItem('fz_user', JSON.stringify(updated));
      } else if (senha) {
        alert("Senha incorreta.");
      }
    }
  };

  const createRoom = async () => {
    if (!user.isAdmin) {
      const senha = prompt("Senha de Admin:");
      const isValid = await verifyAdminPassword(senha);
      if (!isValid) return alert("Senha incorreta.");
    }
    const name = prompt("Nome da Sala:");
    if (!name) return;

    const { data, error } = await supabase.from('rooms').insert({ name }).select();
    if (error) {
      alert("Erro ao criar sala.");
    } else {
      enterRoom(data[0].id, data[0].name);
      fetchRooms();
    }
  };

  const enterRoom = (id, name) => {
    setCurrentRoom({ id, name });
    localStorage.setItem('fz_current_room_id', id);
    localStorage.setItem('fz_current_room_name', name);
  };

  const exitRoom = () => {
    setCurrentRoom(null);
    localStorage.removeItem('fz_current_room_id');
    localStorage.removeItem('fz_current_room_name');
  };

  const addItem = async () => {
    const price = parseFloat(newItemPrice.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
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
      if (confirm("Remover item?")) {
        await supabase.from('comandas').delete().eq('id', id);
        fetchItems();
      }
    } else {
      await supabase.from('comandas').update({ qtd: newQty }).eq('id', id);
      fetchItems();
    }
  };

  const saveEdit = async (id, name, priceStr) => {
    const price = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
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

  const formatCurrencyInput = (val) => {
    let v = val.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return "R$ " + v;
  };

  if (loading || !user) return <div className="loading">Carregando...</div>;

  return (
    <div className="container">
      <header>
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg" alt="Botafogo" className="bfr-logo" />
        <h1>Firezone</h1>
        <div className="subtitle">
          Olá, {user.name} {user.isAdmin && <span className="admin-tag">(Admin)</span>}
        </div>
      </header>

      {!currentRoom ? (
        <div id="lobbyScreen">
          <div id="roomsList">
            {rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Nenhuma sala aberta.</div>
            ) : (
              rooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => enterRoom(room.id, room.name)}>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <div className="room-users">
                      <div className="user-dot"></div>
                      #{items.filter(i => i.room_id === room.id).reduce((acc, curr) => acc.add(curr.user_id), new Set()).size} pessoas na lista
                    </div>
                  </div>
                  <ChevronDown className="arrow-right" style={{ transform: 'rotate(-90deg)' }} />
                </div>
              ))
            )}
          </div>
          <button className="btn-create-room" onClick={createRoom}>+ Criar Nova Sala</button>
          <button className={`btn-admin-login ${user.isAdmin ? 'is-logged' : ''}`} onClick={toggleAdmin}>
            {user.isAdmin ? '✅ Admin Logado' : '🔑 Acesso Admin'}
          </button>
        </div>
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
                {items.filter(i => i.user_id === user.id).map((item, index, filtered) => {
                  const isEditing = editingId === item.id;
                  return (
                    <li key={item.id}>
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
                    </li>
                  )
                })}
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
                <RankingCard key={player.id} player={player} index={index} />
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
        header { text-align: center; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; }
        .bfr-logo { width: 60px; height: 60px; margin-bottom: 10px; }
        h1 { font-size: 24px; letter-spacing: -1px; margin: 0; font-weight: 800; }
        .subtitle { font-size: 14px; color: #666; margin-top: 5px; font-weight: 500; }
        .admin-tag { color: var(--danger); font-weight: 700; font-size: 12px; margin-left: 4px; vertical-align: middle; }

        .room-nav { display: flex; gap: 10px; margin-bottom: 20px; background: #e0e0e0; padding: 4px; border-radius: 10px; }
        .nav-btn { flex: 1; padding: 8px; border-radius: 8px; border: none; background: transparent; font-weight: 600; color: #666; transition: all 0.2s; }
        .nav-btn.active { background: var(--bfr-black); color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

        .room-card { 
          background: white; border-radius: 16px; padding: 15px 20px; margin-bottom: 15px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; 
          cursor: pointer;
        }
        .room-info h3 { margin: 0 0 5px 0; font-size: 18px; font-weight: 700; word-break: break-word; }
        .room-users { font-size: 11px; color: #888; display: flex; align-items: center; gap: 6px; font-weight: 500; margin-top: 5px; }
        .user-dot { width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; }

        .btn-create-room { width: 100%; background: white; border: 2px dashed #ccc; color: #666; padding: 15px; border-radius: 16px; font-weight: 700; margin-bottom: 15px; }
        .btn-admin-login { background: transparent; border: 1px solid #ddd; color: #555; padding: 8px 15px; border-radius: 20px; font-size: 12px; margin: 0 auto; font-weight: 600; display: block; }
        .btn-admin-login.is-logged { background: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }

        .room-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-back { background: #ddd; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; display: flex; align-items: center; gap: 4px; }
        .room-title-display { font-size: 16px; font-weight: 800; text-transform: uppercase; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .card-expand { background: var(--bg-card); border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; }
        .card-header { padding: 15px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 600; }
        .card-body { height: 0; opacity: 0; padding: 0 18px; transition: all 0.3s; pointer-events: none; }
        .card-expand.open .card-body { height: auto; min-height: 160px; opacity: 1; padding-bottom: 18px; pointer-events: auto; }
        .input-group { display: flex; gap: 8px; margin-bottom: 10px; }
        .btn-add { width: 100%; background: var(--bfr-black); color: white; padding: 12px; border-radius: 8px; border: none; font-weight: 600; }

        li { 
          background: white; 
          padding: 15px; 
          border-radius: 16px; 
          margin-bottom: 12px; 
          border-left: 5px solid var(--bfr-black); 
          box-shadow: 0 4px 12px rgba(0,0,0,0.04); 
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 80px; 
        }

        .info-container { display: flex; flex-direction: column; justify-content: center; flex-grow: 1; padding-right: 10px; }
        .item-nome { font-weight: 800; font-size: 16px; color: #000; margin-bottom: 4px; line-height: 1.2; }
        .item-details { color: #888; font-size: 13px; margin-bottom: 4px; }
        .item-total { font-weight: 800; font-size: 16px; color: #000; }

        .controls-container { display: flex; align-items: center; gap: 8px; }
        .arrow-stack { display: flex; flex-direction: column; background: #f4f4f4; border-radius: 6px; width: 30px; height: 44px; justify-content: space-evenly; align-items: center; }
        .arrow-stack button { border: none; background: transparent; font-size: 10px; color: #555; padding: 2px; width: 100%; display: flex; justify-content: center; }
        .btn-edit-square { width: 34px; height: 34px; background: #f4f4f4; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; color: #333; }
        
        .qty-pill { display: flex; align-items: center; background: #f4f4f4; border-radius: 8px; padding: 4px; height: 34px; box-sizing: border-box; }
        .qty-btn { width: 24px; height: 24px; background: white; border: none; border-radius: 4px; font-weight: bold; font-size: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .qty-value { min-width: 24px; text-align: center; font-weight: 700; font-size: 14px; }

        .total-dock { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 30px); max-width: 420px; background: var(--bfr-black); color: white; padding: 12px 20px; border-radius: 14px; justify-content: space-between; align-items: center; z-index: 100; box-sizing: border-box; box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .total-value { font-size: 20px; font-weight: 700; }
        .btn-trash-dock { background: #333; color: #ff6b6b; border: none; padding: 8px; border-radius: 8px; font-size: 18px; transition: transform 0.2s; }
        .btn-trash-dock:active { transform: scale(0.9); }
      `}</style>
    </div>
  );
}

function RankingCard({ player, index }) {
  const [isOpen, setIsOpen] = useState(false);

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
          <span style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      {isOpen && (
        <div className="rank-details">
          {player.items.map((i, idx) => (
            <div key={idx} className="detail-item">
              <span>{i.qtd}x {i.nome} <span style={{ color: '#999', fontSize: '11px' }}>({BRL.format(i.preco)})</span></span>
              <span>{BRL.format(i.preco * i.qtd)}</span>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .rank-card { background: white; border-radius: 12px; margin-bottom: 10px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .rank-header { padding: 15px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .rank-info { display: flex; align-items: center; gap: 10px; }
        .rank-pos { font-weight: 900; width: 25px; font-size: 18px; text-align: center; }
        .rank-name { font-weight: 600; font-size: 15px; }
        .rank-total { font-weight: 800; font-size: 15px; }
        .rank-details { background: #fcfcfc; border-top: 1px solid #eee; }
        .detail-item { padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; font-size: 13px; color: #555; }
        .pos-1 { color: #FFD700; }
        .pos-2 { color: #C0C0C0; }
        .pos-3 { color: #CD7F32; }
        .pos-n { color: #ccc; font-size: 14px; }
      `}</style>
    </div>
  );
}
