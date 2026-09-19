const categoryOrder = [
  ["germany", "Germania & Düsseldorf"],
  ["italy", "Italia"],
  ["world", "Europa & Mondo"],
  ["ai", "AI"],
  ["robotics", "Robotica"],
  ["automotive", "Automotive & AUMOVIO"],
  ["business", "Business, Economia & Mercati"],
  ["events", "Eventi"]
];

let editions = [];
let activeEdition = null;
let toastTimer;

const $ = (selector) => document.querySelector(selector);

function italianDate(dateString, long = true) {
  return new Intl.DateTimeFormat("it-IT", long
    ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    : { day: "2-digit", month: "2-digit" }
  ).format(new Date(`${dateString}T12:00:00`));
}

function showToast(message) {
  const toast = $("#feedbackToast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function getRatings() {
  try { return JSON.parse(localStorage.getItem("briefing-ratings") || "{}"); }
  catch { return {}; }
}

function saveRating(itemId, value) {
  const ratings = getRatings();
  ratings[itemId] = ratings[itemId] === value ? null : value;
  if (!ratings[itemId]) delete ratings[itemId];
  localStorage.setItem("briefing-ratings", JSON.stringify(ratings));
  renderEdition(activeEdition);
  showToast(ratings[itemId] ? "Feedback salvato. Grazie." : "Feedback rimosso.");
}

function actionIcon(item) {
  const paid = item.paywall ? `<span class="icon-link paywall" title="Fonte con paywall" aria-label="Fonte con paywall">€</span>` : "";
  const free = item.freeUrl ? `<a class="icon-link demo-link" href="${item.freeUrl}" title="Alternativa gratuita" aria-label="Apri alternativa gratuita"><i class="bi bi-unlock"></i></a>` : "";
  return `${paid}${free}`;
}

function newsRow(item) {
  const ratings = getRatings();
  const rating = ratings[item.id];
  return `
    <article class="news-row">
      <div class="news-copy">
        <div class="news-meta"><span>${item.source}</span>${item.status ? `<span>· ${item.status}</span>` : ""}</div>
        <h3 class="news-title"><a class="demo-link" href="${item.url}" aria-label="Leggi: ${item.title}">${item.title}</a></h3>
      </div>
      <div class="news-actions" aria-label="Azioni per la notizia">
        ${actionIcon(item)}
        <a class="icon-link demo-link" href="${item.url}" title="Apri la fonte" aria-label="Apri la fonte"><i class="bi bi-box-arrow-up-right"></i></a>
        <button class="rating-button ${rating === "up" ? "is-active" : ""}" data-rating="up" data-id="${item.id}" title="Mi interessa" aria-label="Mi interessa" aria-pressed="${rating === "up"}"><i class="bi bi-hand-thumbs-up"></i></button>
        <button class="rating-button ${rating === "down" ? "is-active" : ""}" data-rating="down" data-id="${item.id}" title="Non mi interessa" aria-label="Non mi interessa" aria-pressed="${rating === "down"}"><i class="bi bi-hand-thumbs-down"></i></button>
      </div>
    </article>`;
}

function renderSection(key, label, items) {
  const count = items.length ? `${items.length} ${items.length === 1 ? "notizia" : "notizie"}` : "Nessuna notizia";
  return `
    <section class="news-section" id="${key}">
      <div class="container px-4 px-lg-5">
        <div class="section-heading">
          <span class="section-count">${count}</span>
          <h2>${label}</h2>
        </div>
        ${items.length ? `<div class="news-list">${items.map(newsRow).join("")}</div>` : `<p class="empty-state">Nessun aggiornamento rilevante.</p>`}
      </div>
    </section>`;
}

function renderWeekend(items) {
  if (!items?.length) return "";
  return `
    <section class="news-section weekend-section" id="eventi-weekend">
      <div class="container px-4 px-lg-5">
        <div class="section-heading">
          <span class="section-count">Edizione del venerdì · 5 proposte</span>
          <h2>Eventi del weekend</h2>
        </div>
        <div class="news-list">${items.map(newsRow).join("")}</div>
      </div>
    </section>`;
}

function renderEdition(edition, shouldScroll = false) {
  activeEdition = edition;
  $("#editionTitle").textContent = italianDate(edition.date);
  $("#editionNote").textContent = edition.note;
  $("#dailySummary").textContent = edition.summary || "Nessuna sintesi disponibile per questa edizione dimostrativa.";
  $("#heroDate").textContent = `Edizione di ${italianDate(edition.date)}`;
  document.title = `Briefing Quotidiano · ${italianDate(edition.date, false)}`;
  const grouped = Object.groupBy
    ? Object.groupBy(edition.items, item => item.category)
    : edition.items.reduce((result, item) => ((result[item.category] ||= []).push(item), result), {});
  $("#newsSections").innerHTML = categoryOrder.map(([key, label]) => renderSection(key, label, grouped[key] || [])).join("") + renderWeekend(edition.weekendEvents);
  document.querySelectorAll(".rating-button").forEach(button => button.addEventListener("click", () => saveRating(button.dataset.id, button.dataset.rating)));
  document.querySelectorAll(".demo-link").forEach(link => link.addEventListener("click", event => {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      showToast("Il link sarà attivo con le notizie reali.");
    }
  }));
  document.querySelectorAll(".archive-button").forEach(button => button.classList.toggle("is-active", button.dataset.date === edition.date));
  if (shouldScroll) {
    window.scrollTo({ top: $("#notizie").offsetTop - 66, behavior: "smooth" });
  }
}

function renderArchive() {
  $("#archiveGrid").innerHTML = editions.map((edition, index) => `
    <button class="archive-button ${index === 0 ? "is-active" : ""}" data-date="${edition.date}" role="listitem">
      <span class="archive-day">${index === 0 ? "Oggi" : new Intl.DateTimeFormat("it-IT", { weekday: "short" }).format(new Date(`${edition.date}T12:00:00`))}</span>
      <span class="archive-date">${italianDate(edition.date, false)}</span>
    </button>`).join("");
  document.querySelectorAll(".archive-button").forEach(button => button.addEventListener("click", () => {
    const edition = editions.find(item => item.date === button.dataset.date);
    renderEdition(edition, true);
  }));
}

fetch("data/editions.json")
  .then(response => {
    if (!response.ok) throw new Error("Dati non disponibili");
    return response.json();
  })
  .then(data => {
    editions = data.editions;
    renderArchive();
    renderEdition(editions[0]);
  })
  .catch(() => {
    $("#newsSections").innerHTML = `<div class="container px-4 px-lg-5 py-5"><p class="empty-state">Impossibile caricare l’edizione. Riprova più tardi.</p></div>`;
  });
