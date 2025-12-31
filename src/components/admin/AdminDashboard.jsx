import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import {
  FaHotel,
  FaUsers,
  FaUserTie,
  FaChartLine,
  FaEye,
  FaFileAlt,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaMapMarkerAlt
} from "react-icons/fa";
import { Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from "chart.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import AdminNavbar from "./AdminNavbar";
import Toast from "../../utils/toast";
import { fetchAllBookings, fetchHosts, fetchHostProperties, fetchDashboardStats, fetchDepartments, createDepartment, updateDepartmentStatus, fetchUsers, fetchAllSubscriptionPayments } from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboardModern.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const AdminDashboard = () => {
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddHostModal, setShowAddHostModal] = useState(false);
  const [newHost, setNewHost] = useState({
    company: "",
    owner: "",
    phone: "",
    email: "",
    location: "",
    description: "",
    gstNumber: "",
    department: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [hosts, setHosts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [savedBookings, setSavedBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [selectedDepartmentToday, setSelectedDepartmentToday] = useState("All");
  const [departmentTitles, setDepartmentTitles] = useState({
    Hotel: "Hotel Bookings",
    Cab: "Cab Bookings",
    Hospital: "Hospital Bookings",
    Salon: "Salon Bookings",
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalBookings: 0,
    totalProperties: 0
  });

  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ 
    name: "", 
    description: "", 
    features: "", 
    iconName: "", 
    gradient: "", 
    status: "Active" 
  });
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState('all');

  const getIconForDept = (name) => {
    switch (name) {
      case 'Hotel': return <FaHotel />;
      case 'Cab': return <FaUserTie />;
      case 'Hospital': return <FaUsers />;
      case 'Salon': return <FaChartLine />;
      default: return <FaCog />;
    }
  };

  const getColorForDept = (name) => {
    switch (name) {
      case 'Hotel': return "#007bff";
      case 'Cab': return "#28a745";
      case 'Hospital': return "#6f42c1";
      case 'Salon': return "#fd7e14";
      default: return "#6c757d";
    }
  };

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch departments
        const deptsData = await fetchDepartments();
        const mappedDepts = deptsData.map(d => ({
          ...d,
          icon: getIconForDept(d.name),
          color: getColorForDept(d.name)
        }));
        setDepartments(mappedDepts);

        // Fetch dashboard statistics
        const statsData = await fetchDashboardStats();
        setStats(statsData);

        // Fetch all hosts
        const hostsData = await fetchHosts();
        console.log('🔍 DEBUG: Hosts data:', hostsData);
        console.log('🔍 DEBUG: First host:', hostsData[0]);
        setHosts(hostsData);

        // Fetch all bookings
        const bookingsData = await fetchAllBookings();

        // Fetch all users to map user names
        let usersMap = {};
        try {
          const usersData = await fetchUsers();
          usersData.forEach(user => {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User';
            usersMap[user.id] = userName;
          });
        } catch (error) {
          console.error('Error fetching users for mapping:', error);
        }

        // Fetch all properties from all hosts
        let allProperties = [];
        for (const host of hostsData) {
          try {
            const hostProps = await fetchHostProperties(host.id);
            // Backend already returns camelCase, no mapping needed
            allProperties = [...allProperties, ...hostProps];
          } catch (err) {
            console.error(`Error fetching properties for host ${host.id}:`, err);
          }
        }
        setProperties(allProperties);

        // Fetch subscription payments
        try {
            const payments = await fetchAllSubscriptionPayments();
            setSubscriptionPayments(payments);
        } catch (error) {
            console.error("Error fetching subscription payments:", error);
        }

        // Create properties map for quick lookup
        const propertiesMap = {};
        allProperties.forEach(prop => {
          propertiesMap[prop.id] = prop.company || prop.name || 'Unknown Property';
        });

        // Map API fields to frontend fields with user and property names
        const mappedBookings = bookingsData.map(b => {
          // The backend uses a unified propertyId field for all departments
          const propertyId = b.propertyId || b.property_id;
          const userId = b.userId || b.user_id;

          console.log('🔍 Booking mapping:', {
            bookingId: b.id,
            userId: userId,
            propertyId: propertyId,
            userName: usersMap[userId],
            propertyName: propertiesMap[propertyId],
            propertyType: b.propertyType || b.property_type
          });

          return {
            ...b,
            id: b.id,
            userId: userId,
            propertyId: propertyId,
            userName: usersMap[userId] || 'N/A',
            propertyName: propertiesMap[propertyId] || 'N/A',
            department: b.propertyType || b.property_type || 'Unknown',
            checkInDate: b.checkInDate || b.check_in_date,
            checkOutDate: b.checkOutDate || b.check_out_date,
            appointmentDate: b.appointmentDate || b.appointment_date,
            appointmentTime: b.appointmentTime,
            pickUpLocation: b.pickupLocation || b.pickup_location,
            dropOffLocation: b.dropoffLocation || b.dropoff_location,
            bookingDate: b.createdAt || b.created_at ? new Date(b.createdAt || b.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: b.status || 'Pending'
          };
        });

        console.log('📊 Users Map:', usersMap);
        console.log('🏢 Properties Map:', propertiesMap);
        console.log('✅ Mapped Bookings Sample:', mappedBookings[0]);

        setSavedBookings(mappedBookings);

        // Generate recent activities
        const newActivities = [];

        // Add user activities (limit to last 3)
        try {
          const usersData = await fetchUsers();
          console.log('📊 Users fetched:', usersData.length, 'users');
          usersData.slice(0, 3).forEach((user, index) => {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User';
            console.log('👤 Adding user activity:', userName);
            newActivities.push({
              id: `user-${user.id}`,
              type: "user",
              message: (
                <span>
                  <strong>New user registered:</strong> "{userName}" joined the platform
                </span>
              ),
              timestamp: new Date(user.createdAt || user.created_at || Date.now() - index * 3600000),
            });
          });
        } catch (error) {
          console.error('❌ Error fetching users:', error);
        }

        // Add host activities (limit to last 3)
        hostsData.slice(0, 3).forEach((host, index) => {
          console.log('🏢 Adding host activity:', host.companyName || host.company_name);
          newActivities.push({
            id: `host-${host.id}`,
            type: "host",
            message: (
              <span>
                <strong>New host registered:</strong> "{host.companyName || host.company_name || 'Unknown'}" joined the
                platform
              </span>
            ),
            timestamp: new Date(host.createdAt || host.created_at || Date.now() - index * 3600000),
          });
        });

        // Add booking activities (limit to last 5)
        mappedBookings.slice(0, 5).forEach((booking, index) => {
          console.log('📅 Adding booking activity:', booking.userName, '->', booking.propertyName);
          newActivities.push({
            id: `booking-${booking.id}`,
            type: "booking",
            message: (
              <span>
                <strong>Booking confirmed:</strong> User "{booking.userName || booking.user_name || 'Unknown User'}"
                booked "{booking.propertyName || booking.property_name || 'Unknown Property'}"
              </span>
            ),
            timestamp: new Date(booking.created_at || Date.now() - index * 7200000),
          });
        });

        // Sort by timestamp descending and take top 8
        newActivities.sort((a, b) => b.timestamp - a.timestamp);
        console.log('✅ Total activities:', newActivities.length);
        setActivities(newActivities.slice(0, 8));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadData();

    // Reload data every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter today's bookings in useEffect
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const filteredTodayBookings = savedBookings.filter(
      (booking) => booking.bookingDate === today
    );
    setTodayBookings(filteredTodayBookings);
  }, [savedBookings]);

  const statsCards = [
    {
      title: "Total Departments",
      value: 4,
      icon: <FaHotel size={40} />,
      color: "#007bff",
      bgColor: "#e7f3ff",
    },
    {
      title: "Total Hosts",
      value: stats.totalHosts,
      icon: <FaUserTie size={40} />,
      color: "#28a745",
      bgColor: "#e8f5e8",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers size={40} />,
      color: "#6f42c1",
      bgColor: "#f3e8ff",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <FaChartLine size={40} />,
      color: "#fd7e14",
      bgColor: "#fff3cd",
    },
  ];

  // Departments are now fetched from API




  const handleViewBookings = () => {
    setShowBookingsModal(true);
  };

  const handleAddHost = () => {
    setShowAddHostModal(true);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleSystemSettings = () => {
    setShowSettingsModal(true);
  };

  const handleAddHostSubmit = () => {
    // Handle adding new host
    Toast.success(`Host added to ${newHost.department} department!`);
    setShowAddHostModal(false);
    setNewHost({
      company: "",
      owner: "",
      phone: "",
      email: "",
      location: "",
      description: "",
      gstNumber: "",
      department: "",
    });
  };

  const handleAddDepartment = async () => {
    try {
      await createDepartment(newDepartment);
      // Refresh departments
      const deptsData = await fetchDepartments();
      const mappedDepts = deptsData.map(d => ({
        ...d,
        icon: getIconForDept(d.name),
        color: getColorForDept(d.name)
      }));
      setDepartments(mappedDepts);
      setNewDepartment({ 
        name: "", 
        description: "", 
        features: "", 
        iconName: "", 
        gradient: "", 
        status: "Active" 
      });
      setShowAddDepartmentForm(false);
      Toast.success("Department created successfully!");
    } catch (error) {
      console.error("Error creating department:", error);
      Toast.error("Failed to create department.");
    }
  };

  const handleToggleDepartmentStatus = async (dept) => {
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDepartmentStatus(dept.id, newStatus);
      // Update local state
      setDepartments(departments.map(d => d.id === dept.id ? { ...d, status: newStatus } : d));
    } catch (error) {
      console.error("Error updating department status:", error);
      Toast.error("Failed to update status.");
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };

  const generatePDF = (reportData, title) => {
    try {
      console.log("Generating PDF for:", title);
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      let lastY = 35;

      // Helper to safely convert row values to strings
      const safeRow = (row) => Object.values(row).map(val => 
        (val === null || val === undefined) ? "" : String(val)
      );

      // Check if we have any data
      const hasData = Object.values(reportData).some(data => data && data.length > 0);

      if (!hasData) {
        doc.text("No bookings, hosts or properties found for this report.", 14, lastY + 10);
        doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
        return;
      }

      // 1. Bookings Table
      if (reportData.bookings && reportData.bookings.length > 0) {
        console.log("Processing Bookings table...");
        doc.setFontSize(14);
        doc.text(`Bookings (${reportData.bookings.length})`, 14, lastY + 10);
        
        const tableColumn = Object.keys(reportData.bookings[0]);
        const tableRows = reportData.bookings.map(row => safeRow(row));

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: lastY + 15,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          theme: 'grid',
        });
        
        // Robust lastY update
        lastY = (doc.lastAutoTable && doc.lastAutoTable.finalY) 
          ? doc.lastAutoTable.finalY + 15 
          : (lastY + 15 + (reportData.bookings.length * 10)); 
      } else {
        doc.setFontSize(14);
        doc.text("Bookings: No records found", 14, lastY + 10);
        lastY += 20;
      }

      // 2. Hosts Table
      if (reportData.hosts && reportData.hosts.length > 0) {
        console.log("Processing Hosts table...");
        
        // Check for page break
        if (lastY > 250) { doc.addPage(); lastY = 20; }

        doc.setFontSize(14);
        doc.text(`Hosts (${reportData.hosts.length})`, 14, lastY + 10);

        const tableColumn = Object.keys(reportData.hosts[0]);
        const tableRows = reportData.hosts.map(row => safeRow(row));

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: lastY + 15,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          theme: 'grid'
        });
        
        lastY = (doc.lastAutoTable && doc.lastAutoTable.finalY) 
          ? doc.lastAutoTable.finalY + 15 
          : (lastY + 15 + (reportData.hosts.length * 10));
      }

      // 3. Properties Table
      if (reportData.properties && reportData.properties.length > 0) {
        console.log("Processing Properties table...");

        if (lastY > 250) { doc.addPage(); lastY = 20; }
        
        doc.setFontSize(14);
        doc.text(`Properties (${reportData.properties.length})`, 14, lastY + 10);

        const tableColumn = Object.keys(reportData.properties[0]);
        const tableRows = reportData.properties.map(row => safeRow(row));

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: lastY + 15,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [211, 84, 0] },
          theme: 'grid'
        });
      }

      console.log("Saving PDF...");
      doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
      Toast.success("Report generated successfully!");

    } catch (error) {
      console.error("CRITICAL Error generating PDF:", error);
      Toast.error("Failed to generate report. Details logged to console.");
    }
  };

  // Helper to safely format price
  const formatDisplayPrice = (val) => {
    if (val === null || val === undefined) return "N/A";
    // Debug raw value
    console.log("Formatting price:", val);
    // Strict check: only allow digits and dot
    if (!/^\d+(\.\d+)?$/.test(String(val))) {
        // Try parsing only if it looks somewhat numeric
        const num = parseFloat(val);
        if (!isNaN(num) && isFinite(num)) {
            return `₹${num}`;
        }
        return "N/A";
    }
    return `₹${val}`;
  };

  const handleGenerateDepartmentReport = (deptName) => {
    console.log("Preparing report for:", deptName);
    try {
      // 1. Filter Bookings
      const bookingData = savedBookings
        .filter((booking) => {
          const prop = properties.find((p) => p.id === booking.propertyId);
          return prop && prop.department === deptName;
        })
        .map((booking) => {
          const prop = properties.find((p) => p.id === booking.propertyId);
          return {
            "User": String(booking.userName || "Unknown"),
            "Service": String(booking.propertyName || "Unknown"),
            "Date": String(booking.bookingDate || "N/A"),
            "Date/Time": String(deptName === "Hotel" ? (booking.checkInDate || "N/A") : (booking.appointmentDate || "N/A")), // Combined/Renamed column
            "Status": String(booking.status || "Unknown"),
          };
        });

      // 2. Filter Hosts
      const hostData = hosts
        .filter(h => {
           // Check if host has properties in this department
           const hostProps = properties.filter(p => (p.host_id === h.id || p.hostId === h.id) && p.department === deptName);
           return hostProps.length > 0;
        })
        .map(h => ({
          "Company": String(h.companyName || h.company || "N/A"),
          "Type": String(h.businessType || "N/A"),
          "Email": String(h.email || "N/A"),
          "Phone": String(h.phoneNumber || h.phone || "N/A"),
          "City": String(h.businessAddress || h.address || h.location || "").split(',')[0] || "N/A"
        }));

      // 3. Filter Properties
      const propertyData = properties
        .filter(p => p.department === deptName)
        .map(p => ({
          "Name": String(p.name || p.company || "Unknown"),
          "Location": String(p.location || p.address || "Unknown").substring(0, 20),
          "Price (INR)": formatDisplayPrice(p.price),
          "Rating": String(p.rating || "N/A")
        }));

      const reportData = {
        bookings: bookingData,
        hosts: hostData,
        properties: propertyData
      };

      generatePDF(reportData, `${deptName} Department Report`);
    } catch (error) {
       console.error("Error preparing department report:", error);
       Toast.error("Error preparing report data.");
    }
  };

  const handleGenerateAllReports = () => {
    console.log("Preparing all reports...");
    try {
      // 1. All Bookings
      const bookingData = savedBookings.map((booking) => {
        const prop = properties.find((p) => p.id === booking.propertyId);
        return {
          "User": String(booking.userName || "Unknown"),
          "Service": String(booking.propertyName || "Unknown"),
          "Dept": String(prop ? prop.department : "Unknown"),
          "Date": String(booking.bookingDate || "N/A"),
          "Status": String(booking.status || "Unknown"),
        };
      });

      // 2. All Hosts
      const hostData = hosts.map(h => ({
          "Company": String(h.companyName || h.company || "N/A"),
          "Type": String(h.businessType || "N/A"),
          "Email": String(h.email || "N/A"),
          "Phone": String(h.phoneNumber || h.phone || "N/A"),
          "City": String(h.businessAddress || h.address || h.location || "").split(',')[0] || "N/A"
      }));

      // 3. All Properties
      const propertyData = properties.map(p => ({
          "Name": String(p.name || p.company || "Unknown"),
          "Dept": String(p.department || "Unknown"),
          "Location": String(p.location || p.address || "Unknown").substring(0, 20),
          "Price (INR)": formatDisplayPrice(p.price)
      }));

      const reportData = {
        bookings: bookingData,
        hosts: hostData,
        properties: propertyData
      };

      generatePDF(reportData, "Green_Platform_Full_Report");
    } catch (error) {
       console.error("Error preparing all reports:", error);
       Toast.error("Error preparing full report data.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="dashboard-container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="mb-4">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="dashboard-title h2 mb-1">Admin Dashboard</h1>
                    <p className="text-muted mb-0">
                      Overview of your platform's performance
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="light" className="modern-card px-3 shadow-sm">
                      <FaCalendarAlt className="me-2 text-primary" /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Stats Cards */}
            {/* Stats Cards */}
            <Row className="mb-4">
              {statsCards.map((stat, index) => {
                const borderClasses = ['border-top-indigo', 'border-top-green', 'border-top-purple', 'border-top-orange'];
                const textClasses = ['text-primary', 'text-success', 'text-info', 'text-warning'];
                
                return (
                  <Col key={index} md={6} lg={3} className="mb-4 mb-lg-0">
                    <motion.div 
                      variants={itemVariants} 
                      className="h-100"
                      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(79, 70, 229, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`modern-card h-100 ${borderClasses[index % 4]}`}
                      >
                        <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                          <div>
                            <p className="stat-label mb-1">{stat.title}</p>
                            <h3 className="stat-value mb-0">
                              {stat.value}
                            </h3>
                          </div>
                          <div className={`stat-icon-wrapper ${textClasses[index % 4]} bg-opacity-10`} style={{background: 'var(--bg-body)'}}>
                            {/* Override icon color with utility class or inline style if needed, but wrapper color handles it mostly */}
                            {React.cloneElement(stat.icon, { size: 24, className: '' })}
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>

            {/* Charts Section */}
            <Row className="mb-4">
              {/* Most Booked Departments */}
              <Col md={12} lg={6} className="mb-4 mb-lg-0">
                <motion.div variants={itemVariants} className="h-100">
                  <Card className="modern-card h-100">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Department Bookings</h5>
                    </Card.Header>
                    <Card.Body>
                      {(() => {
                        const departmentBookings = departments.map((dept) => {
                          const deptBookings = savedBookings.filter((b) => {
                            const prop = properties.find((p) => p.id === b.propertyId);
                            return prop && prop.department === dept.name;
                          });
                          return {
                            name: dept.name,
                            value: deptBookings.length,
                          };
                        }).filter(item => item.value > 0);

                        const totalBookings = departmentBookings.reduce((sum, dept) => sum + dept.value, 0);
                        
                        // Vibrant Professional Palette
                        const chartColors = [
                          '#4f46e5', // Indigo
                          '#10b981', // Emerald
                          '#f59e0b', // Amber
                          '#ec4899', // Pink
                        ];

                        return departmentBookings.length > 0 ? (
                          <div className="d-flex flex-column h-100">
                            <div className="chart-container flex-grow-1" style={{ position: 'relative', height: '260px' }}>
                              <Doughnut
                                data={{
                                  labels: departmentBookings.map(d => d.name),
                                  datasets: [{
                                    data: departmentBookings.map(d => d.value),
                                    backgroundColor: chartColors,
                                    borderColor: '#ffffff',
                                    borderWidth: 2,
                                    hoverOffset: 4
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  cutout: '75%',
                                  plugins: {
                                    legend: {
                                      position: 'right',
                                      labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        pointStyle: 'circle',
                                        font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
                                        color: '#64748b'
                                      }
                                    },
                                    tooltip: {
                                      backgroundColor: '#0f172a',
                                      titleColor: '#f8fafc',
                                      bodyColor: '#f8fafc',
                                      padding: 12,
                                      cornerRadius: 4,
                                      displayColors: false,
                                      callbacks: {
                                        label: function (context) {
                                          const label = context.label || '';
                                          const value = context.parsed || 0;
                                          const percentage = ((value / totalBookings) * 100).toFixed(1);
                                          return `${label}: ${value} (${percentage}%)`;
                                        }
                                      }
                                    }
                                  }
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '40%', // Adjust for right-aligned legend
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                pointerEvents: 'none'
                              }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', lineHeight: 1 }}>{totalBookings}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted py-5">
                            <FaChartLine size={32} className="mb-3 opacity-25" />
                            <p className="small">No booking data available</p>
                          </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>


              {/* Revenue Trends */}
              <Col md={12} lg={6}>
                <motion.div variants={itemVariants} className="h-100">
                  <Card className="modern-card h-100">
                    <Card.Header className="card-header-modern bg-transparent border-0 pb-0">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                        <h5 className="mb-0">Revenue Analytics</h5>
                        <div className="d-flex gap-2">
                          <Form.Select
                            size="sm"
                            className="border shadow-none"
                            style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#e2e8f0' }}
                            value={revenueFilter}
                            onChange={(e) => setRevenueFilter(e.target.value)}
                          >
                            <option value="all">All Time</option>
                            <option value="thisMonth">This Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last 1 Year</option>
                          </Form.Select>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {(() => {
                        const filterBookingsByDate = (bookings) => {
                          if (revenueFilter === 'all') return bookings;

                          const now = new Date();
                          let startDate, endDate = now;

                          if (revenueFilter === 'thisMonth') {
                            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                          } else if (revenueFilter === '3months') {
                            startDate = new Date(now);
                            startDate.setMonth(now.getMonth() - 3);
                          } else if (revenueFilter === '6months') {
                            startDate = new Date(now);
                            startDate.setMonth(now.getMonth() - 6);
                          } else if (revenueFilter === '1year') {
                            startDate = new Date(now);
                            startDate.setFullYear(now.getFullYear() - 1);
                          } else if (revenueFilter.startsWith('year-')) {
                            const year = parseInt(revenueFilter.split('-')[1]);
                            startDate = new Date(year, 0, 1);
                            endDate = new Date(year, 11, 31, 23, 59, 59);
                          }

                          return bookings.filter(b => {
                            const bookingDate = new Date(b.created_at || b.bookingDate);
                            return bookingDate >= startDate && bookingDate <= endDate;
                          });
                        };

                        const filteredBookings = filterBookingsByDate(savedBookings.filter(b => b.status === 'Completed'));

                        // Calculate revenue by host over time (Top 3 only for cleaner graph)
                        const hostRevenue = hosts.map(host => {
                          const hostProperties = properties.filter(p => p.host_id === host.id || p.hostId === host.id);
                          const hostBookings = filteredBookings.filter(b => {
                            return hostProperties.some(p => p.id === b.propertyId);
                          });

                          const revenue = hostBookings.reduce((sum, b) => {
                            return sum + (parseFloat(b.final_price || b.total_price || b.estimated_price) || 0);
                          }, 0);

                          const hostName = host.companyName || host.company_name || host.company || host.name || host.owner || `Host #${host.id}`;

                          return {
                            hostId: host.id,
                            hostName: hostName,
                            revenue: revenue,
                            properties: hostProperties
                          };
                        }).filter(h => h.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

                        if (hostRevenue.length === 0) {
                          return (
                            <div className="text-center text-muted py-5">
                              <FaChartLine size={32} className="mb-3 opacity-25" />
                              <p className="small">No revenue data available</p>
                            </div>
                          );
                        }

                        const dateMap = new Map();
                        filteredBookings.forEach(b => {
                          const date = new Date(b.created_at || b.bookingDate).toISOString().split('T')[0];
                          if (!dateMap.has(date)) dateMap.set(date, []);
                          dateMap.get(date).push(b);
                        });

                        const sortedDates = Array.from(dateMap.keys()).sort();
                        
                        // Vibrant Line Chart Colors
                        const colors = ['#4f46e5', '#10b981', '#f59e0b']; // Indigo, Green, Amber

                        const datasets = hostRevenue.map((host, index) => {
                          const data = sortedDates.map(date => {
                            const dayBookings = dateMap.get(date).filter(b => host.properties.some(p => p.id === b.propertyId));
                            return dayBookings.reduce((sum, b) => sum + (parseFloat(b.final_price || b.total_price || b.estimated_price) || 0), 0);
                          });

                          let cumulative = 0;
                          const cumulativeData = data.map(val => cumulative += val);

                          return {
                            label: host.hostName,
                            data: cumulativeData,
                            borderColor: colors[index % colors.length],
                            backgroundColor: (context) => {
                              const ctx = context.chart.ctx;
                              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                              gradient.addColorStop(0, `${colors[index % colors.length]}80`); // 50% opacity at top
                              gradient.addColorStop(0.5, `${colors[index % colors.length]}20`); // 12% opacity mid
                              gradient.addColorStop(1, `${colors[index % colors.length]}00`); // 0% opacity bottom
                              return gradient;
                            },
                            borderWidth: 3,
                            tension: 0.45, // Smoother wave
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointHitRadius: 20,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: colors[index % colors.length],
                            pointBorderWidth: 2
                          };
                        });

                        const totalRevenue = hostRevenue.reduce((sum, h) => sum + h.revenue, 0);

                        return (
                          <>
                            <div className="mb-4">
                              <h2 className="mb-0 text-dark fw-bold">
                                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </h2>
                              <small className="text-muted fw-medium">Total Revenue Period</small>
                            </div>
                            <div style={{ height: '240px' }}>
                              <Line
                                data={{
                                  labels: sortedDates.map(date => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
                                  datasets: datasets
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  interaction: { mode: 'index', intersect: false },
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                      backgroundColor: '#0f172a',
                                      titleColor: '#f8fafc',
                                      bodyColor: '#f8fafc',
                                      padding: 12,
                                      cornerRadius: 8,
                                      displayColors: true,
                                      boxWidth: 8,
                                      boxHeight: 8,
                                      usePointStyle: true,
                                      callbacks: {
                                        label: function(context) {
                                          let label = context.dataset.label || '';
                                          if (label) {
                                              label += ': ';
                                          }
                                          if (context.parsed.y !== null) {
                                              label += '₹' + context.parsed.y.toLocaleString('en-IN');
                                          }
                                          return label;
                                        }
                                      }
                                    }
                                  },
                                  scales: {
                                    y: {
                                      grid: { display: true, borderDash: [4, 4], color: '#f1f5f9', drawBorder: false },
                                      ticks: { 
                                        maxTicksLimit: 5,
                                        callback: (val) => '₹' + val.toLocaleString('en-IN', { notation: 'compact' }), 
                                        font: { size: 11, family: 'Inter', weight: 500 }, 
                                        color: '#64748b',
                                        padding: 10
                                      },
                                      border: { display: false }
                                    },
                                    x: {
                                      grid: { display: false },
                                      ticks: { maxRotation: 0, font: { size: 11, family: 'Inter' }, color: '#64748b' },
                                      border: { display: false }
                                    }
                                  }
                                }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Subscription Revenue Charts */}
            <Row className="mb-4">
              {/* Monthly Revenue Chart */}
              <Col md={12} lg={8} className="mb-4 mb-lg-0">
                <motion.div variants={itemVariants} className="h-100">
                  <Card className="modern-card h-100">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Monthly Subscription Revenue</h5>
                    </Card.Header>
                    <Card.Body>
                      {(() => {
                         const processRevenueData = () => {
                           const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                           const currentYear = new Date().getFullYear();
                           const data = new Array(12).fill(0);

                           subscriptionPayments
                             .filter(p => p.status === 'Approved' && p.approvedAt)
                             .forEach(p => {
                               const date = new Date(p.approvedAt);
                               if (date.getFullYear() === currentYear) {
                                 data[date.getMonth()] += (p.amount || 0);
                               }
                             });
                           return { labels: months, data };
                         };

                         const { labels, data } = processRevenueData();
                         const totalRevenue = data.reduce((a, b) => a + b, 0);

                         return (
                           <div className="d-flex flex-column h-100">
                             <div style={{ height: '300px' }}>
                               <Line
                                 data={{
                                   labels,
                                   datasets: [{
                                     label: 'Revenue (₹)',
                                     data,
                                     borderColor: '#10b981',
                                     backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                     fill: true,
                                     tension: 0.4,
                                     pointRadius: 4,
                                     pointHoverRadius: 6
                                   }]
                                 }}
                                 options={{
                                   responsive: true,
                                   maintainAspectRatio: false,
                                   plugins: {
                                     legend: { display: false },
                                     tooltip: {
                                       mode: 'index',
                                       intersect: false,
                                       backgroundColor: '#0f172a',
                                       titleColor: '#f8fafc',
                                       bodyColor: '#f8fafc',
                                       callbacks: {
                                          label: function(context) {
                                              return `Revenue: ₹${context.parsed.y}`;
                                          }
                                       }
                                     }
                                   },
                                   scales: {
                                     y: {
                                       beginAtZero: true,
                                       grid: { color: '#f1f5f9' },
                                       ticks: { callback: (value) => '₹' + value }
                                     },
                                     x: {
                                       grid: { display: false }
                                     }
                                   }
                                 }}
                               />
                             </div>
                             <div className="mt-3 text-center">
                               <h4 className="fw-bold text-success mb-0">₹{totalRevenue.toLocaleString()}</h4>
                               <small className="text-muted">Total Current Year Revenue</small>
                             </div>
                           </div>
                         );
                      })()}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>

              {/* Subscription Plans Distribution */}
              <Col md={12} lg={4}>
                <motion.div variants={itemVariants} className="h-100">
                  <Card className="modern-card h-100">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Subscription Plans</h5>
                    </Card.Header>
                    <Card.Body>
                      {(() => {
                        const planCounts = {};
                        subscriptionPayments
                          .filter(p => p.status === 'Approved' && p.planType)
                          .forEach(p => {
                            let type = p.planType || "Unknown";
                            if (type.includes("Business Booster") || type.toLowerCase().includes("pro")) type = "Pro";
                            else if (type.includes("Starter Growth") || type.toLowerCase().includes("basic")) type = "Basic";
                            else if (type.toLowerCase().includes("elite")) type = "Elite";
                            
                            planCounts[type] = (planCounts[type] || 0) + 1;
                          });
                        
                        const labels = Object.keys(planCounts);
                        const data = Object.values(planCounts);
                        const total = data.reduce((a, b) => a + b, 0);

                        const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

                        return total > 0 ? (
                          <div className="h-100 d-flex flex-column justify-content-center" style={{ minHeight: '350px' }}>
                              <div style={{ height: '320px', position: 'relative' }}>
                                <Pie
                                  data={{
                                    labels,
                                    datasets: [{
                                      data,
                                      backgroundColor: chartColors,
                                      borderColor: '#ffffff',
                                      borderWidth: 2
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { 
                                          position: 'bottom',
                                          labels: { usePointStyle: true, padding: 20 }
                                      },
                                      datalabels: { // Note: datalabels plugin needs to be registered if used, but standard chartjs tooltip is fine
                                          display: true,
                                          color: '#fff'
                                      }
                                    }
                                  }}
                                />
                              </div>
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            <p>No active subscriptions found</p>
                          </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Top Properties Section - Cleaned Up */}
            <Row className="mb-4">
              <Col>
                <motion.div variants={itemVariants}>
                  <h5 className="mb-3 fw-bold text-dark">Top Properties</h5>
                </motion.div>
                <Row>
                  {(() => {
                    if (!properties || properties.length === 0) {
                      return (
                        <Col>
                          <div className="text-center text-muted py-5">
                            <p className="mb-0">No properties data found.</p>
                          </div>
                        </Col>
                      );
                    }

                    const propertyBookings = properties.map((prop) => {
                      const propBookings = savedBookings.filter((b) => b.propertyId == prop.id);
                      return {
                        ...prop,
                        bookingCount: propBookings.length,
                        rating: parseFloat(prop.rating) || 0
                      };
                    });

                    const topProperties = propertyBookings
                      .sort((a, b) => b.bookingCount - a.bookingCount)
                      .slice(0, 4);

                    return topProperties.length > 0 ? topProperties.map((prop, idx) => (
                      <Col md={6} lg={3} key={prop.id} className="mb-4">
                        {/* Removed motion.div to rule out animation issues */}
                        <div className="h-100">
                          <Card className="modern-card h-100 border overflow-hidden">
                            <div style={{ position: 'relative', height: '140px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                              {/* Simple Image Placeholder or Actual Image */}
                              <Card.Img
                                variant="top"
                                src={prop.imageUrl || prop.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                              />
                              <div className="position-absolute top-0 end-0 m-2">
                                <span className={`badge rounded-pill ${
                                  prop.department === 'Hotel' ? 'bg-primary' :
                                  prop.department === 'Cab' ? 'bg-success' :
                                  prop.department === 'Hospital' ? 'bg-info' : 'bg-warning'
                                } text-white border-0 shadow-sm`}>
                                  {prop.department}
                                </span>
                              </div>
                            </div>
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Card.Title className="mb-0 text-truncate fw-bold w-100 pe-2 text-dark" style={{fontSize: '1.1rem'}} title={prop.company || prop.name}>{prop.company || prop.name}</Card.Title>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                  <div className="text-secondary small fw-medium">Bookings</div>
                                  <div className="fw-bold fs-5 text-dark">{prop.bookingCount}</div>
                                </div>
                                <div className="text-end">
                                  <div className="text-secondary small fw-medium">Rating</div>
                                  <div className="d-flex align-items-center justify-content-end text-warning">
                                    <span className="fw-bold me-1 text-dark">{(prop.rating || 0).toFixed(1)}</span>
                                    <small className="text-warning">★</small>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      </Col>
                    )) : (
                      <Col>
                        <div className="text-center text-muted py-5">
                          <p>No properties available to display</p>
                        </div>
                      </Col>
                    );
                  })()}
                </Row>
              </Col>
            </Row>

            <Row className="mb-4">

              {/* Recent Activity (Now First, Larger) */}
              <Col md={12} lg={8} className="mb-4 mb-lg-0">
                <motion.div variants={itemVariants} className="h-100">
                  <Card className="modern-card h-100">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Recent Activity</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {activities.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {activities.map((activity) => (
                            <div key={activity.id} className="list-group-item activity-item-modern border-bottom-0">
                              <div className="d-flex align-items-start gap-3">
                                {/* Simple Icon Indicator */}
                                <div className="mt-1 activity-icon-box" style={{
                                  backgroundColor: activity.type === 'host' ? '#dcfce7' : activity.type === 'user' ? '#e0e7ff' : '#ffedd5',
                                  color: activity.type === 'host' ? '#166534' : activity.type === 'user' ? '#4338ca' : '#9a3412'
                                }}>
                                  {activity.type === 'host' ? <FaUserTie size={16} /> :
                                   activity.type === 'user' ? <FaUsers size={16} /> :
                                   <FaCheckCircle size={16} />}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="mb-1 text-dark" style={{fontSize: '0.9rem'}}>{activity.message}</div>
                                  <small className="text-muted d-flex align-items-center" style={{fontSize: '0.75rem'}}>
                                    {activity.timestamp.toLocaleString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <p>No recent activity</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>

              {/* Quick Actions (Now Second, Smaller, Auto-Height) */}
              <Col md={12} lg={4}>
                <motion.div variants={itemVariants}>
                  <Card className="modern-card">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Quick Actions</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-3">
                        <Button
                          className="btn-vibrant-primary py-2 w-100 d-flex align-items-center justify-content-center"
                          onClick={handleViewBookings}
                        >
                          <FaEye className="me-2" /> View All Bookings
                        </Button>
                        <Button
                          variant="outline-dark"
                          className="py-2 w-100 d-flex align-items-center justify-content-center btn-outline-dark"
                          style={{ background: 'transparent' }}
                          onClick={handleGenerateReport}
                        >
                          <FaFileAlt className="me-2" /> Generate Report
                        </Button>
                        <Button
                          variant="outline-dark"
                          className="py-2 w-100 d-flex align-items-center justify-content-center btn-outline-dark"
                          style={{ background: 'transparent' }}
                          onClick={handleSystemSettings}
                        >
                          <FaCog className="me-2" /> System Settings
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Today's Bookings Section - Professional Table */}
            <Row className="mt-4 mb-5">
              <Col>
                <motion.div variants={itemVariants}>
                  <Card className="modern-card shadow-sm border">
                    <Card.Header className="card-header-modern">
                      <h5 className="mb-0">Today's Bookings</h5>
                      <Form.Select
                        size="sm"
                        style={{ width: "200px" }}
                        className="border shadow-none"
                        value={selectedDepartmentToday}
                        onChange={(e) => setSelectedDepartmentToday(e.target.value)}
                      >
                        <option value="All">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept.name} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {todayBookings.length > 0 ? (
                        <div className="table-responsive">
                          <Table className="modern-table mb-0" hover>
                            <thead>
                              <tr>
                                <th className="ps-4">#</th>
                                <th>User</th>
                                <th>Service</th>
                                <th>Dept</th>
                                <th>Details</th>
                                <th>Time</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {todayBookings
                                .filter((booking) => {
                                  if (selectedDepartmentToday === "All") return true;
                                  const prop = properties.find(
                                    (p) => p.id === booking.propertyId
                                  );
                                  return (
                                    prop &&
                                    prop.department === selectedDepartmentToday
                                  );
                                })
                                .map((booking, index) => {
                                  const prop = properties.find(
                                    (p) => p.id === booking.propertyId
                                  );
                                  const department = prop
                                    ? prop.department
                                    : "Unknown";
                                  return (
                                    <tr key={booking.id}>
                                      <td className="ps-4 fw-medium text-muted">{index + 1}</td>
                                      <td>
                                        <div className="fw-medium text-dark">
                                          {booking.userName}
                                        </div>
                                      </td>
                                      <td>{booking.propertyName}</td>
                                      <td>
                                        <span className="badge bg-light text-dark border fw-normal">
                                          {department}
                                        </span>
                                      </td>
                                      <td>
                                        <small className="text-muted d-block" style={{maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                          {department === "Cab" ? `Pickup: ${booking.pickUpLocation || 'N/A'}` :
                                           department === "Hospital" ? `Reason: ${booking.reason || 'N/A'}` :
                                           department === "Salon" ? `Desc: ${booking.description || 'N/A'}` :
                                           "Standard Booking"}
                                        </small>
                                      </td>
                                      <td>
                                        <div className="text-secondary small">
                                          <FaCalendarAlt className="me-1 text-muted" />
                                           {department === "Hotel" ? (booking.checkInDate || "N/A") : (booking.appointmentDate || "N/A")}
                                        </div>
                                      </td>
                                      <td>
                                        <span
                                          className={`status-badge ${
                                            booking.status === "Confirmed" ? "success" :
                                            booking.status === "Pending" ? "warning" :
                                            booking.status === "Completed" ? "default" :
                                            "danger"
                                          }`}
                                        >
                                          {booking.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <FaCalendarAlt size={32} className="mb-2 opacity-25" />
                          <p>No bookings for today.</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

          </motion.div>
      </div>

      {/* All Bookings Modal */}
      <Modal
        show={showBookingsModal}
        onHide={() => setShowBookingsModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>View All Bookings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            {departments.map((dept) => (
              <Col key={dept.name} md={3} className="mb-3">
                <Card
                  className={`department-card ${selectedDepartment === dept.name ? "selected" : ""
                    }`}
                  onClick={() => setSelectedDepartment(dept.name)}
                  style={{
                    cursor: "pointer",
                    border:
                      selectedDepartment === dept.name
                        ? `2px solid ${dept.color}`
                        : "1px solid #dee2e6",
                  }}
                >
                  <Card.Body className="text-center">
                    <div
                      style={{
                        color: dept.color,
                        fontSize: "2rem",
                        marginBottom: "10px",
                      }}
                    >
                      {dept.icon}
                    </div>
                    <h6>{dept.name}</h6>
                    <small className="text-muted">
                      {
                        savedBookings.filter((b) => {
                          const prop = properties.find(
                            (p) => p.id === b.propertyId
                          );
                          return prop && prop.department === dept.name;
                        }).length
                      }{" "}
                      bookings
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {selectedDepartment && (
            <div>
              <h5 className="mb-3">{departmentTitles[selectedDepartment]}</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>User Name</th>
                    <th>Service/Hotel</th>
                    <th>Booking Date</th>
                    {selectedDepartment === "Hotel" && (
                      <>
                        <th>Check-in Date</th>
                        <th>Check-out Date</th>
                      </>
                    )}
                    {selectedDepartment === "Cab" && (
                      <>
                        <th>Pick-up Location</th>
                        <th>Drop-off Location</th>
                      </>
                    )}
                    {(selectedDepartment === "Hospital" ||
                      selectedDepartment === "Salon") && (
                        <>
                          <th>Appointment Date</th>
                          <th>Appointment Time</th>
                        </>
                      )}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedBookings
                    .filter((booking) => {
                      const prop = properties.find(
                        (p) => p.id === booking.propertyId
                      );
                      // Match by property department
                      return prop && prop.department === selectedDepartment;
                    })
                    .map((booking, index) => (
                      <tr key={booking.id}>
                        <td>{index + 1}</td>
                        <td>{booking.userName}</td>
                        <td>{booking.propertyName}</td>
                        <td>{booking.bookingDate}</td>
                        {selectedDepartment === "Hotel" && (
                          <>
                            <td>{booking.checkInDate || "N/A"}</td>
                            <td>{booking.checkOutDate || "N/A"}</td>
                          </>
                        )}
                        {selectedDepartment === "Cab" && (
                          <>
                            <td>{booking.pickUpLocation || "N/A"}</td>
                            <td>{booking.dropOffLocation || "N/A"}</td>
                            <td>{booking.hours || "N/A"}</td>
                          </>
                        )}
                        {(selectedDepartment === "Hospital" ||
                          selectedDepartment === "Salon") && (
                            <>
                              <td>{booking.appointmentDate || "N/A"}</td>
                              <td>{booking.appointmentTime || "N/A"}</td>
                            </>
                          )}
                        {selectedDepartment === "Hospital" && (
                          <td>{booking.reason || "N/A"}</td>
                        )}
                        {selectedDepartment === "Salon" && (
                          <td>{booking.description || "N/A"}</td>
                        )}
                        <td>
                          <span
                            className={`badge ${booking.status === "Confirmed"
                              ? "bg-success"
                              : booking.status === "Pending"
                                ? "bg-warning"
                                : "bg-secondary"
                              }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                          >
                            View
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Add New Host Modal */}
      <Modal
        show={showAddHostModal}
        onHide={() => setShowAddHostModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Host</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            {departments.map((dept) => (
              <Col key={dept.name} md={3} className="mb-3">
                <Card
                  className={`department-card ${newHost.department === dept.name ? "selected" : ""
                    }`}
                  onClick={() =>
                    setNewHost({ ...newHost, department: dept.name })
                  }
                  style={{
                    cursor: "pointer",
                    border:
                      newHost.department === dept.name
                        ? `2px solid ${dept.color}`
                        : "1px solid #dee2e6",
                  }}
                >
                  <Card.Body className="text-center">
                    <div
                      style={{
                        color: dept.color,
                        fontSize: "2rem",
                        marginBottom: "10px",
                      }}
                    >
                      {dept.icon}
                    </div>
                    <h6>{dept.name}</h6>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {newHost.department && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newHost.company}
                      onChange={(e) =>
                        setNewHost({ ...newHost, company: e.target.value })
                      }
                      placeholder="Enter company name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Owner Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newHost.owner}
                      onChange={(e) =>
                        setNewHost({ ...newHost, owner: e.target.value })
                      }
                      placeholder="Enter owner name"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={newHost.phone}
                      onChange={(e) =>
                        setNewHost({ ...newHost, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={newHost.email}
                      onChange={(e) =>
                        setNewHost({ ...newHost, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={newHost.location}
                      onChange={(e) =>
                        setNewHost({ ...newHost, location: e.target.value })
                      }
                      placeholder="Enter location"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>GST Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={newHost.gstNumber}
                      onChange={(e) =>
                        setNewHost({ ...newHost, gstNumber: e.target.value })
                      }
                      placeholder="Enter GST number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newHost.description}
                  onChange={(e) =>
                    setNewHost({ ...newHost, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control type="file" />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddHostModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleAddHostSubmit}
            disabled={!newHost.department}
          >
            Add Host
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Generate Live Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {departments.map((dept) => {
              // Calculate real-time stats
              const deptBookings = savedBookings.filter(b => {
                const prop = properties.find(p => p.id === b.propertyId);
                return prop && prop.department === dept.name;
              });
              const bookingCount = deptBookings.length;

              // Count hosts
              const deptHosts = hosts.filter(h => {
                const hostProps = properties.filter(p => (p.host_id === h.id || p.hostId === h.id) && p.department === dept.name);
                return hostProps.length > 0;
              });
              const hostCount = deptHosts.length;

              // Count users
              const userIds = new Set();
              deptBookings.forEach(b => {
                if (b.userId) userIds.add(b.userId);
              });
              const userCount = userIds.size;

              return (
                <Col key={dept.name} md={6} className="mb-3">
                  <Card
                    className="report-card"
                    style={{ border: `1px solid ${dept.color}` }}
                  >
                    <Card.Body className="text-center">
                      <div
                        style={{
                          color: dept.color,
                          fontSize: "2rem",
                          marginBottom: "10px",
                        }}
                      >
                        {dept.icon}
                      </div>
                      <h6>{dept.name} Department</h6>
                      <div className="mt-3">
                        <p className="mb-1">
                          <strong>Bookings:</strong>{" "}
                          {bookingCount}
                        </p>
                        <p className="mb-1">
                          <strong>Hosts:</strong>{" "}
                          {hostCount}
                        </p>
                        <p className="mb-1">
                          <strong>Users:</strong>{" "}
                          {userCount}
                        </p>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleGenerateDepartmentReport(dept.name)}
                      >
                        Generate {dept.name} Report
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleGenerateAllReports}>
            Generate All Reports
          </Button>
        </Modal.Footer>
      </Modal>

      {/* System Settings Modal */}
      <Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>System Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3">Host Management</h5>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" size="sm" onClick={() => setShowAddDepartmentForm(!showAddDepartmentForm)}>
              {showAddDepartmentForm ? "Cancel" : "Add Department"}
            </Button>
          </div>

          {showAddDepartmentForm && (
            <Card className="mb-4 p-3 bg-light">
              <h6>Add New Department</h6>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="e.g. Hotel, Hospital, etc."
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    placeholder="Enter short description"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Features (Comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDepartment.features}
                    onChange={(e) => setNewDepartment({ ...newDepartment, features: e.target.value })}
                    placeholder="e.g. AC Rooms, Non-AC Rooms, WiFi"
                  />
                </Form.Group>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Icon Name (from FontAwesome)</Form.Label>
                      <Form.Control
                        type="text"
                        value={newDepartment.iconName}
                        onChange={(e) => setNewDepartment({ ...newDepartment, iconName: e.target.value })}
                        placeholder="e.g. FaHotel, FaCar, FaCut"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Gradient (CSS)</Form.Label>
                      <Form.Control
                        type="text"
                        value={newDepartment.gradient}
                        onChange={(e) => setNewDepartment({ ...newDepartment, gradient: e.target.value })}
                        placeholder="linear-gradient(...)"
                      />
                    </Form.Group>
                  </div>
                </div>
                <Button variant="success" size="sm" className="mt-2 w-100" onClick={handleAddDepartment}>Save Department</Button>
              </Form>
            </Card>
          )}

          <Row className="mb-4">
            {departments.map((dept) => (
              <Col key={dept.name} md={3} className="mb-3">
                <Card className="settings-card">
                  <Card.Body className="text-center">
                    <div
                      style={{
                        color: dept.color,
                        fontSize: "2rem",
                        marginBottom: "10px",
                      }}
                    >
                      {dept.icon}
                    </div>
                    <h6>{dept.name}</h6>
                    <div className="mt-2">
                      <Form.Check
                        type="switch"
                        id={`switch-${dept.id}`}
                        label={dept.status}
                        checked={dept.status === 'Active'}
                        onChange={() => handleToggleDepartmentStatus(dept)}
                        className="d-inline-block"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h5 className="mb-3">User Management</h5>
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>User Registration</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Allow new user registrations"
                      defaultChecked
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Verification</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Require email verification"
                      defaultChecked
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Booking Limits</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Max bookings per user"
                      defaultValue="5"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notification Settings</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Send booking notifications"
                      defaultChecked
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSettingsModal(false)}
          >
            Close
          </Button>
          <Button variant="primary">Save Settings</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminDashboard;
