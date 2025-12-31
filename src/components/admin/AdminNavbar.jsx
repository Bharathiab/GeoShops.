import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarCheck,
  FaUserTie,
  FaBuilding,
  FaGift,
  FaTicketAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCreditCard,
  FaIdCard,
  FaHeadset,
  FaTaxi,
  FaHospital,
  FaCut,
  FaEllipsisH,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoice,
  FaBell,
  FaCar,
  FaHeartbeat,
  FaCog,
  FaFileAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDepartments, fetchNotifications } from "../../api";
import "./admin.css";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const data = await fetchDepartments(); // Fetch only active departments
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    loadDepts();

    const loadNotifications = async () => {
      const loginData = localStorage.getItem("adminLoginData");
      if (loginData) {
        // Assuming adminLoginData has some ID or we just use a known Admin ID or fetch for generic ADMIN type?
        // Backend stores Admin notifications with an ID. If all admins share notifications, we might need a shared box.
        // But my backend code used `admin.getId()`.
        // I need to know the current Admin's ID.
        try {
          const parsed = JSON.parse(loginData);
          if (parsed.id) {
            const notes = await fetchNotifications(parsed.id, "ADMIN");
            setUnreadCount(notes.filter(n => !n.isRead).length);
          }
        } catch (e) {
          console.error("Error loading notifications", e);
        }
      }
    };
    loadNotifications();
  }, []);

  // Add/remove body class based on collapse state
  useEffect(() => {
    console.log('Navbar collapsed state:', isCollapsed);
    if (isCollapsed) {
      document.body.classList.add('admin-sidebar-collapsed');
      console.log('Added admin-sidebar-collapsed class to body');
    } else {
      document.body.classList.remove('admin-sidebar-collapsed');
      console.log('Removed admin-sidebar-collapsed class from body');
    }
  }, [isCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoginData");
    navigate("/admin-login");
  };

  const toggleSubMenu = (label) => {
    setExpandedMenu(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getIconForDept = (name) => {
    switch (name) {
      case 'Hotel': return <FaBuilding />;
      case 'Cab': return <FaCar />;
      case 'Hospital': return <FaHeartbeat />;
      case 'Salon': return <FaCut />;
      default: return <FaBuilding />;
    }
  };

  const defaultDeptNames = ['Hotel', 'Hospital', 'Cab', 'Salon'];

  // Filter departments
  const defaultDepts = defaultDeptNames.map(name =>
    departments.find(d => d.name === name)
  ).filter(Boolean); // Only keep those that exist and are active

  const otherDepts = departments.filter(d => !defaultDeptNames.includes(d.name));

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
    { path: "/admin/booked-hotels", label: "Bookings", icon: <FaCalendarCheck /> },
    { path: "/admin/hosts", label: "Hosts", icon: <FaUserTie /> },
    { path: "/admin/branch-requests", label: "Branch Requests", icon: <FaBuilding /> },

    // Default Departments
    ...defaultDepts.map(dept => ({
      path: `/admin/properties/${dept.name}`, // Assuming a route for specific department properties
      label: dept.name,
      icon: getIconForDept(dept.name)
    })),

    // More Departments Dropdown
    ...(otherDepts.length > 0 ? [{
      label: "More Departments",
      icon: <FaEllipsisH />,
      subItems: otherDepts.map(dept => ({
        path: `/admin/properties/${dept.name}`,
        label: dept.name,
        icon: getIconForDept(dept.name)
      }))
    }] : []),

    { path: "/admin/departments", label: "Manage Departments", icon: <FaBuilding /> }, // Renamed for clarity
    { path: "/admin/subscriptions", label: "Subscriptions", icon: <FaCreditCard /> },
    { path: "/admin/subscription-requests", label: "Subscription Requests", icon: <FaFileInvoice /> },
    { path: "/admin/memberships", label: "Memberships", icon: <FaIdCard /> },
    { path: "/admin/coupons", label: "Coupons", icon: <FaTicketAlt /> },
    { path: "/admin/offers", label: "Offers", icon: <FaGift /> },
    { path: "/admin/notifications", label: "Notifications", icon: <FaBell />, badge: unreadCount },
    { path: "/admin/support", label: "Support", icon: <FaHeadset /> },
    
    // System Settings Dropdown
    {
      label: "System Settings",
      icon: <FaCog />,
      subItems: [
        { path: "/admin/templates", label: "Templates", icon: <FaFileAlt /> },
        { path: "/admin/system-settings", label: "General Settings", icon: <FaCog /> }
      ]
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header-modern">
          <div className="brand-section-modern">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="brand-icon-modern shadow-lg"
            >
              <FaTachometerAlt size={22} />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="brand-text-modern"
                >
                  <h2 className="brand-title-modern">ADMIN</h2>
                  <span className="brand-subtitle-modern">Control Panel</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-nav-modern">
          {navItems.map((item, index) => {
            if (item.subItems) {
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="nav-group-modern"
                >
                  <div
                    className={`nav-item-modern ${expandedMenu[item.label] ? "expanded" : ""}`}
                    onClick={() => toggleSubMenu(item.label)}
                  >
                    <span className="nav-icon-modern">{item.icon}</span>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="nav-label-wrapper"
                        >
                          <span className="nav-label-modern">{item.label}</span>
                          {expandedMenu[item.label] ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {expandedMenu[item.label] && !isCollapsed && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="sub-menu-modern"
                      >
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`nav-item-modern sub-item-modern ${isActive(subItem.path) ? "active" : ""}`}
                          >
                            <span className="nav-icon-modern small-icon">{subItem.icon}</span>
                            <span className="nav-label-modern">{subItem.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`nav-item-modern ${isActive(item.path) ? "active" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className="nav-icon-modern">
                    {item.icon}
                    {item.badge > 0 && isCollapsed && (
                      <span className="collapsed-badge">{item.badge}</span>
                    )}
                  </span>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="nav-label-wrapper"
                      >
                        <span className="nav-label-modern">{item.label}</span>
                        {item.badge > 0 && (
                          <Badge bg="danger" className="ms-auto badge-glow">
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive(item.path) && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="active-line-modern" 
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="sidebar-footer-modern">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="logout-btn-modern shadow-vibrant"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt size={16} />
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

      <style>{`
        .admin-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 250px;
          background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-sidebar.collapsed {
          width: 88px;
        }

        .sidebar-header-modern {
          padding: 2rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
        }

        .brand-section-modern {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          overflow: hidden;
        }

        .brand-icon-modern {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .brand-text-modern {
          display: flex;
          flex-direction: column;
          white-space: nowrap;
        }

        .brand-title-modern {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          letter-spacing: 2px;
          line-height: 1;
        }

        .brand-subtitle-modern {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .collapse-toggle-btn {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .collapse-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .sidebar-nav-modern {
          flex: 1;
          padding: 1.5rem 0.75rem;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-nav-modern::-webkit-scrollbar {
          display: none;
        }

        .nav-item-modern {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          margin: 0.25rem 0;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none !important;
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-item-modern:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item-modern.active {
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
          font-weight: 700;
          border-right: 2px solid #7c3aed;
        }

        .nav-icon-modern {
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          position: relative;
        }

        .nav-label-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
          overflow: hidden;
        }

        .nav-label-modern {
          white-space: nowrap;
        }

        .active-line-modern {
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 4px;
          background: white;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        }

        .sub-menu-modern {
          margin-left: 1.25rem;
          padding-left: 1.25rem;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 0.5rem;
        }

        .sub-item-modern {
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          margin: 0.125rem 0;
        }

        .sidebar-footer-modern {
          padding: 1.5rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logout-btn-modern {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn-modern:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        
        .collapsed-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.6rem;
          padding: 2px 5px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(239, 68, 68, 0.4);
        }

        .badge-glow {
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          font-size: 0.7rem;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 0;
            left: -100%;
          }
        }
      `}</style>
      
      {/* Top Right Notification Icon */}
      <div 
        className="admin-top-notification"
        onClick={() => navigate('/admin/notifications')}
        title="Notifications"
        style={{
          position: 'fixed',
          top: '20px',
          right: '30px',
          zIndex: 1000,
          background: 'white',
          padding: '12px',
          borderRadius: '50%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        }}
      >
        <FaBell size={20} color="#667eea" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {unreadCount}
          </span>
        )}
      </div>
    </>
  );
};

export default AdminNavbar;
