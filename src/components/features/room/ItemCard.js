/**
 * Item card component - displays a single item with edit/reorder controls
 * @module components/features/room/ItemCard
 */

'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { BRL, formatCurrencyInput } from '@/utils/currency';
import { SPRING_CONFIG } from '@/utils/constants';

/**
 * Animated card displaying a single item with controls for editing, quantity adjustment, and reordering
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/item.types').Item} props.item - The item to display
 * @param {number} props.index - Index of this item in the user's list
 * @param {number} props.totalItems - Total number of items in the user's list
 * @param {(itemId: number, name: string, price: string) => void} props.onEdit - Callback when item is edited
 * @param {(itemId: number, newQty: number) => void} props.onUpdateQty - Callback when quantity is changed
 * @param {(itemId: number, direction: 'UP' | 'DOWN') => void} props.onReorder - Callback when item is reordered
 * @returns {JSX.Element} Item card component
 * 
 * @example
 * <ItemCard
 *   item={item}
 *   index={0}
 *   totalItems={5}
 *   onEdit={saveEdit}
 *   onUpdateQty={updateQty}
 *   onReorder={reorder}
 * />
 */
export default function ItemCard({ item, index, totalItems, onEdit, onUpdateQty, onReorder }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(item.nome);
    const [editPrice, setEditPrice] = useState(BRL.format(item.preco));

    /**
     * Handles saving the edit
     */
    const handleSave = () => {
        onEdit(item.id, editName, editPrice);
        setIsEditing(false);
    };

    /**
     * Handles entering edit mode
     */
    const handleStartEdit = () => {
        setEditName(item.nome);
        setEditPrice(BRL.format(item.preco));
        setIsEditing(true);
    };

    return (
        <motion.li
            className="item-card"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SPRING_CONFIG}
        >
            {isEditing ? (
                <div style={{ width: '100%', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nome do item"
                    />
                    <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(formatCurrencyInput(e.target.value))}
                        placeholder="R$ 0,00"
                    />
                    <button className="btn-add" onClick={handleSave}>
                        OK
                    </button>
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
                            <button
                                style={{ visibility: index > 0 ? 'visible' : 'hidden' }}
                                onClick={() => onReorder(item.id, 'UP')}
                            >
                                <ChevronUp size={14} />
                            </button>
                            <button
                                style={{ visibility: index < totalItems - 1 ? 'visible' : 'hidden' }}
                                onClick={() => onReorder(item.id, 'DOWN')}
                            >
                                <ChevronDown size={14} />
                            </button>
                        </div>
                        <button className="btn-edit-square" onClick={handleStartEdit}>
                            <Pencil size={14} />
                        </button>
                        <div className="qty-pill">
                            <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qtd - 1)}>
                                -
                            </button>
                            <div className="qty-value">{item.qtd}</div>
                            <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qtd + 1)}>
                                +
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style jsx global>{`
        .item-card {
          background: var(--bg-card) !important;
          padding: 12px 15px !important;
          border-radius: 14px !important;
          margin-bottom: 10px !important;
          border: 1px solid var(--border-color) !important;
          border-left: 8px solid var(--text-primary) !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          min-height: 80px !important;
          box-sizing: border-box !important;
          width: 100% !important;
          list-style: none !important;
        }

        .info-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-grow: 1;
          padding-right: 15px;
          gap: 2px;
        }

        .item-nome {
          font-weight: 800;
          font-size: 15px;
          color: var(--text-primary);
          letter-spacing: -0.4px;
          line-height: 1.1;
        }

        .item-details {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
        }

        .item-total {
          font-weight: 900;
          font-size: 16px;
          color: var(--text-primary);
          margin-top: 2px;
        }

        .controls-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .arrow-stack {
          display: flex;
          flex-direction: column;
          background: var(--bg-hover);
          border-radius: 8px;
          width: 28px;
          height: 40px;
          justify-content: space-evenly;
          align-items: center;
          border: 1px solid var(--border-color);
        }

        .arrow-stack button {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 2px;
          width: 100%;
          display: flex;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s;
        }

        .arrow-stack button:hover {
          color: var(--text-primary);
        }

        .btn-edit-square {
          width: 34px;
          height: 34px;
          background: var(--bg-hover);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit-square:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .qty-pill {
          display: flex;
          align-items: center;
          background: var(--bg-hover);
          border-radius: 8px;
          padding: 3px 5px;
          height: 34px;
          box-sizing: border-box;
          gap: 4px;
          border: 1px solid var(--border-color);
        }

        .qty-btn {
          width: 24px;
          height: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:active {
          transform: scale(0.92);
        }

        .qty-value {
          min-width: 18px;
          text-align: center;
          font-weight: 800;
          font-size: 13px;
          color: var(--text-primary);
        }

        .btn-add {
          width: 100%;
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
        </motion.li>
    );
}
