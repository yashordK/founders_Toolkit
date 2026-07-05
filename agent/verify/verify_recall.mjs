// Shared grounding check for recall()-based skills, added after what first
// looked like model hallucination (see docs/OPEN_ITEMS.md and
// openclaw-skills/warm-intro/SKILL.md for the full story -- most of it turned
// out to be cognee's own session-turn logic misfiring because the calling
// scripts weren't passing a session_id, since fixed). A smaller residual risk
// of minor ungrounded embellishments remained even after that fix, which is
// what this guards against: it treats a recall() answer as an unverified
// CLAIM and checks it against the dataset's actual graph nodes (ground truth,
// no LLM synthesis involved in fetching it) before a skill relays the answer.
//
// This is a mitigation, not a fix: it catches claims with no grounding in the
// graph at all, not subtler distortions of real facts. Confirmed gap during
// testing: a model correctly cited a real last_interaction_date from the
// graph but got the date arithmetic wrong ("over three weeks" when it was 3
// days) -- the cited fact was real, so this check correctly passed it, but
// the conclusion drawn from it was still wrong. That category needs a
// different fix (computing staleness/birthday-proximity in code from the raw
// date fields, not asking the model to do date math) -- not attempted here.
// It also re-uses the same model for the verification call, so a model that
// hallucinates could in principle also mis-verify -- in practice, "is this
// claim supported by this text?" is a much more constrained task than
// open-ended synthesis, and testing below showed it reliably catching the
// fabrications that prompted this change.
//
// Known scaling limit: fetches the dataset's *entire* graph on every call.
// Fine for hackathon-scale data; would need pagination/filtering for a graph
// with thousands of nodes.
//
// Env:
//   COGNEE_BASE_URL      default http://localhost:8000
//   VERIFY_LLM_API_KEY   required (same key as cognee's LLM_API_KEY)
//   VERIFY_LLM_MODEL     default openrouter/nvidia/nemotron-3-ultra-550b-a55b:free
//   VERIFY_LLM_ENDPOINT  default https://openrouter.ai/api/v1

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const VERIFY_LLM_API_KEY = process.env.VERIFY_LLM_API_KEY;
const VERIFY_LLM_MODEL =
  process.env.VERIFY_LLM_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
const VERIFY_LLM_ENDPOINT = process.env.VERIFY_LLM_ENDPOINT || "https://openrouter.ai/api/v1";

// Internal bookkeeping fields not useful as "ground truth" for a fact check.
const NOISE_KEYS = new Set([
  "metadata",
  "version",
  "topological_rank",
  "ontology_valid",
  "feedback_weight",
  "importance_weight",
  "source_task",
  "source_pipeline",
  "source_user",
  "source_content_hash",
  "source_chunk_id",
  "source_node_set",
  "belongs_to_set",
  "external_metadata",
  "raw_data_location",
  "mime_type",
  "cut_type",
  "chunk_size",
  "chunk_index",
  "document_id",
]);

async function resolveDatasetId(datasetName) {
  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/datasets`);
  if (!resp.ok) throw new Error(`GET /datasets failed: ${resp.status}`);
  const datasets = await resp.json();
  const match = datasets.find((d) => d.name === datasetName);
  if (!match) throw new Error(`dataset not found: ${datasetName}`);
  return match.id;
}

async function fetchGroundTruth(datasetId) {
  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/datasets/${datasetId}/graph`);
  if (!resp.ok) throw new Error(`GET /datasets/${datasetId}/graph failed: ${resp.status}`);
  const { nodes } = await resp.json();
  const lines = [];
  for (const node of nodes || []) {
    if (node.type === "DocumentChunk" || node.type === "TextDocument") continue; // raw ingestion bookkeeping, not facts
    const props = Object.entries(node.properties || {})
      .filter(([k, v]) => !NOISE_KEYS.has(k) && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(", ");
    lines.push(`[${node.type}] ${node.label}: ${props}`);
  }
  return lines.join("\n");
}

// A free-text "reply VERIFIED or list problems" contract turned out too
// fragile in practice -- three different models each phrased a fully-verified
// result differently ("- \"VERIFIED\"", a full sentence, etc.), each breaking
// simple string matching. JSON with a fixed shape is far more robust to a
// model's phrasing tendencies than parsing prose for a magic word.
const VERIFY_SYSTEM_PROMPT = `You are a strict fact-checker. You will be given
GROUND TRUTH (the literal contents of a knowledge graph) and a CLAIM (a
generated answer that is supposed to be based only on that ground truth).

Check every specific, checkable fact in CLAIM (names, dates, task
descriptions, decisions, relationships) against GROUND TRUTH.

Respond with ONLY a single JSON object, no other text, matching exactly this
shape:
{"verified": <true if every specific fact in CLAIM is supported by GROUND TRUTH, else false>, "unsupported_facts": [<only the specific facts in CLAIM not supported by GROUND TRUTH, empty array if none>]}`;

function parseVerifierJson(raw) {
  // Strip markdown code fences and any leading/trailing prose some models add
  // despite being told not to -- find the first {...} block and parse that.
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`verifier response wasn't parseable as JSON: ${raw}`);
  }
  const parsed = JSON.parse(match[0]);
  if (typeof parsed.verified !== "boolean") {
    throw new Error(`verifier JSON missing boolean "verified" field: ${raw}`);
  }
  return parsed;
}

async function callVerifierLLM(groundTruth, claim) {
  if (!VERIFY_LLM_API_KEY) {
    throw new Error("VERIFY_LLM_API_KEY is not set -- cannot run the grounding check");
  }
  const resp = await fetch(`${VERIFY_LLM_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VERIFY_LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: VERIFY_LLM_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: VERIFY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `GROUND TRUTH:\n${groundTruth || "(empty -- the graph has no nodes)"}\n\nCLAIM:\n${claim}`,
        },
      ],
    }),
  });
  if (!resp.ok) {
    throw new Error(`verifier LLM call failed: ${resp.status} ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content.trim();
}

/**
 * Verify a recall() answer against the dataset's actual graph.
 * @returns {Promise<{verified: boolean, verdict: string}>}
 */
export async function verifyAgainstGraph({ datasetName, claim }) {
  const datasetId = await resolveDatasetId(datasetName);
  const groundTruth = await fetchGroundTruth(datasetId);
  const raw = await callVerifierLLM(groundTruth, claim);
  const { verified, unsupported_facts: unsupportedFacts = [] } = parseVerifierJson(raw);
  const verdict = verified
    ? "VERIFIED"
    : `Unsupported facts:\n${unsupportedFacts.map((f) => `- ${f}`).join("\n")}`;
  return { verified, verdict };
}
