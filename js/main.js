document.addEventListener("DOMContentLoaded", () => {
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
    let ticking = false;
    const updateBall = () => {
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

      const targetX = baseX + curveX;
      const targetYViewport = baseYViewport + curveY;
      const ballTopInSection = progress * scrollRange + targetYViewport;

      ball.style.transform = `translate(calc(${targetX}px - 50%), calc(${ballTopInSection}px - 50%)) scale(${scale})`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateBall);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateBall();
  }

  // ---------- Ambient cursor glow ----------
  const glow = document.querySelector(".cursor-glow");
  if (glow) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (canHover && !reducedMotion) {
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      let curX = targetX;
      let curY = targetY;
      let started = false;

      // On the home page, the glow lives inside the "Principais projetos"
      // section itself (clipped by its overflow:hidden) so it only ever
      // shows there, cut off cleanly at the section edges, and never on
      // the Home hero or the footer.
      const projetosSection = document.getElementById("projetos");
      const containGlow = document.getElementById("home") && projetosSection;
      if (containGlow) {
        projetosSection.appendChild(glow);
        glow.classList.add("is-contained");
      }

      window.addEventListener(
        "pointermove",
        (e) => {
          targetX = e.clientX;
          targetY = e.clientY;
          if (!started) {
            curX = targetX;
            curY = targetY;
            started = true;
          }
        },
        { passive: true }
      );

      const tick = () => {
        curX += (targetX - curX) * 0.1;
        curY += (targetY - curY) * 0.1;
        if (containGlow) {
          const rect = projetosSection.getBoundingClientRect();
          glow.style.transform = `translate3d(${curX - rect.left}px, ${curY - rect.top}px, 0)`;
          if (started) {
            const inProjetos = curY >= rect.top && curY <= rect.bottom;
            glow.classList.toggle("is-active", inProjetos);
          }
        } else {
          glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
          if (started) glow.classList.add("is-active");
        }
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
