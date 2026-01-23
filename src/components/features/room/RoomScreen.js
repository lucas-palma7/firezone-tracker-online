/**
 * Room screen component - main container for room views
 * @module components/features/room/RoomScreen
 */

'use client';

import RoomHeader from './RoomHeader';
import RoomNavigation from './RoomNavigation';
import MyTabView from './MyTabView';
import RankingView from './RankingView';
import TotalDock from './TotalDock';
import { VIEW_MODES } from '@/utils/constants';

/**
 * Main room screen container that orchestrates all room-related components
 * Handles view switching between "My Tab" and "Ranking"
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/room.types').CurrentRoom} props.currentRoom - Current room data
 * @param {import('../../../types/user.types').User} props.user - Current user object
 * @param {import('../../../types/item.types').Item[]} props.items - All items in the room
 * @param {string} props.view - Current view mode ('minha' or 'ranking')
 * @param {(view: string) => void} props.onViewChange - Callback when view changes
 * @param {() => void} props.onExit - Callback when exiting the room
 * @param {(name: string, price: string, qty: number) => void} props.onAddItem - Callback when adding item
 * @param {(itemId: number, newQty: number) => void} props.onUpdateQty - Callback when updating quantity
 * @param {(itemId: number, direction: 'UP' | 'DOWN') => void} props.onReorder - Callback when reordering
 * @param {(itemId: number, name: string, price: string) => void} props.onEdit - Callback when editing item
 * @param {() => void} props.onClearMyTab - Callback when clearing user's tab
 * @param {(userId: string) => void} props.onDeleteUser - Callback when deleting user (admin)
 * @param {(itemId: number, updates: object) => void} props.onUpdateItem - Callback when updating item (admin)
 * @param {(itemId: number) => void} props.onDeleteItem - Callback when deleting item (admin)
 * @param {(userId: string, userName: string, itemData: object) => void} props.onAddItemToUser - Callback when adding item to user (admin)
 * @returns {JSX.Element} Room screen component
 * 
 * @example
 * <RoomScreen
 *   currentRoom={currentRoom}
 *   user={user}
 *   items={items}
 *   view={view}
 *   onViewChange={setView}
 *   onExit={exitRoom}
 *   onAddItem={addItem}
 *   onUpdateQty={updateQty}
 *   onReorder={reorder}
 *   onEdit={saveEdit}
 *   onClearMyTab={clearMyComanda}
 *   onDeleteUser={adminDeleteUser}
 *   onUpdateItem={adminUpdateItem}
 *   onDeleteItem={adminDeleteItem}
 *   onAddItemToUser={adminAddItem}
 * />
 */
export default function RoomScreen({
    currentRoom,
    user,
    items,
    view,
    onViewChange,
    onExit,
    onAddItem,
    onUpdateQty,
    onReorder,
    onEdit,
    onClearMyTab,
    onDeleteUser,
    onUpdateItem,
    onDeleteItem,
    onAddItemToUser
}) {
    // Calculate total based on current view
    const total = items.reduce((acc, curr) => {
        if (view === VIEW_MODES.MY_TAB) {
            return curr.user_id === user.id ? acc + (curr.preco * curr.qtd) : acc;
        }
        return acc + (curr.preco * curr.qtd);
    }, 0);

    return (
        <div id="roomScreen">
            <RoomHeader roomName={currentRoom.name} onBack={onExit} />

            <RoomNavigation activeView={view} onViewChange={onViewChange} />

            {view === VIEW_MODES.MY_TAB ? (
                <MyTabView
                    items={items}
                    user={user}
                    onAddItem={onAddItem}
                    onUpdateQty={onUpdateQty}
                    onReorder={onReorder}
                    onEdit={onEdit}
                />
            ) : (
                <RankingView
                    items={items}
                    isAdmin={user.isAdmin}
                    onDeleteUser={onDeleteUser}
                    onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem}
                    onAddItem={onAddItemToUser}
                />
            )}

            <TotalDock
                total={total}
                view={view}
                onClearMyTab={view === VIEW_MODES.MY_TAB ? onClearMyTab : undefined}
            />
        </div>
    );
}
