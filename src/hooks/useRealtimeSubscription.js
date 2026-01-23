/**
 * Custom hook for managing Supabase real-time subscriptions
 * @module hooks/useRealtimeSubscription
 */

'use client';

import { useEffect } from 'react';
import { supabase } from '@/services/supabase/client';

/**
 * Hook that sets up a real-time subscription to a room's comandas table
 * Automatically cleans up the subscription when the component unmounts or roomId changes
 * 
 * @param {string | null} roomId - The ID of the room to subscribe to (null to disable subscription)
 * @param {() => void} onUpdate - Callback function to execute when data changes
 * 
 * @example
 * useRealtimeSubscription(currentRoom?.id, () => {
 *   fetchItems(); // Refresh items when changes occur
 * });
 */
export function useRealtimeSubscription(roomId, onUpdate) {
    useEffect(() => {
        // Don't set up subscription if no room is selected
        if (!roomId) return;

        // Create a channel for this specific room
        const channel = supabase
            .channel(`room_${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'comandas',
                    filter: `room_id=eq.${roomId}`
                },
                () => {
                    // Execute callback when any change occurs
                    onUpdate();
                }
            )
            .subscribe();

        // Cleanup: remove the channel when component unmounts or roomId changes
        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, onUpdate]);
}
