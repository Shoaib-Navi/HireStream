// GlobeBackground.jsx
// ── Tilted wireframe globe — drop anywhere, position via props ───────────────
// Usage:
//   <GlobeBackground position="center" />
//   <GlobeBackground position="north-east" size={600} opacity={0.4} />
//   <GlobeBackground position="north-west" size={500} color="#6a38c2" />

import React, { useEffect, useRef } from "react";

const GlobeBackground = ({
  position = "center",   // "center" | "north-east" | "north-west"
  size     = 520,        // diameter of globe in px
  opacity  = 0.35,       // line opacity
  color    = "#ffffff",  // line color
  tiltX    = 22,         // degrees tilt on X axis
  tiltY    = -18,        // degrees tilt on Y axis
  latLines = 10,         // number of latitude lines
  lngLines = 18,         // number of longitude lines
}) => {
  const canvasRef = useRef(null);

  // Position styles
  const positionStyle = {
    center: {
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
    },
    "north-east": {
      top: "-20%", right: "-20%",
      transform: "none",
    },
    "north-west": {
      top: "-20%", left: "-20%",
      transform: "none",
    },
  }[position] || {};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = size;
    canvas.width  = S;
    canvas.height = S;
    const R = S * 0.46;
    const cx = S / 2;
    const cy = S / 2;

    const txRad = (tiltX * Math.PI) / 180;
    const tyRad = (tiltY * Math.PI) / 180;

    // 3D point → 2D with tilt
    function project(lat, lng) {
      const phi   = (lat  * Math.PI) / 180;
      const theta = (lng  * Math.PI) / 180;

      let x = R * Math.cos(phi) * Math.cos(theta);
      let y = R * Math.sin(phi);
      let z = R * Math.cos(phi) * Math.sin(theta);

      // Tilt X
      const y1 = y * Math.cos(txRad) - z * Math.sin(txRad);
      const z1 = y * Math.sin(txRad) + z * Math.cos(txRad);

      // Tilt Y
      const x2 = x * Math.cos(tyRad) + z1 * Math.sin(tyRad);
      const z2 = -x * Math.sin(tyRad) + z1 * Math.cos(tyRad);

      return {
        sx: cx + x2,
        sy: cy - y1,
        z:  z2,
      };
    }

    ctx.clearRect(0, 0, S, S);

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color.startsWith("#") ? color : "#ffffff");

    const SEGMENTS = 80;

    // Draw latitude lines
    for (let i = 0; i <= latLines; i++) {
      const lat = -90 + (180 / latLines) * i;
      const points = [];
      for (let j = 0; j <= SEGMENTS; j++) {
        const lng = -180 + (360 / SEGMENTS) * j;
        points.push(project(lat, lng));
      }

      // Split visible/hidden
      let drawing = false;
      for (let j = 0; j < points.length; j++) {
        const p = points[j];
        const alpha = p.z >= 0 ? opacity : opacity * 0.15;
        if (!drawing) {
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          drawing = true;
        }
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 0.8;
        if (j > 0) {
          const prev = points[j - 1];
          const prevAlpha = prev.z >= 0 ? opacity : opacity * 0.15;
          if (Math.abs(alpha - prevAlpha) > 0.01) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
          } else {
            ctx.lineTo(p.sx, p.sy);
          }
        }
      }
      ctx.stroke();
    }

    // Draw longitude lines
    for (let i = 0; i < lngLines; i++) {
      const lng = -180 + (360 / lngLines) * i;
      const points = [];
      for (let j = 0; j <= SEGMENTS; j++) {
        const lat = -90 + (180 / SEGMENTS) * j;
        points.push(project(lat, lng));
      }

      for (let j = 1; j < points.length; j++) {
        const p    = points[j];
        const prev = points[j - 1];
        const alpha = p.z >= 0 ? opacity : opacity * 0.15;
        ctx.beginPath();
        ctx.moveTo(prev.sx, prev.sy);
        ctx.lineTo(p.sx, p.sy);
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw dots at intersections (sparse)
    for (let i = 0; i <= latLines; i++) {
      for (let j = 0; j < lngLines; j++) {
        const lat = -90 + (180 / latLines) * i;
        const lng = -180 + (360 / lngLines) * j;
        const p = project(lat, lng);
        if (p.z >= 0 && Math.random() < 0.06) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${opacity * 1.8})`;
          ctx.fill();
        }
      }
    }
  }, [size, opacity, color, tiltX, tiltY, latLines, lngLines]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        width:         size,
        height:        size,
        pointerEvents: "none",
        ...positionStyle,
      }}
    />
  );
};

export default GlobeBackground;