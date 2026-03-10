let openCard = null;

function renderImage(content) {
  if (!content.image) return "";

  if (content.imageClickable) {
    return `
      <a class="qr-link" href="${content.link}" target="_blank" rel="noopener noreferrer">
        <img class="dropdown-image" src="${content.image}" alt="${content.title}">
      </a>
    `;
  }

  return `<img class="dropdown-image" src="${content.image}" alt="${content.title}">`;
}

function renderButton(content) {
  if (!content.showButton) return "";
  return `
    <a class="action-button" href="${content.link}" target="_blank" rel="noopener noreferrer">
      ${content.buttonText || "Open"}
    </a>
  `;
}

function toggleCard(card) {
  const container = document.getElementById("dropdown-container");

  if (openCard === card) {
    container.innerHTML = "";
    openCard = null;
    return;
  }

  openCard = card;
  const content = data[card];

  container.innerHTML = `
    <div class="dropdown">
      <h2>${content.title}</h2>
      <p>${content.text}</p>
      ${renderImage(content)}
      ${content.helperText ? `<p class="helper-text">${content.helperText}</p>` : ""}
      ${renderButton(content)}
    </div>
  `;
}
