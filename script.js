const grid = document.getElementById("card-grid");
const template = document.getElementById("card-template");

const modal = document.getElementById("action-modal");
const backdrop = document.getElementById("modal-backdrop");
const closeBtn = document.getElementById("modal-close");

const modalIconWrap = document.getElementById("modal-icon-wrap");
const modalKicker = document.getElementById("modal-kicker");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalActions = document.getElementById("modal-actions");

const resumeGate = document.getElementById("resume-gate");
const resumePassword = document.getElementById("resume-password");
const resumeSubmit = document.getElementById("resume-submit");
const resumeError = document.getElementById("resume-error");

let activeCard = null;

function trackEvent(name, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params || {});
  }
}

function copyText(value, successText, trackName) {
  if (!navigator.clipboard) {
    window.prompt("Copy this:", value);
    trackEvent(trackName || "copy_click", { copied_value: value });
    return;
  }

  navigator.clipboard.writeText(value)
    .then(function () {
      trackEvent(trackName || "copy_click", { copied_value: value });
      alert(successText);
    })
    .catch(function () {
      window.prompt("Copy this:", value);
    });
}

function createActionButton(action) {
  let el;

  if (action.type === "link") {
    el = document.createElement("a");
    el.href = action.href;
    el.textContent = action.label;
    el.className = "action-btn " + (action.style === "primary" ? "primary-action" : "secondary-action");

    if (/^https?:/i.test(action.href)) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      el.target = "_self";
    }

    if (action.download) {
      el.setAttribute("download", "");
    }

    el.addEventListener("click", function () {
      trackEvent(action.track || "link_click", {
        card: activeCard ? activeCard.key : ""
      });
    });

    return el;
  }

  if (action.type === "copy") {
    el = document.createElement("button");
    el.type = "button";
    el.textContent = action.label;
    el.className = "action-btn " + (action.style === "primary" ? "primary-action" : "secondary-action");

    el.addEventListener("click", function () {
      copyText(action.value, action.label + " copied.", action.track);
    });

    return el;
  }

  if (action.type === "passwordPrompt") {
    el = document.createElement("button");
    el.type = "button";
    el.textContent = action.label;
    el.className = "action-btn " + (action.style === "primary" ? "primary-action" : "secondary-action");

    el.addEventListener("click", function () {
      resumeGate.classList.remove("hidden");
      resumePassword.focus();
      trackEvent(action.track || "password_prompt_open");
    });

    return el;
  }

  return document.createElement("div");
}

function populateModal(card) {
  activeCard = card;

  modalIconWrap.innerHTML = '<i class="' + card.icon + '"></i>';
  modalKicker.textContent = card.kicker || "";
  modalTitle.textContent = card.title;
  modalDescription.textContent = card.description || "";
  modalActions.innerHTML = "";

  resumeGate.classList.add("hidden");
  resumePassword.value = "";
  resumeError.classList.add("hidden");
  resumeError.classList.remove("shake");

  for (let i = 0; i < card.actions.length; i++) {
    modalActions.appendChild(createActionButton(card.actions[i]));
  }

  trackEvent(card.trackOpen || "card_open", { card: card.key });
}

function openModal(card) {
  populateModal(card);
  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");

  requestAnimationFrame(function () {
    modal.classList.add("show");
  });

  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");

  setTimeout(function () {
    modal.classList.add("hidden");
    backdrop.classList.add("hidden");
  }, 220);

  document.body.style.overflow = "";
  activeCard = null;
}

function renderCards() {
  if (!grid || !template || typeof data === "undefined" || !Array.isArray(data)) {
    console.error("Cards could not render. Check data.js and HTML IDs.");
    return;
  }

  grid.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".contact-card");
    const icon = node.querySelector(".card-icon");
    const title = node.querySelector(".card-title");
    const subtitle = node.querySelector(".card-subtitle");

    icon.innerHTML = '<i class="' + item.icon + '"></i>';
    title.textContent = item.title;
    subtitle.textContent = item.subtitle;

    card.addEventListener("click", function () {
      openModal(item);
    });

    grid.appendChild(node);
  }
}

if (resumeSubmit) {
  resumeSubmit.addEventListener("click", function () {
    if (!activeCard || !activeCard.requiresPassword) return;

    if (resumePassword.value === activeCard.password) {
      trackEvent("resume_unlock_success");
      window.open(activeCard.protectedLink, "_blank", "noopener,noreferrer");
      closeModal();
    } else {
      trackEvent("resume_unlock_fail");
      resumeError.classList.remove("hidden");
      resumeError.classList.add("shake");

      setTimeout(function () {
        resumeError.classList.remove("shake");
      }, 350);
    }
  });
}

if (resumePassword) {
  resumePassword.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      resumeSubmit.click();
    }
  });
}

if (closeBtn) closeBtn.addEventListener("click", closeModal);
if (backdrop) backdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

const trackEls = document.querySelectorAll("[data-track]");
for (let i = 0; i < trackEls.length; i++) {
  trackEls[i].addEventListener("click", function () {
    trackEvent(this.dataset.track);
  });
}

window.addEventListener("load", function () {
  trackEvent("page_loaded");

  setTimeout(function () {
    const loader = document.getElementById("wipe-loader");
    if (loader) loader.remove();
  }, 1300);

  renderCards();
});
