Warning: fsx was declared with const; use let for reassignable variables.
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

function ratingItemIndex() {
  return editions.reduce((index, edition) => {
    [...(edition.items || []), ...(edition.weekendEvents || [])].forEach(item => {
      if (item?.id && !index[item.id]) index[item.id] = item;
    });
    return index;
  }, {});
}

function exportFeedback() {
  const savedRatings = getRatings();
  const itemIndex = ratingItemIndex();
  const ratings = Object.entries(savedRatings)
    .filter(([, value]) => value === "up" || value === "down")
    .map(([id, value]) => {
      const item = itemIndex[id];
      return {
        id,
        value,
        title: item?.title || null,
        category: item?.category || null
      };
    });

  if (!ratings.length) {
    showToast("Non ci sono ancora feedback da scaricare.");
    return;
  }

  const capturedAt = new Date().toISOString();
  const payload = { capturedAt, ratings };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `briefing-feedback-${capturedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(`${ratings.length} ${ratings.length === 1 ? "valutazione esportata" : "valutazioni esportate"}.`);
}

function actionIcon(item) {
  const paid = item.paywall ? `<span class="icon-link paywall" title="Fonte con accesso a pagamento o limitato" aria-label="Fonte con accesso a pagamento o limitato">€</span>` : "";
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
  $("#dailySummary").textContent = edition.summary || "Nessuna sintesi disponibile per questa edizione.";
  $("#heroDate").textContent = `Edizione di ${italianDate(edition.date)}`;
  document.title = `Briefing Quotidiano · ${italianDate(edition.date, false)}`;
  const grouped = Object.groupBy
    ? Object.groupBy(edition.items, item => item.category)
    : edition.items.reduce((result, item) => ((result[item.category] ||= []).push(item), result), {});
  $("#newsSections").innerHTML = categoryOrder.map(([key, label]) => renderSection(key, label, grouped[key] || [])).join("") + renderWeekend(edition.weekendEvents);
  renderUsageEstimate(edition);
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

function formatTokenRange(value) {
  if (!value || !Number.isFinite(value.min) || !Number.isFinite(value.max)) return "non disponibile";
  return `${value.min.toLocaleString("it-IT")}–${value.max.toLocaleString("it-IT")}`;
}

function formatEuroRange(value) {
  if (!value || !Number.isFinite(value.min) || !Number.isFinite(value.max)) return "non disponibile";
  return `${value.min.toFixed(4).replace(".", ",")}–${value.max.toFixed(4).replace(".", ",")} €`;
}

function modelCost(model, pricing) {
  const inputPrice = /sol/i.test(model.model) ? pricing.solInputPerMillion : pricing.inputPerMillion;
  const outputPrice = /sol/i.test(model.model) ? pricing.solOutputPerMillion : pricing.outputPerMillion;
  if (!model.inputTokens || !model.outputTokens || !Number.isFinite(inputPrice) || !Number.isFinite(outputPrice) || !Number.isFinite(pricing.usdToEur)) return null;
  return {
    min: ((model.inputTokens.min * inputPrice) + (model.outputTokens.min * outputPrice)) / 1000000 * pricing.usdToEur,
    max: ((model.inputTokens.max * inputPrice) + (model.outputTokens.max * outputPrice)) / 1000000 * pricing.usdToEur
  };
}

function renderUsageEstimate(edition) {
  const target = $("#usageTrackingContent");
  if (!target) return;
  const estimate = edition?.usageEstimate;
  if (!estimate || estimate.exact !== false) {
    target.textContent = "Non disponibile per questa edizione. Le stime vengono aggiunte solo alle nuove edizioni, senza ricostruzioni retroattive.";
    return;
  }
  const pricing = estimate.pricing || {};
  const models = Array.isArray(estimate.models) ? estimate.models : [];
  const rows = models.map(model => {
    const cost = modelCost(model, pricing);
    return `<tr><th scope="row">${model.model}</th><td>${formatTokenRange(model.inputTokens)}</td><td>${formatTokenRange(model.outputTokens)}</td><td>${formatEuroRange(cost)}</td></tr>`;
  }).join("");
  const total = estimate.apiEquivalentCostEUR;
  target.innerHTML = `<p class="usage-lead">Stima indicativa dell’equivalente API per questa edizione; non è il costo reale del piano Codex.</p><div class="usage-table-wrap"><table class="usage-table"><caption>Consumo giornaliero stimato · ${estimate.methodologyVersion || "metodologia non indicata"}</caption><thead><tr><th scope="col">Modello</th><th scope="col">Token input</th><th scope="col">Token output</th><th scope="col">Costo API equivalente</th></tr></thead><tbody>${rows || `<tr><td colspan="4">Dati per modello non disponibili.</td></tr>`}<tr class="usage-total"><th scope="row" colspan="3">Totale giornaliero</th><td>${formatEuroRange(total)}</td></tr></tbody></table></div><p class="usage-footnote">Intervalli indicativi. Prezzi di riferimento: Luna ${pricing.inputPerMillion ?? "n/d"}/${pricing.outputPerMillion ?? "n/d"} $/M input/output; Sol ${pricing.solInputPerMillion ?? "n/d"}/${pricing.solOutputPerMillion ?? "n/d"} $. Cambio: ${pricing.usdToEur ?? "n/d"} EUR/USD (${pricing.fxDate || "data n/d"}).</p>`;
}

function renderArchive() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  $("#archiveGrid").innerHTML = editions.map((edition, index) => `
    <button class="archive-button ${index === 0 ? "is-active" : ""}" data-date="${edition.date}" role="listitem">
      <span class="archive-day">${edition.date === today ? "Oggi" : new Intl.DateTimeFormat("it-IT", { weekday: "short" }).format(new Date(`${edition.date}T12:00:00`))}</span>
      <span class="archive-date">${italianDate(edition.date, false)}</span>
    </button>`).join("");
  document.querySelectorAll(".archive-button").forEach(button => button.addEventListener("click", () => {
    const edition = editions.find(item => item.date === button.dataset.date);
    renderEdition(edition, true);
  }));
}

$("#exportFeedback").addEventListener("click", exportFeedback);

fetch("data/editions.json", { cache: "no-cache" })
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
