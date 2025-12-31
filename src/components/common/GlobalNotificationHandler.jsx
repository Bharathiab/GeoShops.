import React, { useEffect, useState } from 'react';
import useNotificationPoller from '../../hooks/useNotificationPoller';
import NotificationToast from './NotificationToast';
import { useLocation } from 'react-router-dom';

const GlobalNotificationHandler = () => {
    const location = useLocation();
    const [userData, setUserData] = useState({ id: null, type: null });

    // Re-check auth whenever route changes (simple way to detect login/logout)
    useEffect(() => {
        const checkAuth = () => {
            const path = location.pathname;

            // Priority based on current route
            if (path.startsWith("/admin")) {
                const adminData = localStorage.getItem("adminLoginData");
                if (adminData) {
                    const parsed = JSON.parse(adminData);
                    console.log("GlobalNotificationHandler: Detected ADMIN on path", path, "ID:", parsed.id);
                    if (parsed.id) return setUserData({ id: parsed.id, type: 'ADMIN' });
                }
            }
            
            if (path.startsWith("/host")) {
                const hostData = localStorage.getItem("hostLoginData");
                if (hostData) {
                    const parsed = JSON.parse(hostData);
                    if (parsed.hostId) return setUserData({ id: parsed.hostId, type: 'HOST' });
                }
            }

            if (path.startsWith("/user")) {
                const userData = localStorage.getItem("userLoginData");
                if (userData) {
                    const parsed = JSON.parse(userData);
                    if (parsed.userId) return setUserData({ id: parsed.userId, type: 'USER' });
                }
            }

            // Fallback for general pages (like home) - use existing priority or explicit checks
            // If we are at root /, maybe check who is logged in?
            const adminData = localStorage.getItem("adminLoginData");
            if (adminData && path.startsWith("/admin")) return; // Already handled

            // If we are not in a specific route, maybe default to Host if exists, then User?
            // Actually, if I'm on generic page, I might want ALL notifications? 
            // The poller only supports one. Let's stick to priority if Route didn't match.
            
            if (localStorage.getItem("hostLoginData")) {
                 const parsed = JSON.parse(localStorage.getItem("hostLoginData"));
                 if (parsed.hostId) return setUserData({ id: parsed.hostId, type: 'HOST' });
            }
            if (localStorage.getItem("userLoginData")) {
                 const parsed = JSON.parse(localStorage.getItem("userLoginData"));
                 if (parsed.userId) return setUserData({ id: parsed.userId, type: 'USER' });
            }
            if (localStorage.getItem("adminLoginData")) {
                 const parsed = JSON.parse(localStorage.getItem("adminLoginData"));
                 if (parsed.id) return setUserData({ id: parsed.id, type: 'ADMIN' });
            }

            setUserData({ id: null, type: null });
        };

        checkAuth();
    }, [location.pathname]);

    const { latestNotification, clearNotification } = useNotificationPoller(userData.id, userData.type);

    // Sound effect
    useEffect(() => {
        if (latestNotification) {
            console.log("GlobalNotificationHandler: Playing notification sound for", latestNotification.id);
            try {
                // Original notification sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 1.0;
                audio.play().catch(e => console.warn("Audio play failed (Autoplay policy?):", e));
            } catch (error) {
                console.error("Failed to play notification sound", error);
            }
        }
    }, [latestNotification]);

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 999999, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>
                <NotificationToast
                    notification={latestNotification}
                    onClose={clearNotification}
                    type={userData.type}
                />
            </div>
        </div>
    );
};

export default GlobalNotificationHandler;
