import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook for polling webhook events
 * Provides real-time updates when webhooks are received by the server
 * 
 * @param {Object} options Configuration options
 * @param {number} options.pollInterval Polling interval in milliseconds (default: 5000)
 * @param {boolean} options.enabled Whether polling is enabled (default: true)
 * @param {Function} options.onNewEvent Callback when new events are received
 * @returns {Object} Hook state and controls
 */
export function useWebhookPolling({
    pollInterval = 5000,
    enabled = true,
    onNewEvent = null
} = {}) {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState(null);
    const lastPollRef = useRef(Date.now());
    const intervalRef = useRef(null);

    /**
     * Fetch recent webhook events since last poll
     */
    const fetchEvents = useCallback(async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Not authenticated');
                return;
            }

            const response = await axios.get(`${API_URL}/webhook/recent`, {
                params: { since: lastPollRef.current, limit: 50 },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.events.length > 0) {
                const newEvents = response.data.events;

                // Add new events to state
                setEvents(prev => {
                    // Deduplicate by ID
                    const existingIds = new Set(prev.map(e => e.id));
                    const uniqueNew = newEvents.filter(e => !existingIds.has(e.id));
                    return [...uniqueNew, ...prev].slice(0, 100); // Keep last 100
                });

                // Call callback for each new event
                if (onNewEvent) {
                    newEvents.forEach(event => onNewEvent(event));
                }
            }

            lastPollRef.current = Date.now();
        } catch (err) {
            console.error('Error polling webhooks:', err);
            setError(err.message);
        }
    }, [onNewEvent]);

    /**
     * Fetch webhook statistics
     */
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await axios.get(`${API_URL}/webhook/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    /**
     * Start polling
     */
    const startPolling = useCallback(() => {
        if (intervalRef.current) return; // Already polling

        setIsPolling(true);
        fetchEvents(); // Initial fetch
        fetchStats(); // Initial stats

        intervalRef.current = setInterval(() => {
            fetchEvents();
        }, pollInterval);

        // Fetch stats every 30 seconds
        const statsInterval = setInterval(fetchStats, 30000);
        intervalRef.current.statsInterval = statsInterval;
    }, [fetchEvents, fetchStats, pollInterval]);

    /**
     * Stop polling
     */
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            clearInterval(intervalRef.current.statsInterval);
            intervalRef.current = null;
            setIsPolling(false);
        }
    }, []);

    /**
     * Clear all events
     */
    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    /**
     * Mark event as read (remove from list)
     */
    const markAsRead = useCallback((eventId) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    }, []);

    /**
     * Auto-start/stop polling based on enabled prop
     */
    useEffect(() => {
        if (enabled) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => stopPolling();
    }, [enabled, startPolling, stopPolling]);

    return {
        // State
        events,
        stats,
        isPolling,
        error,

        // Controls
        startPolling,
        stopPolling,
        clearEvents,
        markAsRead,
        refetch: fetchEvents
    };
}

/**
 * Example usage in component:
 * 
 * function Dashboard() {
 *     const { events, stats, clearEvents, markAsRead } = useWebhookPolling({
 *         pollInterval: 5000,
 *         onNewEvent: (event) => {
 *             // Show notification
 *             if (event.eventType === 'messages') {
 *                 toast.info(event.preview);
 *             } else if (event.eventType === 'message_template_status_update') {
 *                 toast.success(event.preview);
 *             }
 *         }
 *     });
 * 
 *     return (
 *         <div>
 *             <h2>Recent Webhook Events</h2>
 *             {events.map(event => (
 *                 <div key={event.id}>
 *                     <p>{event.preview}</p>
 *                     <small>{new Date(event.timestamp).toLocaleString()}</small>
 *                     <button onClick={() => markAsRead(event.id)}>Dismiss</button>
 *                 </div>
 *             ))}
 *             
 *             {stats && (
 *                 <div>
 *                     <h3>Webhook Statistics</h3>
 *                     <p>Total: {stats.total}</p>
 *                     <p>Messages: {stats.messages}</p>
 *                     <p>Template Updates: {stats.templateUpdates}</p>
 *                     <p>Last 24h: {stats.last24Hours}</p>
 *                 </div>
 *             )}
 *         </div>
 *     );
 * }
 */
