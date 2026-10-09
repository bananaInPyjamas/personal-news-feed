const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "editions.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const categories = new Set(["germany", "italy", "world", "ai", "robotics", "automotive", "business", "events"]);
const errors = [];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTime = /^\d{4}-\d{2}-\d{2}T/;
const url = /^https?:\/\//;
const editions = data.editions;

if (!Array.isArray(editions)) errors.push("editions must be an array");
const ids = new Set();
for (const [editionIndex, edition] of (editions || []).entries()) {
  if (!isoDate.test(edition.date)) errors.push(`edition ${editionIndex}: invalid date`);
  if (!isoDateTime.test(edition.updatedAt)) errors.push(`edition ${edition.date}: invalid updatedAt`);
  if (typeof edition.summary !== "string" || !edition.summary.trim()) errors.push(`edition ${edition.date}: missing summary`);
  if (!Array.isArray(edition.items)) errors.push(`edition ${edition.date}: items must be an array`);
  for (const item of edition.items || []) {
    if (!item.id || ids.has(item.id)) errors.push(`duplicate or missing id: ${item.id || "(missing)"}`);
    ids.add(item.id);
    if (!categories.has(item.category)) errors.push(`${item.id}: unknown category`);
    if (!url.test(item.url || "")) errors.push(`${item.id}: invalid url`);
  }
  if (edition.weekendEvents && edition.weekendEvents.length && new Date(`${edition.date}T12:00:00Z`).getUTCDay() !== 5) {
    errors.push(`${edition.date}: weekendEvents are Friday-only`);
  }
  const estimate = edition.usageEstimate;
  if (estimate !== undefined) {
    if (estimate.exact !== false) errors.push(`${edition.date}: usageEstimate.exact must be false`);
    if (typeof estimate.methodologyVersion !== "string" || !estimate.methodologyVersion) errors.push(`${edition.date}: missing usage methodologyVersion`);
    for (const key of ["inputTokens", "outputTokens", "apiEquivalentCostEUR"]) {
      const range = estimate[key];
      if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min < 0 || range.max < range.min) {
        errors.push(`${edition.date}: invalid usageEstimate.${key} range`);
      }
    }
    if (!Array.isArray(estimate.models) || !estimate.models.length || estimate.models.some(model => !model.model || !model.phase)) {
      errors.push(`${edition.date}: usageEstimate.models must list model and phase`);
    }
    const activity = estimate.activity;
    if (!activity || !isoDate.test(activity.date) || ["articles", "weekendEvents", "searchCalls", "sourcePagesOpened", "solEscalations"].some(key => !Number.isInteger(activity[key]) || activity[key] < 0)) {
      errors.push(`${edition.date}: usageEstimate.activity must record non-negative counters`);
    }
    if ((estimate.models || []).some(model => !model.inputTokens || !model.outputTokens)) errors.push(`${edition.date}: each usage model needs inputTokens/outputTokens ranges`);
    const pricing = estimate.pricing;
    if (!pricing || pricing.inputPerMillion !== 0.2 || pricing.outputPerMillion !== 1.2 || pricing.solInputPerMillion !== 4 || pricing.solOutputPerMillion !== 20 || !Number.isFinite(pricing.usdToEur) || !pricing.fxDate || !pricing.fxSource) {
      errors.push(`${edition.date}: usageEstimate pricing must document Luna reference prices and FX`);
    }
  }
}

if (errors.length) {
  console.error(errors.map(error => `ERROR: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${editions.length} edition(s), ${ids.size} item(s); optional usageEstimate fields are valid.`);
}
