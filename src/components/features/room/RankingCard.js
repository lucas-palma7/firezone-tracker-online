/**
 * Ranking card component - displays a user's ranking position and items
 * @module components/features/room/RankingCard
 */

'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { BRL, formatCurrencyInput, parseCurrency } from '@/utils/currency';

/**
 * Expandable card showing a user's ranking position, total, and items
 * Includes admin controls for editing, adding, and deleting items
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/item.types').PlayerRanking} props.player - Player ranking data
 * @param {number} props.index - Ranking position (0-based)
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {() => void} props.onDeleteUser - Callback when deleting entire user
 * @param {(itemId: number, updates: object) => void} props.onUpdateItem - Callback when updating an item
 * @param {(itemId: number) => void} props.onDeleteItem - Callback when deleting an item
 * @param {(playerId: string, playerName: string, itemData: object) => void} props.onAddItem - Callback when adding item to user
 * @returns {JSX.Element} Ranking card component
 * 
 * @example
 * <RankingCard
 *   player={playerData}
 *   index={0}
 *   isAdmin={user.isAdmin}
 *   onDeleteUser={() => deleteUser(player.id)}
 *   onUpdateItem={updateItem}
 *   onDeleteItem={deleteItem}
 *   onAddItem={addItem}
 * />
 */
export default function RankingCard({ player, index, isAdmin, onDeleteUser, onUpdateItem, onDeleteItem, onAddItem }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // Determine position icon and class
    let posIcon = `${index + 1}º`;
    let posClass = 'pos-n';
    if (index === 0) { posIcon = '🥇'; posClass = 'pos-1'; }
    else if (index === 1) { posIcon = '🥈'; posClass = 'pos-2'; }
    else if (index === 2) { posIcon = '🥉'; posClass = 'pos-3'; }

    /**
     * Handles saving an edited item
     * @param {Event} e - Click event
     * @param {import('../../../types/item.types').Item} item - The item being edited
     */
    const handleSaveEdit = (e, item) => {
        e.stopPropagation();

        const qtyInput = document.getElementById(`admin-edit-qty-${item.id}`).value;
        const newQtd = qtyInput === '' ? 0 : parseInt(qtyInput);

        if (newQtd <= 0) {
            if (confirm("Remover este item?")) {
                onDeleteItem(item.id);
                setEditingItemId(null);
            }
        } else {
            const updates = {
                nome: document.getElementById(`admin-edit-name-${item.id}`).value,
                preco: parseCurrency(document.getElementById(`admin-edit-price-${item.id}`).value),
                qtd: newQtd
            };
            onUpdateItem(item.id, updates);
            setEditingItemId(null);
        }
    };

    /**
     * Handles adding a new item to this player
     * @param {Event} e - Click event
     */
    const handleAddItem = (e) => {
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
    };

    return (
        <div className="rank-card">
            <div className="rank-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="rank-info">
                    <div className={`rank-pos ${posClass}`}>{posIcon}</div>
                    <div className="rank-name">{player.name}</div>
                </div>
                <div className="rank-total">
                    {BRL.format(player.total)}
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                        {isOpen ? '▲' : '▼'}
                    </span>
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
                                            <input
                                                defaultValue={i.qtd}
                                                id={`admin-edit-qty-${i.id}`}
                                                placeholder="Qtd"
                                                type="number"
                                                inputMode="numeric"
                                                style={{ width: '60px', textAlign: 'center' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                            <button className="btn-save-admin" onClick={(e) => handleSaveEdit(e, i)}>
                                                Salvar
                                            </button>
                                            <button className="btn-cancel-admin" onClick={(e) => { e.stopPropagation(); setEditingItemId(null); }}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="detail-item">
                                        <span>
                                            {i.qtd}x {i.nome} <span style={{ color: '#999', fontSize: '11px' }}>({BRL.format(i.preco)})</span>
                                        </span>
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
                                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
                                        Adicionar Item para {player.name}
                                    </div>
                                    <input id={`admin-add-name-${player.id}`} placeholder="Nome do Item" />
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input
                                            id={`admin-add-price-${player.id}`}
                                            placeholder="R$ 0,00"
                                            defaultValue="R$ 0,00"
                                            onInput={(e) => e.target.value = formatCurrencyInput(e.target.value)}
                                        />
                                        <input
                                            id={`admin-add-qty-${player.id}`}
                                            placeholder="Qtd"
                                            type="number"
                                            inputMode="numeric"
                                            defaultValue="1"
                                            style={{ width: '60px', textAlign: 'center' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                        <button className="btn-save-admin" onClick={handleAddItem}>
                                            Adicionar
                                        </button>
                                        <button className="btn-cancel-admin" onClick={(e) => { e.stopPropagation(); setIsAdding(false); }}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="admin-actions" style={{ gap: '10px' }}>
                                    <button
                                        className="btn-admin-small"
                                        onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                                        style={{
                                            width: 'auto',
                                            padding: '8px 12px',
                                            background: '#e8f5e9',
                                            color: '#2e7d32',
                                            fontWeight: '700',
                                            fontSize: '12px',
                                            gap: '6px'
                                        }}
                                    >
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
        .rank-card {
          background: var(--bg-card);
          border-radius: 12px;
          margin-bottom: 10px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
        }

        .rank-header {
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s;
        }

        .rank-header:active {
          background: var(--bg-hover);
        }

        .rank-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rank-pos {
          font-weight: 900;
          width: 25px;
          font-size: 18px;
          text-align: center;
        }

        .rank-name {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary);
        }

        .rank-total {
          font-weight: 800;
          font-size: 15px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }

        .rank-details {
          background: var(--bg-hover);
          border-top: 1px solid var(--border-color);
        }

        .detail-item-container {
          border-bottom: 1px solid var(--border-color);
        }

        .detail-item {
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .admin-edit-form {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: var(--bg-hover);
        }

        .admin-actions {
          padding: 12px;
          border-top: 1px dashed var(--border-color);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-delete-user {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1px solid var(--danger-border);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-admin-small {
          background: var(--bg-hover);
          border: none;
          padding: 6px;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .btn-save-admin {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          flex: 1;
          cursor: pointer;
        }

        .btn-cancel-admin {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-text);
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .pos-1 { color: var(--gold); }
        .pos-2 { color: var(--silver); }
        .pos-3 { color: var(--bronze); }
        .pos-n { color: var(--text-secondary); font-size: 14px; }
      `}</style>
        </div>
    );
}
