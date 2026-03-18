// // HowItWorks.jsx
// // ─── Explains the platform in 3 clear steps ──────────────────────────────────
// // REMOVE: Delete this entire file + its import in Home.jsx if not needed

// import React from "react";
// import { UserCircle2, SearchCheck, PartyPopper } from "lucide-react";

// const steps = [
//   {
//     step: "01",
//     icon: UserCircle2,
//     title: "Create Your Profile",
//     desc: "Sign up in under 2 minutes. Add your skills, experience, and what kind of role you're looking for.",
//     color: "text-[#6a38c2] bg-purple-50 border-purple-100",
//   },
//   {
//     step: "02",
//     icon: SearchCheck,
//     title: "Discover & Apply",
//     desc: "Browse thousands of curated listings. Filter by role, salary, location, or work mode and apply in one click.",
//     color: "text-[#f83002] bg-red-50 border-red-100",
//   },
//   {
//     step: "03",
//     icon: PartyPopper,
//     title: "Land Your Dream Job",
//     desc: "Get shortlisted, attend interviews, and receive offers — all tracked right here on your dashboard.",
//     color: "text-green-600 bg-green-50 border-green-100",
//   },
// ];

// const HowItWorks = () => {
//   return (
//     <section className="py-20 bg-white">
//       <div className="max-w-5xl mx-auto px-6">

//         {/* Header */}
//         <div className="text-center mb-14">
//           <span className="text-xs font-semibold uppercase tracking-widest text-[#f83002]">
//             Simple Process
//           </span>
//           <h2 className="text-3xl font-bold text-gray-900 mt-2">
//             How <span className="text-[#6a38c2]">JobHunt</span> Works
//           </h2>
//           <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
//             From sign-up to offer letter — we've made every step effortless.
//           </p>
//         </div>

//         {/* Steps */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

//           {/* ── OPTIONAL: Connector line between steps (desktop only) ── */}
//           <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#6a38c2]/20 via-[#f83002]/20 to-green-300/20" />

//           {steps.map(({ step, icon: Icon, title, desc, color }) => (
//             <div key={step} className="flex flex-col items-center text-center gap-4 relative z-10">
//               {/* Icon bubble */}
//               <div className={`p-4 rounded-2xl border ${color} shadow-sm`}>
//                 <Icon className="h-7 w-7" />
//               </div>
//               {/* Step number */}
//               <span className="text-xs font-bold text-gray-300 tracking-widest">{step}</span>
//               <div>
//                 <h3 className="font-bold text-gray-900 text-base">{title}</h3>
//                 <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default HowItWorks;



// HowItWorks.jsx

import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Node centers (scaled to canvas)
    const left   = { x: W * 0.16, y: H * 0.38 };
    const center = { x: W * 0.50, y: H * 0.38 };
    const right  = { x: W * 0.84, y: H * 0.38 };
    const bottom = { x: W * 0.50, y: H * 0.78 };

    const BOX = 54;

    function drawBox(x, y, label, sub, active = false) {
      const r = 14;
      ctx.beginPath();
      ctx.roundRect(x - BOX/2, y - BOX/2, BOX, BOX, r);
      ctx.fillStyle = active ? "#1e1428" : "#1a1a26";
      ctx.fill();
      ctx.strokeStyle = active ? "#6a38c2" : "#2e2e40";
      ctx.lineWidth = active ? 2 : 1.5;
      ctx.stroke();

      if (active) {
        ctx.beginPath();
        ctx.roundRect(x - BOX/2, y - BOX/2, BOX, BOX, r);
        ctx.strokeStyle = `rgba(106,56,194,${0.15 + 0.1 * Math.sin(t * 0.05)})`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + BOX/2 + 20);
      ctx.fillStyle = active ? "#6a38c2" : "#555";
      ctx.font = "11px sans-serif";
      ctx.fillText(sub, x, y + BOX/2 + 35);
    }

    function drawWire(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#2e2e40";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
    }

    function drawFlow(x1, y1, x2, y2, offset) {
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy);
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.strokeStyle = "#6a38c2";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 48]);
      ctx.lineDashOffset = -((t * 1.2 + offset) % 60);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
    }

    function drawIcon(x, y, type) {
      ctx.strokeStyle = "#6a38c2";
      ctx.fillStyle = "#6a38c2";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (type === "person") {
        ctx.beginPath();
        ctx.arc(x, y - 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 13, y + 12);
        ctx.quadraticCurveTo(x - 13, y + 2, x, y + 2);
        ctx.quadraticCurveTo(x + 13, y + 2, x + 13, y + 12);
        ctx.fill();
      } else if (type === "bolt") {
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 14);
        ctx.lineTo(x - 6, y + 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x - 5, y + 14);
        ctx.lineTo(x + 8, y - 2);
        ctx.lineTo(x, y - 2);
        ctx.closePath();
        ctx.fill();
      } else if (type === "search") {
        ctx.beginPath();
        ctx.arc(x - 4, y - 4, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + 12, y + 12);
        ctx.stroke();
      } else if (type === "trophy") {
        ctx.strokeRect(x - 12, y - 14, 24, 18);
        ctx.fillRect(x - 6, y + 4, 12, 4);
        ctx.fillRect(x - 9, y + 8, 18, 4);
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 8);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 5, y - 8);
        ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#111118";
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 20);
      ctx.fill();

      // Step labels
      ctx.fillStyle = "#555";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "2px";
      ["STEP 01", "STEP 02", "STEP 03"].forEach((s, i) => {
        const xs = [left.x, center.x, right.x];
        ctx.fillText(s, xs[i], left.y - BOX/2 - 18);
      });
      ctx.fillText("STEP 02", bottom.x, bottom.y - BOX/2 - 18);

      // Wires
      drawWire(left.x + BOX/2, left.y, center.x - BOX/2, center.y);
      drawWire(center.x + BOX/2, center.y, right.x - BOX/2, right.y);
      drawWire(bottom.x, bottom.y - BOX/2, center.x, center.y + BOX/2);

      // Animated flows
      drawFlow(left.x + BOX/2, left.y, center.x - BOX/2, center.y, 0);
      drawFlow(center.x + BOX/2, center.y, right.x - BOX/2, right.y, 20);
      drawFlow(bottom.x, bottom.y - BOX/2, bottom.x, center.y + BOX/2, 40);

      // Junction dots
      [[left.x + BOX/2, left.y], [center.x - BOX/2, center.y],
       [center.x + BOX/2, center.y], [right.x - BOX/2, right.y],
       [bottom.x, bottom.y - BOX/2], [bottom.x, center.y + BOX/2]
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#6a38c2";
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Boxes
      drawBox(left.x,   left.y,   "Create Profile", "2 min setup");
      drawBox(center.x, center.y, "HireStream",     "matches you", true);
      drawBox(right.x,  right.y,  "Land the Offer", "avg. 12 days");
      drawBox(bottom.x, bottom.y, "Discover & Apply","one click");

      // Icons inside boxes
      drawIcon(left.x,   left.y,   "person");
      drawIcon(center.x, center.y, "bolt");
      drawIcon(right.x,  right.y,  "trophy");
      drawIcon(bottom.x, bottom.y, "search");

      t++;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mt-2">
            How <span className="text-[#6a38c2]">HireStream</span> Works
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            From sign-up to offer letter — we've made every step effortless.
          </p>
        </div>

        {/* Canvas diagram */}
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl"
          style={{ height: "380px" }}
        />

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/signup">
            <button className="px-8 py-3 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-all shadow-lg shadow-[#6a38c2]/20">
              Get Started Free →
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;