const grid = document.getElementById("card-grid");
const template = document.getElementById("card-template");

const modal = document.getElementById("action-modal");
const backdrop = document.getElementById("modal-backdrop");
const closeBtn = document.getElementById("modal-close");
const modalIconWrap = document.getElementById("modal-icon-wrap");
const modalKicker = document.getElementById("modal-kicker");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalPreview = document.getElementById("modal-preview");
const modalActions = document.getElementById("modal-actions");

const resumeGate = document.getElementById("resume-gate");
const resumePassword = document.getElementById("resume-password");
const resumeSubmit = document.getElementById("resume-submit");
const resumeError = document.getElementById("resume-error");

let activeCard = null;

function copyText(value) {
  if (!navigator.clipboard) {
    window.prompt("Copy this:", value);
    return;
  }

  navigator.clipboard.writeText(value).then(() => {
    window.alert("Copied.");
  }).catch(() => {
    window.prompt("Copy this:", value);
  });
}

function createActionButton(action) {
  let element;

  if (action.type === "link") {
    element = document.createElement("a");
    element.href = action.href;
    element.textContent = action.label;
    element.className = `action-btn ${action.style === "primary" ? "primary-action" : "secondary-action"}`;

    if (/^https?:|^mailto:|^tel:/i.test(action.href) || action.href.endsWith(".pdf")) {
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }

    if (action.download) {
      element.setAttribute("download", "");
    }

    return element;
  }

  if (action.type === "copy") {
    element = document.createElement("button");
    element.type = "button";
    element.textContent = action.label;
    element.className = `action-btn ${action.style === "primary" ? "primary-action" : "secondary-action"}`;
    element.addEventListener("click", () => copyText(action.value));
    return element;
  }

  if (action.type === "passwordPrompt") {
    element = document.createElement("button");
    element.type = "button";
    element.textContent = action.label;
    element.className = `action-btn ${action.style === "primary" ? "primary-action" : "secondary-action"}`;
    element.addEventListener("click", () => {
      resumeGate.classList.remove("hidden");
      resumePassword.focus();
    });
    return element;
  }

  return document.createElement("div");
}

function populateModal(card) {
  activeCard = card;
  modalIconWrap.innerHTML = card.icon;
  modalKicker.textContent = card.kicker || "";
  modalTitle.textContent = card.title;
  modalDescription.textContent = card.description || "";
  modalPreview.replaceChildren();
  modalActions.replaceChildren();

  resumeGate.classList.add("hidden");
  resumePassword.value = "";
  resumeError.classList.add("hidden");

  if (Array.isArray(card.preview) && card.preview.length > 0) {
    card.preview.forEach((item) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("span");
      const value = document.createElement("p");

      wrapper.className = "preview-line";
      label.className = "preview-label";
      value.className = "preview-value";

      label.textContent = item.label;
      value.textContent = item.value;

      wrapper.appendChild(label);
      wrapper.appendChild(value);
      modalPreview.appendChild(wrapper);
    });

    modalPreview.classList.remove("hidden");
  } else {
    modalPreview.classList.add("hidden");
  }

  card.actions.forEach((action) => {
    modalActions.appendChild(createActionButton(action));
  });
}

function openModal(card) {
  populateModal(card);
  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");

  requestAnimationFrame(() => {
    modal.classList.add("show");
  });

  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");

  window.setTimeout(() => {
    modal.classList.add("hidden");
    backdrop.classList.add("hidden");
  }, 180);

  document.body.style.overflow = "";
  activeCard = null;
}

function renderCards() {
  if (!grid || !template || !Array.isArray(data)) {
    return;
  }

  const fragment = document.createDocumentFragment();

  data.forEach((item, index) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".contact-card");
    const icon = node.querySelector(".card-icon");
    const title = node.querySelector(".card-title");
    const subtitle = node.querySelector(".card-subtitle");

    card.classList.add("reveal");
    card.style.animationDelay = `${140 + index * 50}ms`;
    icon.innerHTML = item.icon;
    title.textContent = item.title;
    subtitle.textContent = item.subtitle;

    card.addEventListener("click", () => openModal(item));
    fragment.appendChild(node);
  });

  grid.replaceChildren(fragment);
}

function initializeMotion() {
  document.body.classList.add("is-ready");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--mouse-x", `${x}%`);
    document.documentElement.style.setProperty("--mouse-y", `${y}%`);
  }, { passive: true });
}

resumeSubmit.addEventListener("click", () => {
  if (!activeCard || !activeCard.requiresPassword) {
    return;
  }

  if (resumePassword.value === activeCard.password) {
    window.open(activeCard.protectedLink, "_blank", "noopener,noreferrer");
    closeModal();
    return;
  }

  resumeError.classList.remove("hidden");
});

resumePassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    resumeSubmit.click();
  }
});

closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

renderCards();
initializeMotion();
