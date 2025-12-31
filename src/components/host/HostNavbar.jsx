import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FiUser,
  FiBell,
  FiPieChart,
  FiGrid,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiCalendar,
  FiCreditCard,
  FiHelpCircle,
  FiClock,
  FiStar,
  FiLayers,
  FiMapPin
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa"; 
import { motion, AnimatePresence } from "framer-motion";
import { fetchHosts, fetchHostSubscription, fetchNotifications } from "../../api";
import "../../pages/HostDashboard/HostDashboard.css"; // Ensure CSS is imported

const HostNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hostName, setHostName] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadHostData = async () => {
      const loginData = localStorage.getItem("hostLoginData");
      if (loginData) {
        const parsedLoginData = JSON.parse(loginData);
        const hostId = parsedLoginData.hostId;

        try {
          // Fetch notifications to get unread count
          try {
            const notes = await fetchNotifications(hostId, "HOST");
            const unread = notes.filter(n => !n.isRead).length;
            setUnreadCount(unread);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }

          const hosts = await fetchHosts();
          const host = hosts.find(h => String(h.id) === String(hostId));

          if (host) {
            setHostName(host.companyName || host.company_name || parsedLoginData.username);
            setProfileImage(host.profileImage || host.profile_image || null);

            try {
              const subData = await fetchHostSubscription(hostId);
              setSubscription(subData);
            } catch (err) {
              console.error("Error fetching subscription:", err);
              setSubscription({ plan_name: "Free" }); 
            }
          }
        } catch (error) {
          console.error("Error loading host data:", error);
        }
      }
    };

    loadHostData();
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('host-sidebar-collapsed');
    } else {
      document.body.classList.remove('host-sidebar-collapsed');
    }
    return () => document.body.classList.remove('host-sidebar-collapsed');
  }, [isCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("hostLoginData");
    navigate("/host-login");
  };

  const isActive = (path) => location.pathname === path;

  const getPlanBadgeText = (sub) => {
    if (!sub) return null;
    const name = (sub.plan_name || sub.plan_type || 'Free').toUpperCase();
    if (name.includes('BASIC')) return 'Basic';
    if (name.includes('PRO')) return 'Pro';
    if (name.includes('ELITE')) return 'Elite';
    return sub.plan_name || sub.plan_type || 'Free';
  };

  const navItems = [
    { path: "/host/dashboard", label: "Dashboard", icon: <FiPieChart /> },
    { path: "/host/properties", label: "Branches", icon: <FiGrid /> },
    { path: "/host/coupons-offers", label: "Coupons & Offers", icon: <FiTag /> },
    { path: "/host/bookings", label: "All Bookings", icon: <FiCalendar /> },
    { path: "/host/today-arrivals", label: "Today's Arrivals", icon: <FiClock /> },
    { path: "/host/reviews", label: "Reviews", icon: <FiStar /> },
    { path: "/host/membership-cards", label: "Membership Cards", icon: <FiCreditCard /> },
    { path: "/host/membership-requests", label: "Membership Requests", icon: <FiLayers /> },
    { 
      path: "/host/subscription-details", 
      label: "Subscription", 
      icon: <FiMapPin />, 
      badge: subscription ? getPlanBadgeText(subscription) : null 
    },
    { path: "/host/support", label: "Support", icon: <FiHelpCircle /> },
    { path: "/host/notifications", label: "Notifications", icon: <FiBell />, unread: unreadCount },
    { path: "/host/profile", label: "Profile", icon: <FiUser /> }
  ];

  return (
    <>
      <nav className={`host-sidebar-modern ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header-modern">
          <div className="brand-section-modern">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`brand-icon-modern shadow-lg ${profileImage ? 'has-image' : ''}`}
              style={{ overflow: 'hidden' }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaBuilding size={20} color="white" />
              )}
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="brand-text-modern"
                >
                  <h2 className="brand-title-modern">GeoBookings</h2>
                  <span className="brand-subtitle-modern">Host Portal</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-modern">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={item.path}
                className={`nav-item-modern ${isActive(item.path) ? "active" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="nav-icon-modern">
                  {item.icon}
                  {item.unread > 0 && isCollapsed && (
                    <span className="collapsed-unread-dot" />
                  )}
                </span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="nav-label-wrapper-modern"
                    >
                      <span className="nav-label-modern">{item.label}</span>
                      {item.unread > 0 && (
                        <span className="unread-badge-modern">{item.unread}</span>
                      )}
                      {item.badge && (
                        <span className="plan-pill-modern">{item.badge}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer-modern">
          {!isCollapsed && (
            <div className="user-profile-mini">
              <div className="avatar-mini">
                 <span className="fw-bold">{hostName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="profile-info-mini">
                <span className="profile-name-mini">{hostName || "Host"}</span>
                <span className="profile-role-mini">Manager</span>
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="logout-btn-modern"
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Styles injected here for sidebar specific micro-interactions */}
      <style>{`
        .host-sidebar-modern {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: linear-gradient(180deg, #001A14 0%, #000F0C 100%);
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .host-sidebar-modern.collapsed {
          width: 88px;
        }

        .sidebar-header-modern {
          padding: 2.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .brand-section-modern {
           display: flex;
           align-items: center;
           gap: 1rem;
        }

        .brand-icon-modern {
           width: 40px;
           height: 40px;
           background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
           border-radius: 10px;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .brand-title-modern {
           color: white;
           font-size: 1.25rem;
           font-weight: 700;
           margin: 0;
           letter-spacing: 0.5px;
        }

        .brand-subtitle-modern {
           color: rgba(255,255,255,0.5);
           font-size: 0.75rem;
           text-transform: uppercase;
           letter-spacing: 1px;
        }

        .collapse-toggle-btn {
           background: rgba(255,255,255,0.05);
           border: none;
           border-radius: 6px;
           color: rgba(255,255,255,0.7);
           cursor: pointer;
           padding: 4px;
           transition: all 0.2s;
        }
        
        .collapse-toggle-btn:hover {
           background: rgba(255,255,255,0.1);
           color: white;
        }

        .sidebar-nav-modern {
           flex: 1;
           overflow-y: auto;
           padding: 1.5rem 1rem;
        }

        .nav-item-modern {
           display: flex;
           align-items: center;
           gap: 0.8rem;
           padding: 0.8rem 1rem;
           color: rgba(255,255,255,0.7);
           text-decoration: none !important;
           border-radius: 10px;
           margin-bottom: 0.4rem;
           transition: all 0.2s;
           font-size: 0.9rem;
           font-weight: 500;
           position: relative;
        }

        .nav-item-modern:hover {
           background: rgba(255,255,255,0.05);
           color: white;
           padding-left: 1.2rem;
        }

        .nav-item-modern.active {
           background: rgba(255,255,255,0.1);
           color: white;
           font-weight: 600;
        }

        .nav-icon-modern {
           font-size: 1.2rem;
           display: flex;
           align-items: center;
           justify-content: center;
           width: 24px;
        }

        .nav-label-wrapper-modern {
           flex: 1;
           display: flex;
           align-items: center;
           overflow: hidden;
           white-space: nowrap;
        }
         
        .nav-label-modern {
           margin-right: auto;
        }

        .sidebar-footer-modern {
           padding: 1.5rem;
           background: rgba(0,0,0,0.15);
           border-top: 1px solid rgba(255,255,255,0.05);
        }

        .user-profile-mini {
           display: flex;
           align-items: center;
           gap: 1rem;
           margin-bottom: 1rem;
        }
        
        .avatar-mini {
           width: 36px;
           height: 36px;
           border-radius: 50%;
           background: rgba(255,255,255,0.1);
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
        }

        .profile-info-mini {
           display: flex;
           flex-direction: column;
        }

        .profile-name-mini {
           color: white;
           font-weight: 600;
           font-size: 0.9rem;
        }

        .profile-role-mini {
           color: rgba(255,255,255,0.5);
           font-size: 0.75rem;
        }

        .logout-btn-modern {
           width: 100%;
           border: 1px solid rgba(239, 68, 68, 0.3);
           background: rgba(239, 68, 68, 0.1);
           color: #fca5a5;
           padding: 0.75rem;
           border-radius: 8px;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 0.5rem;
           cursor: pointer;
           transition: all 0.2s;
        }

        .logout-btn-modern:hover {
           background: rgba(239, 68, 68, 0.2);
           color: white;
        }

        .unread-badge-modern {
           background: #ef4444; 
           color: white;
           font-size: 0.7rem;
           padding: 2px 6px;
           border-radius: 10px;
           font-weight: 700;
        }

        .plan-pill-modern {
           background: #fbbf24;
           color: #78350f;
           font-size: 0.65rem;
           padding: 2px 8px;
           border-radius: 4px;
           font-weight: 700;
           text-transform: uppercase;
        }
      `}</style>
      
      {/* Top Mobile Notifications Icon */}
      <style>{`
        .host-top-notification-modern {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: white;
          padding: 10px;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .unread-count-top {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .collapsed-unread-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #001A14;
        }

        @media (max-width: 768px) {
          .host-sidebar-modern {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .host-sidebar-modern.mobile-open {
            transform: translateX(0);
          }
          .host-top-notification-modern {
            display: flex;
          }
        }
      `}</style>

      <div 
        className="host-top-notification-modern d-md-none"
        onClick={() => navigate('/host/notifications')}
      >
        <FiBell size={20} color="#002C22" />
        {unreadCount > 0 && <span className="unread-count-top">{unreadCount}</span>}
      </div>
    </>
  );
};

export default HostNavbar;
