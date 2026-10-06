document.addEventListener("DOMContentLoaded", () => {
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    // Belt-and-suspenders: if autoplay still gets blocked on a given
    // device, try once more on the first user touch/click anywhere.
    const tryPlay = () => {
      heroVideo.play().catch(() => {});
    };
    tryPlay();
    document.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    document.addEventListener("click", tryPlay, { once: true });
  }

  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const toggleScrolled = () => {
      topbar.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    toggleScrolled();
    window.addEventListener("scroll", toggleScrolled, { passive: true });
  }

  const links = document.querySelectorAll(".nav-pill a[data-section]");
  const sections = [...links]
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (sections.length) {
    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.section === id);
      });
    };

    const updateActiveFromScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = sections[0];
      for (const section of sections) {
        if (section.offsetTop <= mid) current = section;
      }
      setActive(current.id);
    };
    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
  }

  const ball = document.querySelector(".projects-ball");
  const projetos = document.getElementById("projetos");
  if (ball && projetos) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const computeTarget = () => {
      const rect = projetos.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollRange = Math.max(rect.height - vh, 1);
      const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);

      const t = progress * Math.PI;
      const baseX = vw * (0.05 + progress * 0.95);
      const baseYViewport = vh * (0.08 + Math.pow(progress, 2) * 0.9);

      const curveX = Math.sin(t) * vw * 0.12;
      const curveY = -Math.sin(t) * vh * 0.08;
      const scale = 0.6 + 0.55 * Math.sin(t);

      const x = baseX + curveX;
      const yViewport = baseYViewport + curveY;
      const top = progress * scrollRange + yViewport;

      return { x, top, scale };
    };

    if (reducedMotion) {
      const snap = () => {
        const { x, top, scale } = computeTarget();
        ball.style.transform = `translate(calc(${x}px - 50%), calc(${top}px - 50%)) scale(${scale})`;
      };
      window.addEventListener("scroll", snap, { passive: true });
      snap();
    } else {
      // Ease the ball's rendered position toward the scroll-driven target
      // instead of snapping to it every scroll tick, so the motion trails
      // smoothly rather than jumping with each wheel/trackpad step.
      let curX, curTop, curScale;
      let started = false;

      const tick = () => {
        const { x, top, scale } = computeTarget();
        if (!started) {
          curX = x;
          curTop = top;
          curScale = scale;
          started = true;
        } else {
          curX += (x - curX) * 0.07;
          curTop += (top - curTop) * 0.07;
          curScale += (scale - curScale) * 0.07;
        }
        ball.style.transform = `translate(calc(${curX}px - 50%), calc(${curTop}px - 50%)) scale(${curScale})`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // ---------- Ambient cursor glow (case study pages only, not the home page) ----------
  const glow = document.querySelector(".cursor-glow");
  const isHomePage = document.getElementById("home") && document.getElementById("projetos");
  if (glow && !isHomePage) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (canHover && !reducedMotion) {
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      let curX = targetX;
      let curY = targetY;
      let started = false;

      window.addEventListener(
        "pointermove",
        (e) => {
          targetX = e.clientX;
          targetY = e.clientY;
          if (!started) {
            curX = targetX;
            curY = targetY;
            started = true;
            glow.classList.add("is-active");
          }
        },
        { passive: true }
      );

      const tick = () => {
        curX += (targetX - curX) * 0.1;
        curY += (targetY - curY) * 0.1;
        glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // ---------- Click pulse ripple ----------
  const reducedMotionClick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotionClick) {
    const pulseSelector = ".nav-pill a, .project-card, .contact-col a, .back-top, .arrow-btn, .cs-back";
    document.addEventListener("click", (e) => {
      const target = e.target.closest(pulseSelector);
      if (!target) return;
      const ripple = document.createElement("span");
      ripple.className = "pulse-ripple";
      ripple.addEventListener("animationend", () => ripple.remove());
      target.appendChild(ripple);
    });
  }
});
