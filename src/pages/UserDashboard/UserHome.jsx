import React, { useState, useCallback } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FaSearch, FaHotel, FaHeartbeat, FaCut, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";

import UserNavbar from "../../components/user/UserNavbar";
import OffersSection from "./OffersSection";
import Flagship from "./Flagship";
import Getitnow from "./Getitnow";
import Footer from "./Footer";

const UserHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: ["#FFF7ED", "#FF8904", "#34d399"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 4, random: true },
      links: { enable: true, distance: 150, color: "#FFF7ED", opacity: 0.15, width: 1 },
      move: { enable: true, speed: 1, direction: "none", outModes: "out" },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "bubble" } },
      modes: { bubble: { distance: 200, size: 8, duration: 2, opacity: 0.8 } },
    },
  };

  const cardColors = [
    { bg: "#002C22", border: "#FF8904", iconBg: "rgba(255, 137, 4, 0.2)", iconBorder: "#FF8904" },
    { bg: "#FFF7ED", border: "#002C22", iconBg: "rgba(0, 44, 34, 0.1)", iconBorder: "#002C22" },
    { bg: "#FF8904", border: "#FFF7ED", iconBg: "rgba(255, 247, 237, 0.3)", iconBorder: "#FFF7ED" },
    { bg: "#002C22", border: "#FFF7ED", iconBg: "rgba(255, 247, 237, 0.2)", iconBorder: "#FFF7ED" },
  ];

  const departments = [
    { name: "Hotels", icon: <FaHotel size={40} />, gradient: "linear-gradient(to top, rgba(0,44,34,0.8), transparent)" },
    { name: "Hospitals", icon: <FaHeartbeat size={40} />, gradient: "linear-gradient(to top, rgba(255,137,4,0.6), transparent)" },
    { name: "Salons", icon: <FaCut size={40} />, gradient: "linear-gradient(to top, rgba(0,44,34,0.7), transparent)" },
    { name: "Cabs", icon: <FaCar size={40} />, gradient: "linear-gradient(to top, rgba(255,247,237,0.5), transparent)" },
  ];

  const images = [
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWx8ZW58MHx8MHx8fDA%3D",
    "https://media.gettyimages.com/id/1452316636/photo/paramedics-taking-patient-on-stretcher-from-ambulance-to-hospital.jpg?s=612x612&w=0&k=20&c=4oJ_99AB6LfPR0BjMxVRbdnRaDohEUvt8nUG-HPBJOo=",
    "https://media.istockphoto.com/id/1702829520/photo/beige-salon-interior-with-chairs-in-row-and-cosmetics-on-shelf-window.webp?a=1&b=1&s=612x612&w=0&k=20&c=YJC8oLaaKudd4WgfuZZNi5u7O2M1Wb8PS7_nI7KL4Fs=",
    "https://plus.unsplash.com/premium_photo-1729018715734-ae43c1fb56de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRheGl8ZW58MHx8MHx8fDA%3D",
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2020/04/21/36607-413283453_large.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 44, 34, 0.7)",
        zIndex: 1,
      }} />

      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      />

      <div style={{ position: "relative", zIndex: 10 }}>
        <UserNavbar />

        <Container className="text-center" style={{ paddingTop: "35px" }}>
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <h1 className="display-3 fw-bold mb-2">
              <span style={{
                background: "linear-gradient(90deg, #FFF7ED, #FF8904, #FFF7ED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "2px",
                textShadow: "0 0 40px rgba(255, 137, 4, 0.6)"
              }}>
                Experience Luxury
              </span>
            </h1>
            <p className="fs-5 text-white opacity-90 mb-5">One platform • Infinite possibilities.</p>
          </motion.div>


          <Row className="g-4 justify-content-center">
            {departments.map((dept, i) => (
              <Col key={i} xs={10} sm={6} md={4} lg={3}>
                <motion.div initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15, duration: 0.8 }} viewport={{ once: true }}>
                  <Card className="h-100 border-0 overflow-hidden position-relative"
                    style={{
                      borderRadius: "24px",
                      background: cardColors[i].bg,
                      backdropFilter: "blur(16px)",
                      border: `2px solid ${cardColors[i].border}`,
                      transition: "all 0.5s ease",
                      cursor: "pointer",
                      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                      e.currentTarget.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 35px ${cardColors[i].border}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
                    }}
                    onClick={() => navigate("/user/booking-selection")}
                  >
                    <div style={{ height: "180px", position: "relative" }}>
                      <Card.Img src={images[i]} style={{ height: "100%", objectFit: "cover", filter: "brightness(0.8) contrast(110%)" }} />
                      <div style={{ position: "absolute", inset: 0, background: dept.gradient }} />
                    </div>
                    <Card.Body className="text-center py-4">
                      <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "70px",
                          height: "70px",
                          background: cardColors[i].iconBg,
                          backdropFilter: "blur(10px)",
                          border: `2px solid ${cardColors[i].iconBorder}`,
                          color: i === 1 ? "#002C22" : (i === 2 ? "#FFF7ED" : "#FF8904"),
                        }}>
                        {dept.icon}
                      </div>
                      <h5 className="fw-bold fs-4 tracking-wide" style={{
                        color: i === 1 ? "#002C22" : "#FFF7ED"
                      }}>{dept.name}</h5>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="my-5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="px-5 py-3 rounded-pill fw-bold"
                style={{
                  background: "linear-gradient(45deg, #FF8904, #ff9f2e, #FF8904)",
                  color: "#002C22",
                  border: "2px solid #FFF7ED",
                  boxShadow: "0 0 35px rgba(255, 137, 4, 0.6)",
                  fontSize: "1.1rem",
                }}
                onClick={() => navigate("/user/booking-selection")}
              >
                Explore All Services
              </Button>
            </motion.div>
          </div>
        </Container>

        <OffersSection />
        
        <Flagship />
        <Getitnow />
        <Footer />
      </div>
    </div>
  );
};

export default UserHome;