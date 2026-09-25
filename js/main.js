document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar");
  const toggleScrolled = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  const links = document.querySelectorAll(".nav-pill a[data-section]");
  const sections = [...links]
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

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
});
