import React, { useState, useEffect } from "react";
import {
  Container,
  NavDropdown,
  Modal,
  Button,
  Dropdown,
  Badge
} from "react-bootstrap";
import {
  FaUser,
  FaHotel,
  FaHeartbeat,
  FaCut,
  FaTaxi,
  FaCalendarAlt,
  FaHome,
  FaBuilding,
  FaBell,
  FaGift,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaIdCard,
  FaAddressCard,
  FaHeadset,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaUserShield
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchNotifications, markNotificationRead, fetchActiveOffers, fetchBookings, fetchDepartments } from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSpecialOffer, setHasSpecialOffer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ email: "", phone: "" });

  useEffect(() => {
    const checkAuth = () => {
      const loginData = localStorage.getItem("userLoginData");
      if (loginData) {
        const parsed = JSON.parse(loginData);
        setUserId(parsed.userId);

        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const user = users.find((u) => u.id === parsed.userId);

        if (user) {
          setUserName(user.name);
          setUserDetails(user);
        } else if (parsed.username) {
          setUserName(parsed.username);
          setUserDetails({ name: parsed.username, email: parsed.email || "Not available" });
        }
        setEditData({
          email: user?.email || parsed.email || "",
          phone: user?.phoneNumber || parsed.phoneNumber || ""
        });

        loadNotifications(parsed.userId);
        checkSpecialOffers(parsed.userId);
      } else {
        setUserName("");
        setUserId(null);
        setUserDetails(null);
      }
    };

    checkAuth();

    // Re-check notifications every 30 seconds if logged in
    const interval = setInterval(() => {
      const loginData = localStorage.getItem("userLoginData");
      if (loginData) {
        const parsed = JSON.parse(loginData);
        loadNotifications(parsed.userId);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        if (Array.isArray(data)) {
          const activeDepts = data.filter(d => d.status === 'Active');

          const getIcon = (name) => {
            switch (name) {
              case 'Hotel': return <FaHotel size={18} />;
              case 'Hospital': return <FaHeartbeat size={18} />;
              case 'Salon': return <FaCut size={18} />;
              case 'Cab': return <FaTaxi size={18} />;
              default: return <FaBuilding size={18} />;
            }
          };

          const dynamicDepts = activeDepts.map(d => ({
            name: d.name.charAt(0).toUpperCase() + d.name.slice(1).toLowerCase(),
            icon: getIcon(d.name),
            key: d.name
          }));

          const uniqueDepts = Array.from(new Map(dynamicDepts.map(item => [item.key, item])).values());
          setDepartments(uniqueDepts);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
      }
    };
    loadDepartments();
  }, []);

  const loadNotifications = async (id) => {
    try {
      const data = await fetchNotifications(id);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    }
  };

  const checkSpecialOffers = async (id) => {
    try {
      const offers = await fetchActiveOffers();
      const specialOffers = Array.isArray(offers) ? offers.filter(o => o.type === 'Special') : [];

      const bookings = await fetchBookings(id);
      if (!Array.isArray(bookings)) return;

      const propertyCounts = {};
      bookings.forEach(b => {
        const propId = b.propertyId || b.hotel_id || b.saloon_id || b.hospital_id || b.cab_id;
        if (propId) {
          propertyCounts[propId] = (propertyCounts[propId] || 0) + 1;
        }
      });

      const hasFrequentBooking = Object.values(propertyCounts).some(count => count >= 4);

      if (specialOffers.length > 0 || hasFrequentBooking) {
        setHasSpecialOffer(true);
      }
    } catch (error) {
      console.error("Error checking offers:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userLoginData");
    setUserName("");
    setUserId(null);
    setUserDetails(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    try {
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const updatedUsers = users.map(u => u.id === userId ? { ...u, email: editData.email, phoneNumber: editData.phone } : u);
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      const loginData = JSON.parse(localStorage.getItem("userLoginData"));
      if (loginData) {
        loginData.email = editData.email;
        loginData.phoneNumber = editData.phone;
        localStorage.setItem("userLoginData", JSON.stringify(loginData));
      }

      setUserDetails(prev => ({ ...prev, email: editData.email, phoneNumber: editData.phone }));
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDepartmentChange = (key) => {
    if (key === 'Home') {
      navigate('/user');
    } else {
      const legacyRoutes = {
        'Hotel': '/user/booking/hotel',
        'Hospital': '/user/booking/hospital',
        'Salon': '/user/booking/salon',
        'Cab': '/user/booking/cab'
      };

      if (legacyRoutes[key]) {
        navigate(legacyRoutes[key]);
      } else {
        navigate(`/user/booking/${key}`);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification read:", error);
      }
    }
  };

  const isActive = (key) => {
    if (key === "Home") return location.pathname === "/user";
    return location.pathname.includes(`/booking/${key}`) || location.pathname.includes(`/booking/${key.toLowerCase()}`);
  };

  return (
    <>
      <nav className="premium-user-navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/user")}>
            <div className="brand-icon">
              <FaBuilding size={20} />
            </div>
            <div className="brand-text">
              <h2 className="brand-title brand-logo">Geo<span className="text-gold">Bookings</span></h2>
            </div>
          </div>

          <div className="navbar-departments">
            {departments.slice(0, 4).map((dept) => (
              <motion.div
                key={dept.key}
                className={`dept-item ${isActive(dept.key) ? "active" : ""}`}
                onClick={() => handleDepartmentChange(dept.key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: 'relative' }}
              >
                <span className="dept-label">{dept.name}</span>
                {isActive(dept.key) && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="active-indicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}

            {departments.length > 4 && (
              <Dropdown className="more-dropdown">
                <Dropdown.Toggle
                  className={`dept-item more-toggle ${departments.slice(4).some(d => isActive(d.key)) ? "active" : ""}`}
                  id="more-departments-dropdown"
                >
                  <span className="dept-label">More</span>
                  <FaChevronDown size={12} style={{ marginLeft: '0.3rem' }} />
                </Dropdown.Toggle>

                <Dropdown.Menu className="more-dropdown-menu">
                  {departments.slice(4).map((dept) => (
                    <Dropdown.Item
                      key={dept.key}
                      className={`more-dept-item ${isActive(dept.key) ? "active" : ""}`}
                      onClick={() => handleDepartmentChange(dept.key)}
                    >
                      <span className="dept-label">{dept.name}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <div className="navbar-actions">
            <motion.div
              className="action-item"
              onClick={() => navigate("/user/bookings")}
              whileHover={{ scale: 1.05, color: "#FF8904" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCalendarAlt size={16} />
              <span>My Bookings</span>
            </motion.div>

            <motion.div
              className="special-offer-btn"
              onClick={() => navigate("/user/offers")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGift size={16} />
              <span>Special Offers</span>
              <div className="new-badge">NEW</div>
            </motion.div>

            {userName ? (
              <Dropdown align="end" className="user-dropdown">
                <Dropdown.Toggle as="div" className="user-profile-btn">
                  <div className="user-avatar">
                    <FaUser size={14} />
                  </div>
                  <span className="user-name">{userName}</span>
                  <FaChevronDown size={10} style={{ marginLeft: '0.3rem' }} />
                </Dropdown.Toggle>

                <Dropdown.Menu className="user-dropdown-menu">
                  <Dropdown.Item onClick={() => setShowProfileModal(true)} className="user-menu-item">
                    <FaUser size={14} />
                    <span>My Profile</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/user/membership-request")} className="user-menu-item">
                    <FaIdCard size={14} />
                    <span>Request Membership </span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/user/membership-cards")} className="user-menu-item">
                    <FaAddressCard size={14} />
                    <span>My Membership Cards</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/user/reviews")} className="user-menu-item">
                    <FaAddressCard size={14} />
                    <span>My Reviews</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/user/support")} className="user-menu-item">
                    <FaHeadset size={14} />
                    <span>Support</span>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="user-menu-item logout-item">
                    <FaSignOutAlt size={14} />
                    <span>Logout</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="action-item" onClick={() => navigate("/user-login")}>
                <div className="user-avatar">
                  <FaUser size={14} />
                </div>
                <span className="user-name">Login</span>
              </div>
            )}

            <motion.div
              className="host-reg-btn"
              onClick={() => navigate("/host-register")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBriefcase size={14} />
              <span>Register as Host</span>
            </motion.div>

            <Dropdown show={showNotifications} onToggle={(isOpen) => setShowNotifications(isOpen)} align="end">
              <Dropdown.Toggle as="div" className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="notification-dropdown glass-panel">
                <div className="dropdown-header">
                  <h6>Notifications</h6>
                  {unreadCount > 0 && <span className="unread-count">{unreadCount} new</span>}
                </div>
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <Dropdown.Item
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      >
                        <div className="notif-icon">
                          {notif.type === 'Offer' ? <FaGift /> : <FaBell />}
                        </div>
                        <div className="notif-content">
                          <p className="notif-message">{notif.message}</p>
                          <small className="notif-time">
                            {new Date(notif.created_at).toLocaleString()}
                          </small>
                        </div>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <FaBell size={30} />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mobile-menu glass-panel"
            >
              {departments.map((dept) => (
                <div
                  key={dept.key}
                  className={`mobile-dept-item ${isActive(dept.key) ? "active" : ""}`}
                  onClick={() => {
                    handleDepartmentChange(dept.key);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="dept-label">{dept.name}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Modal
        show={showProfileModal}
        onHide={() => { setShowProfileModal(false); setIsEditingProfile(false); }}
        centered
        className="elite-profile-modal"
      >
        <Modal.Body className="p-0 overflow-hidden bg-transparent border-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="elite-profile-container"
          >
            <div className="elite-profile-header">
              <div className="emerald-orb orb-1"></div>
              <div className="emerald-orb orb-2"></div>
              <button className="close-btn-elite" onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }}><FaTimes /></button>

              <div className="profile-header-content text-center pt-5 pb-4">
                <div className="elite-avatar-wrapper mx-auto mb-4">
                  <div className="avatar-shimmer"></div>
                  <FaUser size={45} className="text-gold z-2" />
                </div>
                <h2 className="fw-900 text-white mb-1 tracking-tight font-heading">
                  {userDetails?.name || "Elite Member"}
                </h2>
                <div className="badge-elite-status">AUTHORIZED USER</div>
              </div>
            </div>

            <div className="elite-profile-details p-5">
              <div className="detail-item-modern mb-4">
                <div className="icon-box"><FaEnvelope className="text-emerald" /></div>
                <div className="info flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="label">COMMUNICATION LINK</div>
                    {!isEditingProfile && (
                      <Badge
                        bg={userDetails?.email && userDetails.email !== 'Not available' ? "success" : "danger"}
                        className={`${userDetails?.email && userDetails.email !== 'Not available' ? 'bg-emerald' : 'bg-danger'} text-white border-0 py-1 px-2 smallest-badge fw-bold`}
                      >
                        {userDetails?.email && userDetails.email !== 'Not available' ? 'VERIFIED' : 'NOT LINKED'}
                      </Badge>
                    )}
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="form-control-elite mt-1"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Primary Email"
                    />
                  ) : (
                    <div className="val">{userDetails?.email || "Not Linked"}</div>
                  )}
                </div>
              </div>

              <div className="detail-item-modern mb-4">
                <div className="icon-box"><FaPhone className="text-emerald" /></div>
                <div className="info flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="label">SECURE ACCESS PHONE</div>
                    {!isEditingProfile && (
                      <Badge
                        bg={userDetails?.phoneNumber ? "success" : "warning"}
                        className={`${userDetails?.phoneNumber ? 'bg-emerald' : 'bg-warning'} text-white border-0 py-1 px-2 smallest-badge fw-bold`}
                      >
                        {userDetails?.phoneNumber ? 'VERIFIED' : 'NOT VERIFIED'}
                      </Badge>
                    )}
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="form-control-elite mt-1"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Secure Access Number"
                    />
                  ) : (
                    <div className="val">{userDetails?.phoneNumber || "Not Verified"}</div>
                  )}
                </div>
              </div>

              <div className="security-certificate mt-4 pt-4 border-top border-white border-opacity-10 text-center">
                <div className="d-flex align-items-center justify-content-center gap-2 text-gold opacity-90 fs-10 fw-bold tracking-widest uppercase mb-2">
                  <FaUserShield /> IDENTITY VERIFIED BY ELITE SYNC
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                {isEditingProfile ? (
                  <>
                    <Button
                      className="btn-elite-secondary w-50"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      CANCEL
                    </Button>
                    <Button
                      className="btn-elite-gold w-50"
                      onClick={handleProfileUpdate}
                    >
                      SAVE CHANGES
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="btn-elite-secondary w-50"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      EDIT ACCESS
                    </Button>
                    <Button
                      className="btn-elite-close w-50"
                      onClick={() => setShowProfileModal(false)}
                    >
                      CLOSE
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </Modal.Body>
      </Modal>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        .premium-user-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.8rem 0;
          background: #002C22;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 137, 4, 0.3);
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .navbar-container {
          max-width: 100%;
          margin: 0;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FF8904 0%, #ff9f2e 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #002C22;
          box-shadow: 0 4px 15px rgba(255, 137, 4, 0.4);
        }

        .brand-title {
          font-size: 1.5rem;
          margin: 0;
          line-height: 1;
          color: #FFF7ED;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .text-gold {
          color: #fbbf24;
        }

        .navbar-departments {
          display: flex;
          gap: 3.5rem;
          align-items: center;
          flex: 1;
          justify-content: center;
        }

        .dept-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          cursor: pointer;
          color: rgba(255, 247, 237, 0.7);
          font-weight: 600;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
          position: relative;
          letter-spacing: 0.3px;
        }

        .dept-item:hover {
          color: #FFF7ED;
          border-bottom-color: rgba(255, 137, 4, 0.5);
        }

        .dept-item.active {
          color: #FFF7ED;
          font-weight: 700;
          border-bottom-color: #FF8904;
        }

        .dept-icon {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .dept-label {
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dept-item:hover .dept-icon {
          transform: translateY(-2px);
        }

        .active-indicator {
          display: none;
        }

        .more-dropdown {
          display: inline-flex;
          align-items: center;
        }

        .more-dropdown .dropdown-toggle {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
          display: flex !important;
          align-items: center !important;
        }

        .more-dropdown .dropdown-toggle::after {
          display: none;
        }

        .more-dropdown .more-toggle {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .more-dropdown-menu {
          background: #002C22;
          border: 1px solid rgba(255, 137, 4, 0.3);
          border-radius: 12px;
          padding: 0.5rem;
          margin-top: 0.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .more-dept-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          color: #FFF7ED !important;
          background: transparent !important;
          transition: all 0.3s ease;
        }

        .more-dept-item:hover {
          background: rgba(255, 137, 4, 0.1) !important;
          color: #FF8904 !important;
          box-shadow: none !important;
        }

        .more-dept-item.active {
          background: #FFF7ED !important;
          color: #002C22 !important;
          font-weight: 600;
        }

        .more-dept-item .dept-icon {
          font-size: 1rem;
        }

        .navbar-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          cursor: pointer;
          color: #FFF7ED;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          white-space: nowrap;
          letter-spacing: 0.2px;
        }

        .action-item:hover {
          background: rgba(255, 137, 4, 0.1);
          color: #FF8904;
        }

        .special-offer-btn {
          white-space: nowrap;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          background: linear-gradient(90deg, #FF8904 0%, #ff9f2e 100%);
          border-radius: 12px;
          color: #002C22;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 137, 4, 0.4);
          letter-spacing: 0.3px;
        }

        .new-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #FFF7ED;
          color: #002C22;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .host-reg-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #FFF7ED;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .host-reg-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #FFF7ED;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.4rem 1rem 0.4rem 0.4rem;
          background: rgba(255, 247, 237, 0.1);
          border: 1px solid rgba(255, 137, 4, 0.3);
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #FFF7ED;
        }

        .user-profile-btn:hover {
          background: rgba(255, 137, 4, 0.2);
          border-color: #FF8904;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #FF8904;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #002C22;
        }

        .user-dropdown {
          display: inline-block;
        }

        .user-dropdown .dropdown-toggle {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .user-dropdown .dropdown-toggle::after {
          display: none;
        }

        .user-dropdown-menu {
          background: #002C22;
          border: 1px solid rgba(255, 137, 4, 0.3);
          border-radius: 12px;
          padding: 0.5rem;
          margin-top: 0.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          min-width: 180px;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          color: #FFF7ED !important;
          background: transparent !important;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .user-menu-item:hover {
          background: rgba(255, 137, 4, 0.1) !important;
          color: #FF8904 !important;
          box-shadow: none !important;
        }

        .user-menu-item.logout-item:hover {
          background: rgba(255, 77, 77, 0.1) !important;
          color: #ff4d4d !important;
        }

        .notification-bell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          color: #FFF7ED;
          transition: all 0.3s ease;
          background: rgba(255, 247, 237, 0.1);
        }

        .notification-bell:hover {
          background: rgba(255, 137, 4, 0.2);
          color: #FF8904;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff4d4d;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #002C22;
        }

        .notification-dropdown {
          width: 320px;
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 1rem;
          background: white;
          border: 1px solid #eee;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          right: 0 !important;
          left: auto !important;
        }

        .dropdown-header {
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f9f9f9;
        }

        .dropdown-header h6 {
          margin: 0;
          color: #002C22;
        }

        .notification-item {
          padding: 1rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #eee;
          color: #555;
          white-space: normal;
        }

        .notification-item:hover {
          background: #f9f9f9;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #FFF7ED;
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .navbar-departments {
            display: none;
          }
          .mobile-menu-toggle {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
          }
          .user-name, .action-item span {
            display: none;
          }
        }

        /* Profile Modal Modern - Elite Sync Theme */
        .elite-profile-modal .modal-content {
          background: transparent;
          border: none;
        }

        .elite-profile-container {
          background: #001A14;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .elite-profile-header {
          position: relative;
          background: linear-gradient(135deg, #002C22 0%, #001A14 100%);
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .emerald-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
          z-index: 0;
        }

        .orb-1 { width: 150px; height: 150px; background: #10b981; top: -50px; left: -50px; }
        .orb-2 { width: 120px; height: 120px; background: #fbbf24; bottom: -30px; right: -30px; }

        .close-btn-elite {
          position: absolute;
          top: 20px;
          right: 25px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          font-size: 1.25rem;
          z-index: 10;
          transition: 0.3s;
        }

        .close-btn-elite:hover {
          color: #fff;
          transform: rotate(90deg);
        }

        .elite-avatar-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
        }

        .avatar-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%);
          animation: shimmer 3.5s infinite linear;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }

        .badge-elite-status {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: 50px;
          color: #10b981;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 2px;
          margin-top: 15px;
        }

        .detail-item-modern .label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #fbbf24;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .detail-item-modern .val {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          word-break: break-all;
        }

        .detail-item-modern {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(255, 255, 255, 0.02);
          padding: 12px 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: 0.3s;
        }

        .detail-item-modern:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(16, 185, 129, 0.1);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .form-control-elite {
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          font-size: 0.9rem !important;
        }

        .btn-elite-gold {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%) !important;
          border: none !important;
          color: #000 !important;
          font-weight: 800 !important;
          border-radius: 12px !important;
        }

        .btn-elite-secondary {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
        }

        .btn-elite-close {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          color: #fca5a5 !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
        }

        .smallest { font-size: 0.65rem; }
        .bg-emerald { background-color: #10b981 !important; }
        .smallest-badge { font-size: 0.55rem; letter-spacing: 0.5px; }
        .text-emerald { color: #10b981 !important; }
        .text-gold { color: #fbbf24 !important; }
        .fw-900 { font-weight: 900; }
        .tracking-tight { letter-spacing: -0.5px; }
        .fs-10 { font-size: 0.65rem; }
        .italic { font-style: italic; }
      `}</style>
    </>
  );
};

export default UserNavbar;
