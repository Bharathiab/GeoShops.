import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
} from "react-bootstrap";
import { FaPlus, FaEye, FaHistory, FaThLarge, FaCalendar, FaHome, FaCar, FaHeartbeat, FaCut, FaChartPie, FaArrowRight, FaChartLine } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import HostCreateProperty from "../../components/host/HostCreateProperty";
import HostSubscriptionDetails from "../../components/host/HostSubscriptionDetails";
import SubscriptionGate from "../../components/host/SubscriptionGate";
import { fetchHostProperties, fetchHostBookings } from "../../api";
import "./HostDashboard.css";

const HostDashboard = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const loginData = localStorage.getItem("hostLoginData");
      if (!loginData) return;

      const parsedLoginData = JSON.parse(loginData);
      const hostId = parsedLoginData.hostId;

      try {
        const hostProperties = await fetchHostProperties(hostId);
        setProperties(hostProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      }

      try {
        const hostBookings = await fetchHostBookings(hostId);
        const mappedBookings = hostBookings.map(b => ({
          ...b,
          status: b.status || 'Pending'
        }));
        setBookings(mappedBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      }
    };

    loadData();
  }, []);

  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => {
      const price = Number(b.finalPrice) || Number(b.totalPrice) || Number(b.estimatedPrice) || 0;
      return sum + price;
    }, 0);

  const stats = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: <FaThLarge />,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Active Properties",
      value: properties.filter((p) => p.status === "Active").length,
      icon: <FaEye />,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: <FaCalendar />,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: <FaChartLine />,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
  ];

  const departments = [
    { name: "Hotel", icon: <FaHome />, color: "#3b82f6" },
    { name: "Cab", icon: <FaCar />, color: "#10b981" },
    { name: "Hospital", icon: <FaHeartbeat />, color: "#8b5cf6" },
    { name: "Salon", icon: <FaCut />, color: "#ec4899" },
  ];

  const pieChartData = departments
    .map((dept) => ({
      name: dept.name,
      value: bookings.filter((b) => b.department?.toLowerCase() === dept.name.toLowerCase()).length,
      color: dept.color,
    }))
    .filter((item) => item.value > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <HostNavbar />
      <SubscriptionGate>
        <div className="host-main-content">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="host-dashboard-wrapper"
          >
            <header className="dashboard-header mb-4">
              <div className="header-text">
                <h1>Overview</h1>
                <p>Welcome back! Here's what's happening today.</p>
              </div>
              <Button
                className="btn-modern btn-primary-modern"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="me-2" /> Add Property
              </Button>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid-modern">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="modern-card stat-card-modern"
                >
                  <div 
                    className="stat-icon-box"
                    style={{ backgroundColor: stat.bgColor, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="stat-details">
                    <span className="stat-label-modern">{stat.title}</span>
                    <span className="stat-value-modern">{stat.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Subscription Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <HostSubscriptionDetails />
            </motion.div>

            <Row>
              {/* Chart Section */}
              <Col lg={7} className="mb-4">
                <motion.div variants={itemVariants} className="modern-card h-100">
                  <div className="card-header-modern">
                    <h5 className="mb-0">Bookings by Department</h5>
                    <FaHistory className="text-secondary" />
                  </div>
                  <div className="p-4">
                    {pieChartData.length > 0 ? (
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                              }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5">
                        <FaChartLine size={48} className="mb-3 opacity-20" />
                        <p>No booking data available yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Col>

              {/* Department Cards */}
              <Col lg={5} className="mb-4">
                <motion.div variants={itemVariants} className="modern-card h-100">
                  <div className="card-header-modern">
                    <h5 className="mb-0">Departments</h5>
                    <FaChartPie className="text-secondary" />
                  </div>
                  <div className="p-4">
                    <div className="d-grid gap-3">
                      {departments.map((dept) => {
                        const count = properties.filter(p => p.department?.toLowerCase() === dept.name.toLowerCase()).length;
                        return (
                          <div 
                            key={dept.name}
                            className="dept-row-modern p-3 rounded-lg border d-flex align-items-center justify-content-between"
                            style={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              backgroundColor: '#f8fafc'
                            }}
                            onClick={() => navigate("/host/properties", { state: { selectedDepartment: dept.name } })}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div 
                                className="icon-circle shadow-sm"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: 'white', 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: dept.color
                                }}
                              >
                                {dept.icon}
                              </div>
                              <div>
                                <h6 className="mb-0 font-weight-bold">{dept.name}</h6>
                                <small className="text-muted">{count} Properties</small>
                              </div>
                            </div>
                            <FaArrowRight className="text-muted opacity-50" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </div>

        {/* Create Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          size="lg"
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="font-weight-bold">Add New Property</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <HostCreateProperty onSubmit={() => {
              setShowCreateModal(false);
              // Refresh logic could go here
            }} />
          </Modal.Body>
        </Modal>
      </SubscriptionGate>
    </>
  );
};

export default HostDashboard;

