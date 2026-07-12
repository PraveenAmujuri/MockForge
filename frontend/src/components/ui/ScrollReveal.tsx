"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  baseScale?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  containerClassName?: string;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = false,
  baseRotation = 0,
  baseScale = 1,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  direction = "up",
  className = "",
  containerClassName = ""
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: 25 };
      case "down":
        return { y: -25 };
      case "left":
        return { x: 25 };
      case "right":
        return { x: -25 };
      default:
        return {};
    }
  };

  const initialStyles = {
    opacity: baseOpacity,
    filter: enableBlur ? "blur(4px)" : "none",
    ...getDirectionOffset()
  };

  const animateStyles = isInView
    ? {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0
      }
    : initialStyles;

  const finalClassName = className || containerClassName || "";

  return (
    <div ref={ref} className={finalClassName}>
      <motion.div
        initial={initialStyles}
        animate={animateStyles}
        style={{
          transformOrigin: "center center",
          rotate: isInView ? 0 : baseRotation,
          scale: isInView ? 1 : baseScale
        }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
