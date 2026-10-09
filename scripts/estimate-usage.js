const fs = require("fs");

const PRICING = { lunaInput: 0.20, lunaOutput: 1.20, solInput: 4, solOutput: 20, usdToEur: 0.8940 };
const VERSION = "2026-10-09-v1";

function argsToActivity(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--activity") return JSON.parse(fs.readFileSync(argv[++i], "utf8"));
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return args;
}

function number(value, name) {
  const result = Number(value ?? 0);
  if (!Number.isFinite(result) || result < 0) throw new Error(`${name} must be a non-negative number`);
  return Math.round(result);
}

function range(point, uncertainty) {
  return { min: Math.round(point * (1 - uncertainty)), max: Math.round(point * (1 + uncertainty)) };
}

function estimate(raw) {
  const activity = {
    date: String(raw.date || new Date().toISOString().slice(0, 10)),
    articles: number(raw.articles ?? raw.articleCount, "articles"),
    weekendEvents: number(raw.weekendEvents ?? raw.events, "weekendEvents"),
    searchCalls: number(raw.searchCalls, "searchCalls"),
    sourcePagesOpened: number(raw.sourcePagesOpened, "sourcePagesOpened"),
    solEscalations: number(raw.solEscalations, "solEscalations")
  };
  const lunaInput = range(7000 + activity.articles * 250 + activity.weekendEvents * 180 + activity.searchCalls * 450 + activity.sourcePagesOpened * 320, 0.20);
  const lunaOutput = range(1800 + activity.articles * 90 + activity.weekendEvents * 70, 0.25);
  const solInput = activity.solEscalations ? range(activity.solEscalations * 3500 + activity.sourcePagesOpened * 150, 0.25) : { min: 0, max: 0 };
  const solOutput = activity.solEscalations ? range(activity.solEscalations * 900, 0.30) : { min: 0, max: 0 };
  const models = [{ model: "gpt-5.6-luna", phase: "end-to-end", inputTokens: lunaInput, outputTokens: lunaOutput }];
  if (activity.solEscalations) models.push({ model: "gpt-5.6-sol", phase: "documented escalation", inputTokens: solInput, outputTokens: solOutput });
  const inputTokens = { min: lunaInput.min + solInput.min, max: lunaInput.max + solInput.max };
  const outputTokens = { min: lunaOutput.min + solOutput.min, max: lunaOutput.max + solOutput.max };
  const usd = value => value / 1e6;
  const cost = {
    min: (usd(lunaInput.min) * PRICING.lunaInput + usd(lunaOutput.min) * PRICING.lunaOutput + usd(solInput.min) * PRICING.solInput + usd(solOutput.min) * PRICING.solOutput) * PRICING.usdToEur,
    max: (usd(lunaInput.max) * PRICING.lunaInput + usd(lunaOutput.max) * PRICING.lunaOutput + usd(solInput.max) * PRICING.solInput + usd(solOutput.max) * PRICING.solOutput) * PRICING.usdToEur
  };
  return { exact: false, methodologyVersion: VERSION, activity, models, inputTokens, outputTokens, apiEquivalentCostEUR: cost, pricing: { inputPerMillion: PRICING.lunaInput, outputPerMillion: PRICING.lunaOutput, solInputPerMillion: PRICING.solInput, solOutputPerMillion: PRICING.solOutput, usdToEur: PRICING.usdToEur, fxDate: "2026-10-08", fxSource: "ECB reference rate; 1 EUR = 1.1186 USD" } };
}

const result = estimate(argsToActivity(process.argv.slice(2)));
if (result.exact !== false || !result.methodologyVersion || !result.models.length) throw new Error("invalid usageEstimate");
console.log(JSON.stringify(result, null, 2));
