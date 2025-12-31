import { useState, useEffect, useRef } from 'react';
import { fetchNotifications } from '../api';

const useNotificationPoller = (userId, userType, interval = 10000) => {
    const [latestNotification, setLatestNotification] = useState(null);
    // Use a ref to store the last known latest ID to avoid re-renders if nothing changes
    // But we need to update it when we fetch
    const lastSeenIdRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const poll = async () => {
            try {
                const data = await fetchNotifications(userId, userType);
                setNotifications(data);

                if (data && data.length > 0) {
                    const newest = data[0]; 
                    const newestId = Number(newest.id);
                    const currentId = Number(lastSeenIdRef.current);

                    // Initial load
                    if (lastSeenIdRef.current === null) {
                        // Check session storage first to avoid re-popping seen notifications on refresh
                        const storedId = sessionStorage.getItem(`lastSeenNotificationId_${userId}`);
                        const sessionLastId = storedId ? Number(storedId) : 0;

                        lastSeenIdRef.current = newestId > sessionLastId ? newestId : sessionLastId;
                        
                        // Only notify if it's strictly newer than what we've ever seen in this session
                        // AND it's unread
                        if (newestId > sessionLastId && !newest.isRead) {
                             console.log("Poller: Initial load found new unseen notification:", newestId);
                             setLatestNotification(newest);
                             sessionStorage.setItem(`lastSeenNotificationId_${userId}`, newestId);
                        } else {
                             console.log("Poller: Initial load. Newest:", newestId, "SessionLast:", sessionLastId, ". No popup.");
                             // If session has nothing, we mark current newest as seen to avoid popping up old stuff
                             if (!storedId) {
                                 sessionStorage.setItem(`lastSeenNotificationId_${userId}`, newestId);
                             }
                        }
                    }
                    // Subsequent polls
                    else if (newestId > currentId) {
                        console.log("Poller: New notification detected!", newestId);
                        lastSeenIdRef.current = newestId;
                        sessionStorage.setItem(`lastSeenNotificationId_${userId}`, newestId);
                        
                        if (!newest.isRead) {
                            setLatestNotification(newest);
                        }
                    }
                }
            } catch (error) {
                console.warn("Notification polling failed", error);
            }
        };

        // Initial fetch
        poll();

        const timer = setInterval(poll, 2000); // Poll every 2 seconds
        return () => clearInterval(timer);
    }, [userId, userType, interval]);

    const clearNotification = () => {
        setLatestNotification(null);
    };

    return { latestNotification, clearNotification, notifications };
};

export default useNotificationPoller;
