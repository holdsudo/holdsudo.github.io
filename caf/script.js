const lines = Array.from(document.querySelectorAll(".hero-line"));
const sublines = Array.from(document.querySelectorAll(".hero-subline"));
const yearNode = document.querySelector("#year");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });
}

if (lines.length && sublines.length && lines.length === sublines.length) {
  let activeIndex = 0;

  setInterval(() => {
    lines[activeIndex].classList.remove("is-active");
    sublines[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % lines.length;
    lines[activeIndex].classList.add("is-active");
    sublines[activeIndex].classList.add("is-active");
  }, 3800);
}
