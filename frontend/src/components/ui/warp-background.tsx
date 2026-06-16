"use client"

import React, { HTMLAttributes, useCallback, useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number
  x: string | number
  delay: number
  duration: number
}) => {
  // Memoize random calculations on the client to avoid mismatched values across lifecycle updates
  const hue = useMemo(() => Math.floor(Math.random() * 360), [])
  const ar = useMemo(() => Math.floor(Math.random() * 10) + 1, [])

  return (
    <motion.div
      style={
        {
          left: `${x}`,
          width: `${width}`,
          aspectRatio: `1/${ar}`,
          background: `linear-gradient(to top, hsl(${hue} 80% 60%), transparent)`,
        } as React.CSSProperties
      }
      className="absolute top-0"
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

// Fixed shared grid background function with clear styling fallbacks
const gridBg = (gridColor: string, beamSize: number): React.CSSProperties => ({
  backgroundImage: `
    linear-gradient(${gridColor} 0 1px, transparent 1px ${beamSize}%),
    linear-gradient(90deg, ${gridColor} 0 1px, transparent 1px ${beamSize}%)
  `,
  backgroundSize: `${beamSize}% ${beamSize}%`,
  backgroundPosition: "50% -0.5px, 50% 50%",
})

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 150,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 4,
  gridColor = "rgba(255, 255, 255, 0.08)", // Sharp desaturated line color matching your dark theme config
  ...props
}) => {
  const [mounted, setMounted] = useState(false)

  // Block animations during the Server Pass to ensure Next.js never throws hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  const generateBeams = useCallback(() => {
    const beams = []
    const cellsPerSide = Math.floor(100 / beamSize)
    const step = cellsPerSide / beamsPerSide

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step)
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin
      beams.push({ x, delay })
    }
    return beams
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin])

  const topBeams = useMemo(() => (mounted ? generateBeams() : []), [mounted, generateBeams])
  const rightBeams = useMemo(() => (mounted ? generateBeams() : []), [mounted, generateBeams])
  const bottomBeams = useMemo(() => (mounted ? generateBeams() : []), [mounted, generateBeams])
  const leftBeams = useMemo(() => (mounted ? generateBeams() : []), [mounted, generateBeams])

  return (
    <div className={cn("relative rounded border p-20", className)} {...props}>
      {mounted && (
        <div
          style={
            {
              perspective: `${perspective}px`,
              WebkitPerspective: `${perspective}px`,
              "--grid-color": gridColor,
              "--beam-size": `${beamSize}%`,
            } as React.CSSProperties
          }
          className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden [clip-path:inset(0)] [transform-style:preserve-3d]"
        >
          {/* top side */}
          <div
            style={{
              height: "100cqmax",
              width: "100cqi",
              transformOrigin: "50% 0%",
              transform: "rotateX(-90deg)",
              ...gridBg(gridColor, beamSize),
            }}
            className="absolute z-20 [transform-style:preserve-3d]"
          >
            {topBeams.map((beam, index) => (
              <Beam
                key={`top-${index}`}
                width={`${beamSize}%`}
                x={`${beam.x * beamSize}%`}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* bottom side */}
          <div
            style={{
              height: "100cqmax",
              width: "100cqi",
              top: "100%",
              transformOrigin: "50% 0%",
              transform: "rotateX(-90deg)",
              ...gridBg(gridColor, beamSize),
            }}
            className="absolute [transform-style:preserve-3d]"
          >
            {bottomBeams.map((beam, index) => (
              <Beam
                key={`bottom-${index}`}
                width={`${beamSize}%`}
                x={`${beam.x * beamSize}%`}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* left side */}
          <div
            style={{
              top: 0,
              left: 0,
              height: "100cqmax",
              width: "100cqh",
              transformOrigin: "0% 0%",
              transform: "rotate(90deg) rotateX(-90deg)",
              ...gridBg(gridColor, beamSize),
            }}
            className="absolute [transform-style:preserve-3d]"
          >
            {leftBeams.map((beam, index) => (
              <Beam
                key={`left-${index}`}
                width={`${beamSize}%`}
                x={`${beam.x * beamSize}%`}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* right side */}
          <div
            style={{
              top: 0,
              right: 0,
              height: "100cqmax",
              width: "100cqh",
              transformOrigin: "100% 0%",
              transform: "rotate(-90deg) rotateX(-90deg)",
              ...gridBg(gridColor, beamSize),
            }}
            className="absolute [transform-style:preserve-3d]"
          >
            {rightBeams.map((beam, index) => (
              <Beam
                key={`right-${index}`}
                width={`${beamSize}%`}
                x={`${beam.x * beamSize}%`}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  )
}