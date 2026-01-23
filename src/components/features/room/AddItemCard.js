/**
 * Add item card component - expandable form for adding new items
 * @module components/features/room/AddItemCard
 */

'use client';

import { useState } from 'react';
import { formatCurrencyInput } from '@/utils/currency';

/**
 * Expandable card with form for adding new items to user's tab
 * Manages its own form state internally
 * 
 * @param {Object} props - Component props
 * @param {(name: string, price: string, qty: number) => void} props.onAdd - Callback when item is added
 * @returns {JSX.Element} Add item card component
 * 
 * @example
 * <AddItemCard onAdd={(name, price, qty) => addItem(name, price, qty)} />
 */
export default function AddItemCard({ onAdd }) {
    const [isOpen, setIsOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('R$ 0,00');
    const [itemQty, setItemQty] = useState(1);

    /**
     * Handles adding the item and resetting the form
     */
    const handleAdd = () => {
        onAdd(itemName, itemPrice, itemQty);
        // Reset form
        setItemName('');
        setItemPrice('R$ 0,00');
        setItemQty(1);
        setIsOpen(false);
    };

    return (
        <div className={`card-expand ${isOpen ? 'open' : ''}`}>
            <div className="card-header" onClick={() => setIsOpen(!isOpen)}>
                <span>Adicionar Item</span>
                <span>{isOpen ? '-' : '+'}</span>
            </div>
            <div className="card-body">
                <input
                    type="text"
                    placeholder="Item (ex: Cerveja)"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <div className="input-group" style={{ marginTop: '10px' }}>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(formatCurrencyInput(e.target.value))}
                    />
                    <input
                        type="number"
                        style={{ width: '80px', textAlign: 'center' }}
                        value={itemQty}
                        onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    />
                </div>
                <button className="btn-add" onClick={handleAdd}>
                    Adicionar
                </button>
            </div>

            <style jsx>{`
        .card-expand {
          background: var(--bg-card);
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .card-header {
          padding: 15px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-primary);
          user-select: none;
        }

        .card-header:hover {
          background: var(--bg-hover);
        }

        .card-body {
          height: 0;
          opacity: 0;
          padding: 0 18px;
          transition: all 0.3s;
          pointer-events: none;
        }

        .card-expand.open .card-body {
          height: auto;
          min-height: 160px;
          opacity: 1;
          padding-bottom: 18px;
          pointer-events: auto;
        }

        .input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
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
          transition: all 0.2s;
        }

        .btn-add:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
        </div>
    );
}
