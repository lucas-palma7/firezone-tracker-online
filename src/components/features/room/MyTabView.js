/**
 * My Tab view component - displays user's personal items
 * @module components/features/room/MyTabView
 */

'use client';

import { AnimatePresence } from 'framer-motion';
import AddItemCard from './AddItemCard';
import ItemCard from './ItemCard';

/**
 * View displaying the current user's personal tab with their items
 * Includes add item card and list of user's items
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/item.types').Item[]} props.items - All items in the room
 * @param {import('../../../types/user.types').User} props.user - Current user object
 * @param {(name: string, price: string, qty: number) => void} props.onAddItem - Callback when adding new item
 * @param {(itemId: number, newQty: number) => void} props.onUpdateQty - Callback when updating quantity
 * @param {(itemId: number, direction: 'UP' | 'DOWN') => void} props.onReorder - Callback when reordering items
 * @param {(itemId: number, name: string, price: string) => void} props.onEdit - Callback when editing item
 * @returns {JSX.Element} My Tab view component
 * 
 * @example
 * <MyTabView
 *   items={allItems}
 *   user={currentUser}
 *   onAddItem={addItem}
 *   onUpdateQty={updateQty}
 *   onReorder={reorder}
 *   onEdit={saveEdit}
 * />
 */
export default function MyTabView({ items, user, onAddItem, onUpdateQty, onReorder, onEdit }) {
    // Filter items to show only the current user's items
    const myItems = items.filter(i => i.user_id === user.id);

    return (
        <div id="visaoMinha">
            <AddItemCard onAdd={onAddItem} />

            <ul>
                <AnimatePresence mode="popLayout">
                    {myItems.map((item, index) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            index={index}
                            totalItems={myItems.length}
                            onEdit={onEdit}
                            onUpdateQty={onUpdateQty}
                            onReorder={onReorder}
                        />
                    ))}
                </AnimatePresence>
            </ul>

            <style jsx>{`
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      `}</style>
        </div>
    );
}
