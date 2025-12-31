import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./Flagship.css";

const eliteServices = [
  {
    title: "Elite Stays",
    subtitle: "Luxe Properties in India",
    description: "Explore by luxury brands, themes & top picks",
    image: "/elite_hotel_room_1766570428031.png",
  },
  {
    title: "Elite Wellness",
    subtitle: "Luxe Spa & Salons",
    description: "Premium wellness with superlative experience",
    image: "/elite_spa_salon_1766570447353.png",
  },
  {
    title: "Elite Travel",
    subtitle: "Luxe International Transport",
    description: "Elite rides for a premium journey",
    image: "/elite_luxury_car_1766570466407.png",
  },
  {
    title: "Elite Healthcare",
    subtitle: "Luxe Hospital Suites",
    description: "Medical excellence in premium comfort",
    image: "/elite_hospital_suite_1766570483906.png",
  },
];

const TiltCard = ({ service, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flagship-card-wrapper"
    >
      <motion.div
        className="flagship-card"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flagship-image-wrap" style={{ transform: "translateZ(20px)" }}>
          <img src={service.image} alt={service.title} className="flagship-img" />
        </div>
        <div className="flagship-content" style={{ transform: "translateZ(10px)" }}>
          <div className="flagship-subtitle">{service.subtitle}</div>
          <div className="flagship-desc">{service.description}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function Flagship() {
  const scrollRef = useRef();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let timerId;
    let isHovered = false;

    function autoScroll() {
      if (isHovered) return;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 0.8;
      }
    }

    const handleMouseEnter = () => (isHovered = true);
    const handleMouseLeave = () => (isHovered = false);

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    timerId = setInterval(autoScroll, 16);
    container.scrollLeft = 0;

    return () => {
      clearInterval(timerId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const fullServices = [...eliteServices, ...eliteServices];

  return (
    <div className="flagship-wrapper">
      {/* Background Orbs for Glass Effect */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="flagship-orb orb-emerald"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="flagship-orb orb-gold"
      />

      <div className="flagship-intro">

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flagship-label">INTRODUCING</div>
          <h2 className="flagship-title">
            Elite Selections
          </h2>
          <div className="flagship-accent-line"></div>
        </motion.div>
      </div>
      <div className="flagship-scroll" ref={scrollRef}>
        {fullServices.map((service, idx) => (
          <TiltCard key={idx} service={service} index={idx % eliteServices.length} />
        ))}
      </div>
    </div>
  );
}

export default Flagship;

