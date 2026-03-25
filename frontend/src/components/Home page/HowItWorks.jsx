// HowItWorks.jsx

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserCircle2, Search, Trophy, Zap } from "lucide-react";

// ── Mobile step cards (shown on small screens) ────────────────────────────────
const steps = [
  {
    step: "01",
    icon: UserCircle2,
    title: "Create Your Profile",
    sub: "2 min setup",
    desc: "Sign up and build your profile with your skills, experience, and career goals.",
    color: "text-[#6a38c2] bg-purple-50 border-purple-100",
    dot: "#6a38c2",
  },
  {
    step: "02",
    icon: Search,
    title: "Discover & Apply",
    sub: "One click",
    desc: "Browse thousands of curated listings filtered for your profile. Apply instantly.",
    color: "text-[#f83002] bg-red-50 border-red-100",
    dot: "#f83002",
  },
  {
    step: "03",
    icon: Zap,
    title: "HireStream Matches You",
    sub: "AI-powered",
    desc: "Our smart matching connects your profile to the most relevant open roles.",
    color: "text-[#6a38c2] bg-purple-50 border-purple-100",
    dot: "#6a38c2",
  },
  {
    step: "04",
    icon: Trophy,
    title: "Land the Offer",
    sub: "Avg. 12 days",
    desc: "Get shortlisted, attend interviews, and receive offers — all tracked on your dashboard.",
    color: "text-green-600 bg-green-50 border-green-100",
    dot: "#16a34a",
  },
];

// ── Canvas diagram (shown on md+ screens) ────────────────────────────────────
const CanvasDiagram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const W  = () => canvas.width;
    const H  = () => canvas.height;
    const BX = () => Math.max(44, Math.min(54, W() * 0.075));

    const left   = () => ({ x: W() * 0.16, y: H() * 0.38 });
    const center = () => ({ x: W() * 0.50, y: H() * 0.38 });
    const right  = () => ({ x: W() * 0.84, y: H() * 0.38 });
    const bottom = () => ({ x: W() * 0.50, y: H() * 0.75 });

    function drawBox(x, y, label, sub, active = false) {
      const b = BX(), r = 14;
      ctx.beginPath();
      ctx.roundRect(x - b/2, y - b/2, b, b, r);
      ctx.fillStyle = active ? "#1e1428" : "#1a1a26";
      ctx.fill();
      ctx.strokeStyle = active ? "#6a38c2" : "#2e2e40";
      ctx.lineWidth = active ? 2 : 1.5;
      ctx.stroke();
      if (active) {
        ctx.beginPath();
        ctx.roundRect(x - b/2, y - b/2, b, b, r);
        ctx.strokeStyle = `rgba(106,56,194,${0.15 + 0.1 * Math.sin(t * 0.05)})`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }
      const fs = Math.max(9, Math.min(12, W() * 0.016));
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${fs}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + b/2 + fs + 4);
      ctx.fillStyle = active ? "#6a38c2" : "#555";
      ctx.font = `${fs - 1}px sans-serif`;
      ctx.fillText(sub, x, y + b/2 + fs * 2 + 6);
    }

    function drawWire(x1, y1, x2, y2) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#2e2e40"; ctx.lineWidth = 2;
      ctx.setLineDash([]); ctx.stroke();
    }

    function drawFlow(x1, y1, x2, y2, offset) {
      const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
      ctx.save(); ctx.translate(x1, y1); ctx.rotate(Math.atan2(dy, dx));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0);
      ctx.strokeStyle = "#6a38c2"; ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 48]);
      ctx.lineDashOffset = -((t * 1.2 + offset) % 60);
      ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
    }

    function drawIcon(x, y, type) {
      const b = BX(), s = b * 0.24;
      ctx.strokeStyle = "#6a38c2"; ctx.fillStyle = "#6a38c2";
      ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (type === "person") {
        ctx.beginPath(); ctx.arc(x, y - s, s * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - s*1.2, y + s*1.1);
        ctx.quadraticCurveTo(x - s*1.2, y + s*0.2, x, y + s*0.2);
        ctx.quadraticCurveTo(x + s*1.2, y + s*0.2, x + s*1.2, y + s*1.1);
        ctx.fill();
      } else if (type === "bolt") {
        ctx.beginPath();
        ctx.moveTo(x+s*0.4,y-s*1.2); ctx.lineTo(x-s*0.5,y+s*0.2);
        ctx.lineTo(x+s*0.2,y+s*0.2); ctx.lineTo(x-s*0.4,y+s*1.2);
        ctx.lineTo(x+s*0.7,y-s*0.2); ctx.lineTo(x,y-s*0.2);
        ctx.closePath(); ctx.fill();
      } else if (type === "search") {
        ctx.beginPath(); ctx.arc(x-s*0.3, y-s*0.3, s*0.85, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+s*0.3,y+s*0.3); ctx.lineTo(x+s*1.1,y+s*1.1); ctx.stroke();
      } else if (type === "trophy") {
        ctx.strokeRect(x-s,y-s*1.2,s*2,s*1.5);
        ctx.fillRect(x-s*0.5,y+s*0.3,s,s*0.4);
        ctx.fillRect(x-s*0.75,y+s*0.7,s*1.5,s*0.4);
        ctx.beginPath();
        ctx.moveTo(x-s*0.4,y-s*0.5); ctx.lineTo(x,y+s*0.1); ctx.lineTo(x+s*0.4,y-s*0.5);
        ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      ctx.fillStyle = "#111118";
      ctx.beginPath(); ctx.roundRect(0, 0, W(), H(), 20); ctx.fill();

      const l = left(), c = center(), r = right(), b = bottom();
      const bx = BX();
      const lfs = Math.max(8, Math.min(10, W() * 0.013));

      ctx.fillStyle = "#555"; ctx.font = `${lfs}px sans-serif`; ctx.textAlign = "center";
      [[l.x,"STEP 01"],[c.x,"STEP 02"],[r.x,"STEP 03"]].forEach(([x,s]) =>
        ctx.fillText(s, x, l.y - bx/2 - 14));
      ctx.fillText("STEP 04", b.x, b.y - bx/2 - 14);

      drawWire(l.x+bx/2, l.y, c.x-bx/2, c.y);
      drawWire(c.x+bx/2, c.y, r.x-bx/2, r.y);
      drawWire(b.x, b.y-bx/2, c.x, c.y+bx/2);
      drawFlow(l.x+bx/2, l.y, c.x-bx/2, c.y, 0);
      drawFlow(c.x+bx/2, c.y, r.x-bx/2, r.y, 20);
      drawFlow(b.x, b.y-bx/2, b.x, c.y+bx/2, 40);

      [[l.x+bx/2,l.y],[c.x-bx/2,c.y],[c.x+bx/2,c.y],
       [r.x-bx/2,r.y],[b.x,b.y-bx/2],[b.x,c.y+bx/2]
      ].forEach(([cx,cy]) => {
        ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2);
        ctx.fillStyle="#6a38c2"; ctx.globalAlpha=0.8; ctx.fill(); ctx.globalAlpha=1;
      });

      drawBox(l.x, l.y, "Create Profile", "2 min setup");
      drawBox(c.x, c.y, "HireStream",     "matches you", true);
      drawBox(r.x, r.y, "Land the Offer", "avg. 12 days");
      drawBox(b.x, b.y, "Discover & Apply","one click");
      drawIcon(l.x, l.y, "person");
      drawIcon(c.x, c.y, "bolt");
      drawIcon(r.x, r.y, "trophy");
      drawIcon(b.x, b.y, "search");

      t++; raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-2xl"
      style={{ height: "340px" }}
    />
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            How <span className="text-[#6a38c2]">HireStream</span> Works
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            From sign-up to offer letter — we've made every step effortless.
          </p>
        </div>

        {/* ── Mobile: vertical step cards (hidden md+) ── */}
        <div className="md:hidden flex flex-col gap-0 relative">

          {/* Vertical connector line */}
          <div className="absolute left-[22px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#6a38c2] via-[#f83002] to-green-400 opacity-20" />

          {steps.map(({ step, icon: Icon, title, sub, desc, color, dot }, i) => (
            <div key={step} className="flex items-start gap-4 relative pb-6 last:pb-0">

              {/* Step dot */}
              <div className="shrink-0 flex flex-col items-center z-10">
                <div
                  className="h-11 w-11 rounded-2xl border flex items-center justify-center shadow-sm"
                  style={{ background: `${dot}10`, borderColor: `${dot}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color: dot }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1 pb-2 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-gray-300">
                    {step}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${dot}10`, color: dot }}
                  >
                    {sub}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop: canvas diagram (hidden below md) ── */}
        <div className="hidden md:block">
          <CanvasDiagram />
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <Link to="/signup">
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-all shadow-lg shadow-[#6a38c2]/20">
              Get Started Free →
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;