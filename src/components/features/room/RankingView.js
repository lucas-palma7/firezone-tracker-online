/**
 * Ranking view component - displays all users sorted by total
 * @module components/features/room/RankingView
 */

'use client';

import RankingCard from './RankingCard';

/**
 * View displaying all users in the room ranked by their total spending
 * Aggregates items by user and sorts by total value
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/item.types').Item[]} props.items - All items in the room
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {(userId: string) => void} props.onDeleteUser - Callback when deleting a user
 * @param {(itemId: number, updates: object) => void} props.onUpdateItem - Callback when updating an item
 * @param {(itemId: number) => void} props.onDeleteItem - Callback when deleting an item
 * @param {(userId: string, userName: string, itemData: object) => void} props.onAddItem - Callback when adding item
 * @returns {JSX.Element} Ranking view component
 * 
 * @example
 * <RankingView
 *   items={allItems}
 *   isAdmin={user.isAdmin}
 *   onDeleteUser={deleteUser}
 *   onUpdateItem={updateItem}
 *   onDeleteItem={deleteItem}
 *   onAddItem={addItem}
 * />
 */
export default function RankingView({ items, isAdmin, onDeleteUser, onUpdateItem, onDeleteItem, onAddItem }) {
    // Aggregate items by user
    const playerRankings = Object.values(
        items.reduce((acc, item) => {
            if (!acc[item.user_id]) {
                acc[item.user_id] = {
                    id: item.user_id,
                    name: item.user_name,
                    total: 0,
                    items: []
                };
            }
            acc[item.user_id].total += (item.preco * item.qtd);
            acc[item.user_id].items.push(item);
            return acc;
        }, {})
    ).sort((a, b) => b.total - a.total); // Sort by total descending

    return (
        <div id="visaoRanking">
            {playerRankings.map((player, index) => (
                <RankingCard
                    key={player.id}
                    player={player}
                    index={index}
                    isAdmin={isAdmin}
                    onDeleteUser={() => onDeleteUser(player.id)}
                    onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem}
                    onAddItem={onAddItem}
                />
            ))}
        </div>
    );
}
