import { useEffect, useRef } from "react";

// SVG fractal-noise grain — section-scoped, renders behind all content
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Hero() {
  const badgeRef   = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const ctaRef     = useRef(null);

  // Entrance animations
  useEffect(() => {
    // badge, sub, cta — fade + translateY with expo easing
    [
      [badgeRef.current,  120],
      [subRef.current,    440],
      [ctaRef.current,    580],
    ].forEach(([el, delay]) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      setTimeout(() => {
        el.style.transition =
          "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, delay);
    });

    // h1 — clip-path wipe-up reveal for a more distinctive entrance
    const h1 = headingRef.current;
    if (h1) {
      h1.style.clipPath = "inset(0 0 100% 0)";
      h1.style.transform = "translateY(10px)";
      setTimeout(() => {
        h1.style.transition =
          "clip-path 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)";
        h1.style.clipPath = "inset(0 0 0% 0)";
        h1.style.transform = "translateY(0)";
      }, 280);
    }
  }, []);

  // Magnetic pull on CTA buttons
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = ctaRef.current;
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll("a"));
    const cleanup = [];

    buttons.forEach((btn) => {
      const onEnter = () => { btn.style.transition = "none"; };
      const onMove  = (e) => {
        const r  = btn.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist   = Math.hypot(dx, dy);
        const radius = 72;
        if (dist < radius) {
          const pull = (1 - dist / radius) * 7;
          btn.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull - 2}px)`;
        }
      };
      const onLeave = () => {
        btn.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        btn.style.transform  = "";
      };

      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mousemove",  onMove);
      btn.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        btn.removeEventListener("mouseenter", onEnter);
        btn.removeEventListener("mousemove",  onMove);
        btn.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanup.forEach((fn) => fn());
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Animated gradient sweep — very slow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,188,212,0.04) 0%, transparent 50%, rgba(0,150,170,0.03) 100%)",
          animation: "gradientShift 12s ease infinite alternate",
        }}
      />

      {/* Architectural line grid */}
      <div className="absolute inset-0 line-grid pointer-events-none" style={{ opacity: 0.04 }} />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRAIN_URL,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />

      {/* Breathing orb — top right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "8%", right: "4%",
          width: "540px", height: "540px",
          background: "radial-gradient(circle, rgba(0,188,212,0.07) 0%, transparent 65%)",
          borderRadius: "50%",
          animation: "breatheOrb 10s ease-in-out infinite alternate",
        }}
      />

      {/* Breathing orb — bottom left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "2%", left: "-10%",
          width: "420px", height: "420px",
          background: "radial-gradient(circle, rgba(0,188,212,0.05) 0%, transparent 65%)",
          borderRadius: "50%",
          animation: "breatheOrb 13s ease-in-out 2s infinite alternate",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left — text content */}
        <div>
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold tracking-widest"
            style={{
              background: "rgba(0,188,212,0.12)",
              border: "1px solid rgba(0,188,212,0.3)",
              color: "#00bcd4",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#00bcd4" }}
            />
            LOS ANGELES · REMOTE WORLDWIDE
          </div>

          {/* Headline — clip-path wipe-up */}
          <h1
            ref={headingRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-white"
          >
            Practical{" "}
            <span className="gradient-text">AI Solutions</span>
            {" "}for Small &amp; Mid-Size{" "}
            <span className="gradient-text">Businesses</span>
          </h1>

          <p ref={subRef} className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
            We help businesses automate workflows, cut operating costs, and grow faster
            with AI built around your actual processes — not generic templates.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" className="btn-cyan text-center">
              Book Your Consultation
            </a>
            <a href="#services" className="btn-outline text-center">
              Explore Services
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-8">
            {[
              { num: "50+",  label: "Projects Delivered" },
              { num: "35%",  label: "Average ROI Boost" },
              { num: "24/7", label: "AI Support" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black" style={{ color: "#00bcd4" }}>
                  {stat.num}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero photo */}
        <div
          className="hidden lg:flex items-center justify-center relative"
          style={{
            height: "480px",
            animation: "fadeSlideIn 1s cubic-bezier(0.16,1,0.3,1) 0.4s both",
          }}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(13,31,45,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
            <img
              src="/hero.jpg"
              alt="AI Business Solutions"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(13,31,45,0.45) 0%, rgba(0,188,212,0.08) 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: "1px solid rgba(0,188,212,0.25)" }}
            />
          </div>

          {/* Floating stat badge — top right */}
          <div
            className="absolute top-6 right-2 px-4 py-2.5 rounded-xl text-center"
            style={{
              background: "rgba(13,31,45,0.9)",
              border: "1px solid rgba(0,188,212,0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              animation: "fadeSlideIn 0.7s cubic-bezier(0.16,1,0.3,1) 1s both",
            }}
          >
            <div className="text-xl font-black" style={{ color: "#00bcd4" }}>+35%</div>
            <div className="text-xs text-slate-400">Avg ROI</div>
          </div>

          {/* Floating stat badge — bottom left */}
          <div
            className="absolute bottom-10 left-2 px-4 py-2.5 rounded-xl text-center"
            style={{
              background: "rgba(13,31,45,0.9)",
              border: "1px solid rgba(0,188,212,0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              animation: "fadeSlideIn 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both",
            }}
          >
            <div className="text-xl font-black" style={{ color: "#00bcd4" }}>25 hrs</div>
            <div className="text-xs text-slate-400">Saved / week</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <div className="text-xs text-slate-500 tracking-widest">SCROLL</div>
        <div
          className="w-px h-8"
          style={{ background: "linear-gradient(to bottom, #00bcd4, transparent)" }}
        />
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breatheOrb {
          0%   { opacity: 0.55; transform: scale(1); }
          100% { opacity: 1;    transform: scale(1.1); }
        }
        @keyframes gradientShift {
          0%   { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
