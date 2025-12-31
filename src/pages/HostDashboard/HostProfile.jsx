import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEdit, FaSave, FaTimes, FaIdCard, FaUserCircle, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFileAlt, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HostNavbar from "../../components/host/HostNavbar";
import { fetchHosts, updateHostProfile, fetchHostProperties } from "../../api";
import "./HostDashboard.css";

const HostProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    businessType: "",
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    revenue: "₹0",
    profileImage: null
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfileData = async () => {
      const loginData = localStorage.getItem("hostLoginData");
      if (!loginData) { navigate("/host-login"); return; }
      const parsedLoginData = JSON.parse(loginData);
      const hostId = parsedLoginData.hostId;

      try {
        const hosts = await fetchHosts();
        const host = hosts.find(h => String(h.id) === String(hostId));

        if (host) {
          const hostProperties = await fetchHostProperties(hostId);
          const totalProperties = hostProperties.length;
          const activeProperties = hostProperties.filter(p => p.status === "Active").length;
          const totalBookings = hostProperties.reduce((sum, p) => sum + (p.bookings || 0), 0);

          setProfile({
            id: host.id,
            name: host.companyName || host.company_name || "", 
            email: host.email || "",
            phone: host.phoneNumber || host.phone_number || host.phone || "",
            company: host.companyName || host.company_name || "",
            address: host.businessAddress || host.business_address || host.address || "",
            gstNumber: host.gstNumber || host.gst_number || "",
            panNumber: host.panNumber || host.pan_number || "",
            aadhaarNumber: host.aadhaarNumber || host.aadhaar_number || "",
            businessType: host.businessType || host.business_type || "",
            totalProperties,
            activeProperties,
            totalBookings,
            revenue: `₹${(totalBookings * 1000).toLocaleString()}`,
            profileImage: host.profileImage || host.profile_image || null
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data.");
      }
    };
    loadProfileData();
  }, [navigate]);

  const [editProfile, setEditProfile] = useState({ ...profile });
  useEffect(() => { setEditProfile({ ...profile }); }, [profile]);

  const handleEdit = () => { setIsEditing(true); setEditProfile({ ...profile }); };

  const handleSave = async () => {
    try {
      await updateHostProfile(profile.id, {
        companyName: editProfile.company,
        phoneNumber: editProfile.phone,
        businessAddress: editProfile.address,
        gstNumber: editProfile.gstNumber,
        panNumber: editProfile.panNumber,
        aadhaarNumber: editProfile.aadhaarNumber,
        businessType: editProfile.businessType,
        profileImage: editProfile.profileImage
      });

      const loginData = JSON.parse(localStorage.getItem("hostLoginData"));
      if (editProfile.company !== profile.company) {
          loginData.name = editProfile.company;
      }
      if (editProfile.profileImage) {
          loginData.profileImage = editProfile.profileImage;
      }
      localStorage.setItem("hostLoginData", JSON.stringify(loginData));

      setProfile({ ...editProfile });
      setIsEditing(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleCancel = () => { setIsEditing(false); setEditProfile({ ...profile }); };
  const handleChange = (e) => { setEditProfile({ ...editProfile, [e.target.name]: e.target.value }); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <>
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4">
          <header className="dashboard-header mb-4">
            <div className="header-text">
              <h1>My Profile & Business</h1>
              <p>Manage your account settings and business information.</p>
            </div>
          </header>

          <AnimatePresence>
            {showAlert && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Alert variant="success" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setShowAlert(false)} dismissible>
                  <FaCheckCircle className="me-2"/> Profile updated successfully!
                </Alert>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Row className="g-4">
            <Col lg={4}>
              <motion.div variants={itemVariants} className="modern-card p-4 text-center h-100">
                <div className="mb-4 position-relative d-inline-block">
                  <div 
                    className="avatar-circle mx-auto" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      background: profile.profileImage ? 'none' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '3rem', 
                      color: 'white', 
                      boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                      overflow: 'hidden',
                      cursor: isEditing ? 'pointer' : 'default'
                    }}
                    onClick={() => isEditing && fileInputRef.current.click()}
                  >
                    {isEditing ? (
                      editProfile.profileImage ? (
                        <img src={editProfile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="text-center">
                          <FaUserCircle size={60} />
                          <div className="smallest mt-1">Upload</div>
                        </div>
                      )
                    ) : (
                      profile.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        profile.company?.charAt(0) || <FaUser/>
                      )
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {!isEditing && (
                    <Button variant="light" size="sm" className="btn-icon position-absolute bottom-0 start-100 translate-middle shadow" onClick={handleEdit}><FaEdit/></Button>
                  )}
                </div>
                <h3 className="font-weight-bold mb-1">{profile.company || "Host Name"}</h3>
                <p className="text-muted small mb-4">{profile.businessType || "Business Owner"}</p>
                
                <div className="text-start space-y-3">
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-light">
                    <div className="icon-box-sm bg-success-light text-success"><FaEnvelope size={12}/></div>
                    <div className="smallest"><div className="text-muted">Email</div><div className="font-weight-bold text-dark">{profile.email}</div></div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-light">
                    <div className="icon-box-sm bg-primary-light text-primary"><FaPhone size={12}/></div>
                    <div className="smallest"><div className="text-muted">Phone</div><div className="font-weight-bold text-dark">{profile.phone || "N/A"}</div></div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-light">
                    <div className="icon-box-sm bg-warning-light text-warning"><FaMapMarkerAlt size={12}/></div>
                    <div className="smallest"><div className="text-muted">Address</div><div className="font-weight-bold truncate-2 text-dark" style={{ lineHeight: '1.2' }}>{profile.address || "No address set"}</div></div>
                  </div>
                </div>

                <hr className="my-4 opacity-50"/>
                
                <div className="row g-2 text-start">
                  <div className="col-6"><div className="p-3 bg-light rounded-4 text-center"><div className="fs-4 font-weight-bold text-success">{profile.totalProperties}</div><div className="smallest text-muted">Properties</div></div></div>
                  <div className="col-6"><div className="p-3 bg-light rounded-4 text-center"><div className="fs-4 font-weight-bold text-primary">{profile.totalBookings}</div><div className="smallest text-muted">Bookings</div></div></div>
                </div>
              </motion.div>
            </Col>

            <Col lg={8}>
              <motion.div variants={itemVariants} className="modern-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="font-weight-bold mb-0">Identity & Business Details</h4>
                  {isEditing ? (
                    <div className="d-flex gap-2">
                       <Button variant="light" size="sm" className="btn-modern px-3" onClick={handleCancel}><FaTimes className="me-2"/> Cancel</Button>
                       <Button variant="success" size="sm" className="btn-modern btn-primary-modern px-4" onClick={handleSave}><FaSave className="me-2"/> Save Changes</Button>
                    </div>
                  ) : (
                    <Button variant="outline-success" size="sm" className="btn-modern px-4" onClick={handleEdit}><FaEdit className="me-2"/> Edit Profile</Button>
                  )}
                </div>

                <Form className="row g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">Company Name</Form.Label>
                      {isEditing ? (
                        <Form.Control type="text" name="company" className="form-control-modern" value={editProfile.company} onChange={handleChange} />
                      ) : (
                        <div className="p-3 bg-light rounded-3 border-0 font-weight-bold"><FaBuilding className="me-2 text-success"/> {profile.company}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">Business Type</Form.Label>
                      {isEditing ? (
                        <Form.Control type="text" name="businessType" className="form-control-modern" value={editProfile.businessType} onChange={handleChange} />
                      ) : (
                        <div className="p-3 bg-light rounded-3 border-0 font-weight-bold"><FaFileAlt className="me-2 text-primary"/> {profile.businessType || "N/A"}</div>
                      )}
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">Business Address</Form.Label>
                      {isEditing ? (
                        <Form.Control as="textarea" rows={2} name="address" className="form-control-modern" value={editProfile.address} onChange={handleChange} />
                      ) : (
                        <div className="p-3 bg-light rounded-3 border-0"><FaMapMarkerAlt className="me-2 text-warning"/> {profile.address || "N/A"}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">GST Number</Form.Label>
                      {isEditing ? (
                        <Form.Control type="text" name="gstNumber" className="form-control-modern" value={editProfile.gstNumber} onChange={handleChange} />
                      ) : (
                        <div className="p-3 bg-light rounded-3 border-0 small font-weight-bold">{profile.gstNumber || "Not Linked"}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">PAN Number</Form.Label>
                      {isEditing ? (
                        <Form.Control type="text" name="panNumber" className="form-control-modern" value={editProfile.panNumber} onChange={handleChange} />
                      ) : (
                        <div className="p-3 bg-light rounded-3 border-0 small font-weight-bold">{profile.panNumber || "Not Linked"}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small font-weight-bold">Aadhaar Number <span className="text-danger">*</span></Form.Label>
                      {isEditing ? (
                        <Form.Control type="text" name="aadhaarNumber" className="form-control-modern" value={editProfile.aadhaarNumber} onChange={handleChange} isInvalid={!editProfile.aadhaarNumber}/>
                      ) : (
                        <div className={`p-3 bg-light rounded-3 border-0 small font-weight-bold ${!profile.aadhaarNumber ? 'text-danger' : ''}`}>
                          <FaIdCard className="me-2"/> {profile.aadhaarNumber || "Verification Required"}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Form>

                <div className="mt-5 pt-4 border-top">
                  <h5 className="font-weight-bold mb-4 d-flex align-items-center gap-2"><FaChartLine className="text-success"/> Performance Overview</h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="p-4 rounded-4 shadow-sm border h-100 d-flex align-items-center gap-4 hover-lift">
                        <div className="icon-box bg-success-light text-success"><FaChartLine size={24}/></div>
                        <div><div className="text-muted smallest">Annual Revenue</div><div className="fs-4 font-weight-bold text-success">{profile.revenue}</div></div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-4 rounded-4 shadow-sm border h-100 d-flex align-items-center gap-4 hover-lift">
                        <div className="icon-box bg-primary-light text-primary"><FaBuilding size={24}/></div>
                        <div><div className="text-muted smallest">Property Performance</div><div className="fs-4 font-weight-bold text-primary">{((profile.activeProperties / (profile.totalProperties || 1)) * 100).toFixed(0)}% <small className="fs-6 text-muted">Active</small></div></div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </>
  );
};

export default HostProfile;

