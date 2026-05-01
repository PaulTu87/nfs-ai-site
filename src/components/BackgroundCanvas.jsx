import { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const stageRef  = useRef(null);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const stage   = stageRef.current;
    const ctx     = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let nodes = [];
    let raf   = null;

    let curTiltX = 68, curTiltZ = 0;
    let tgtTiltX = 68, tgtTiltZ = 0;

    const isMobile = () => window.innerWidth < 768;
    let cW = 0, cH = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      cW = Math.round(window.innerWidth  * 1.10);
      cH = Math.round(window.innerHeight * 1.20);
      canvas.width  = cW * dpr;
      canvas.height = cH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      const mob   = isMobile();
      const raw   = Math.round((window.innerWidth * window.innerHeight) / 38000);
      const count = mob
        ? Math.min(Math.max(raw,     15),  25)
        : Math.min(Math.max(raw * 3, 60), 110);
      nodes = Array.from({ length: count }, () => ({
        x:          Math.random() * cW,
        y:          Math.random() * cH,
        vx:         (Math.random() - 0.5) * 0.36,
        vy:         (Math.random() - 0.5) * 0.36,
        ex:         0,
        ey:         0,
        phase:      Math.random() * Math.PI * 2,
        phaseSpeed: 0.007 + Math.random() * 0.006,
        depth:      Math.random(),
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, cW, cH);

      // Perspective floor grid — evenly spaced horizontal lines; CSS rotateX creates convergence
      const lineGap = Math.max(60, window.innerHeight / 10);
      ctx.lineWidth   = 1;
      ctx.strokeStyle = "rgba(0,188,212,0.05)";
      for (let y = 0; y <= cH; y += lineGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cW, y);
        ctx.stroke();
      }

      // Connections
      const connDist = isMobile() ? 100 : 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < connDist) {
            const avgDepth  = (nodes[i].depth + nodes[j].depth) * 0.5;
            const depthFade = 1 - avgDepth * 0.7;
            const alpha     = ((1 - d / connDist) * 0.25 * depthFade).toFixed(4);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,188,212,${alpha})`;
            ctx.lineWidth   = 0.4 + (1 - avgDepth) * 0.4;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        const pulse = (Math.sin(n.phase) * 0.5 + 0.5) * 0.45;
        const alpha = ((0.55 + pulse) * (1 - n.depth * 0.65)).toFixed(3);
        const r     = 0.8 + (1 - n.depth) * 2.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,188,212,${alpha})`;
        ctx.fill();
      });
    }

    function tick() {
      nodes.forEach(n => {
        n.phase += n.phaseSpeed;

        const dx   = n.x - mouse.x;
        const dy   = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const t = 1 - dist / 120;
          const f = t * t * 0.6;
          n.ex += (dx / dist) * f;
          n.ey += (dy / dist) * f;
        }

        n.ex *= 0.92;
        n.ey *= 0.92;
        const es = Math.sqrt(n.ex * n.ex + n.ey * n.ey);
        if (es > 1.5) { n.ex = (n.ex / es) * 1.5; n.ey = (n.ey / es) * 1.5; }

        n.x += n.vx + n.ex;
        n.y += n.vy + n.ey;
        if (n.x < 0) n.x = cW; else if (n.x > cW) n.x = 0;
        if (n.y < 0) n.y = cH; else if (n.y > cH) n.y = 0;
      });

      // Tilt interpolation — desktop + non-reduced only
      if (!reduced && !isMobile()) {
        curTiltX += (tgtTiltX - curTiltX) * 0.05;
        curTiltZ += (tgtTiltZ - curTiltZ) * 0.05;
        stage.style.transform =
          `rotateX(${curTiltX.toFixed(3)}deg) rotateZ(${curTiltZ.toFixed(3)}deg)`;
      }

      draw();
      raf = requestAnimationFrame(tick);
    }

    init();

    if (reduced) { draw(); return; }

    raf = requestAnimationFrame(tick);

    const onVisible = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    const onMove = e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isMobile()) {
        tgtTiltX = 50 + (e.clientY / window.innerHeight) * 18;
        tgtTiltZ = ((e.clientX / window.innerWidth) - 0.5) * 8;
      }
    };
    const onLeave  = () => { tgtTiltX = 68; tgtTiltZ = 0; };
    const onResize = () => { cancelAnimationFrame(raf); init(); raf = requestAnimationFrame(tick); };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize",     onResize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize",     onResize);
    };
  }, []);

  return (
    <>
      {/* Bottom fog — hides lower tilt edge, always fixed to viewport */}
      <div
        aria-hidden="true"
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        0,
          pointerEvents: "none",
          background:    "linear-gradient(to bottom, transparent 65%, #0d1f2d 100%)",
        }}
      />

      {/* Perspective container — fixed, full viewport */}
      <div
        aria-hidden="true"
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        -1,
          perspective:   "1200px",
          pointerEvents: "none",
          overflow:      "hidden",
        }}
      >
        {/* Tilt stage */}
        <div
          ref={stageRef}
          style={{
            position:        "absolute",
            inset:           "-10% -5%",
            transformStyle:  "preserve-3d",
            transform:       "rotateX(68deg) rotateZ(0deg)",
            transformOrigin: "center 60%",
            willChange:      "transform",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </>
  );
}
