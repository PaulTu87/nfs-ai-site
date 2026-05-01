import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");

    if (reduced) {
      els.forEach(el => {
        if (el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "visible");
        else el.setAttribute("data-reveal-stagger", "visible");
      });
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          if (target.hasAttribute("data-reveal")) target.setAttribute("data-reveal", "visible");
          else target.setAttribute("data-reveal-stagger", "visible");
          obs.unobserve(target);
        });
      },
      { threshold: 0.12 }
    );

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
