import React from "react";
import { Card } from "react-bootstrap";
import { motion } from "framer-motion";

const BACKGROUND_IMAGE =
  "https://static.vecteezy.com/system/resources/previews/046/046/343/non_2x/wooden-deck-overlooking-ocean-free-photo.jpeg";

const BACKGROUND_VIDEO = "https://cdn.pixabay.com/video/2021/04/12/71060-538254425_large.mp4";

const AuthLayout = ({ title, children, videoSrc, posterSrc }) => {
  // If videoSrc is null, don't show the background video
  const currentVideo = videoSrc === null ? null : (videoSrc || BACKGROUND_VIDEO);
  const currentPoster = posterSrc || BACKGROUND_IMAGE;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        overflow: "hidden",
        backgroundColor: "#020617", // Deeper dark fallback
      }}
    >
      {/* BACKGROUND LAYER (VIDEO OR HD IMAGE) */}
      {currentVideo ? (
        <video
          key={currentVideo}
          autoPlay
          loop
          muted
          playsInline
          poster={currentPoster}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        >
          <source src={currentVideo} type="video/mp4" />
        </video>
      ) : (
        <img
          src={currentPoster}
          alt="Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />
      )}

      {/* ADVANCED OVERLAY - LIGHTENED FOR CLARITY */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.2) 0%, rgba(2, 6, 23, 0.6) 100%)",
          zIndex: 2,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          maxWidth: "420px",
          width: "100%",
          zIndex: 10,
          perspective: "1000px"
        }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Card
            className="shadow-2xl border-0 overflow-hidden"
            style={{
              borderRadius: "0.5rem",
              background: "rgba(255, 255, 255, 0.08)", // Translucent white
              backdropFilter: "blur(25px) saturate(180%)",
              WebkitBackdropFilter: "blur(25px) saturate(180%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              style={{
                padding: "30px 25px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Decorative Glow - Top Right (Yellow) */}
              <div
                style={{
                  position: "absolute",
                  top: "-80px",
                  right: "-80px",
                  width: "240px",
                  height: "240px",
                  background: "radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, transparent 70%)",
                  filter: "blur(60px)",
                  zIndex: -1
                }}
              />

              {/* Decorative Glow - Bottom Left (Orange) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-60px",
                  left: "-60px",
                  width: "200px",
                  height: "200px",
                  background: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
                  filter: "blur(50px)",
                  zIndex: -1
                }}
              />

              <header className="mb-5 text-center">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  style={{
                    fontWeight: "800",
                    color: "white",
                    fontSize: "1.8rem",
                    letterSpacing: "-0.03em",
                    marginBottom: "10px",
                    textShadow: "0 10px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  {title}
                </motion.h2>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "60px", opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  style={{
                    height: "4px",
                    background: "linear-gradient(90deg, #ea580c, #fbbf24)",
                    margin: "0 auto",
                    borderRadius: "20px"
                  }}
                />
              </header>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="glass-form-container" // Hook for global styles if needed
              >
                {children}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
