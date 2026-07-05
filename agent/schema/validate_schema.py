"""Round-trip validation of the TRD.md Section 5 schema against the running,
self-hosted, Postgres-backed Cognee instance (docker compose --profile postgres,
see the sibling `cognee/` checkout for that stack).

What this proves, concretely:

1. remember() with a custom graph_model actually extracts Person/Meeting/Topic/
   Task-shaped nodes from free text (not cognee's generic default KnowledgeGraph
   entities).
2. A Person mentioned by name in two separate remember() calls (once as the root
   of an add-contact-shaped call, once nested inside a Meeting.attendees list)
   merges into a single graph node instead of creating a duplicate -- this is the
   crux of "creating new [Person nodes] as needed" from docs/TRD.md Section 6 and
   docs/IMPLEMENTATION_PLAN.md Step 4.
3. recall() can answer a question that requires combining both remember() calls.

This is a disposable diagnostic, not a fixture: it writes into a dataset named
"schema_validation_test" so it never touches whatever real dataset the skills end
up using. Delete that dataset before the demo (see the summary the script prints
at the end for the exact delete call).

Usage:
    agent/.venv/Scripts/python agent/schema/validate_schema.py
"""

import json
import sys
import time
from pathlib import Path

import requests

COGNEE_BASE_URL = "http://localhost:8000"
DATASET_NAME = "schema_validation_test"
GENERATED_DIR = Path(__file__).parent / "generated"

FAKE_CONTACT_TEXT = (
    "Aria Chen, met at TechCrunch Disrupt 2026 on 2026-06-30. She is the "
    "co-founder of a fintech startup. Her expertise includes fundraising and "
    "go-to-market strategy. She can help by making introductions to seed-stage "
    "VCs and reviewing pitch decks. Her birthday is 1991-03-14. "
    "Tags: founder, fintech, investor-network."
)

FAKE_MEETING_TEXT = (
    "Meeting: Fundraising Strategy Sync, held on 2026-07-03. "
    "Attendees: Aria Chen and Yash Upadhyay. "
    "Agenda: review seed round strategy and pricing model. "
    "Decisions: prioritize enterprise customers this quarter; target a $2M seed "
    "round. "
    "Action items: Yash Upadhyay to send the updated pitch deck to Aria Chen by "
    "2026-07-06, status open. "
    "Notes: Aria offered to make a warm introduction to a VC she knows who "
    "invests in fintech. "
    "Topics discussed: fundraising, pricing strategy."
)


def load_schema(name: str) -> dict:
    return json.loads((GENERATED_DIR / f"{name}.schema.json").read_text())


def remember(text: str, filename: str, graph_model: dict) -> dict:
    resp = requests.post(
        f"{COGNEE_BASE_URL}/api/v1/remember",
        data={
            "datasetName": DATASET_NAME,
            "graph_model": json.dumps(graph_model),
            "run_in_background": "false",
        },
        files={"data": (filename, text.encode("utf-8"), "text/plain")},
        timeout=300,
    )
    resp.raise_for_status()
    return resp.json()


def recall(query: str, search_type: str | None = None, scope: str | None = None) -> list:
    payload = {"query": query, "datasets": [DATASET_NAME], "topK": 15}
    if search_type is not None:
        payload["searchType"] = search_type
    if scope is not None:
        payload["scope"] = scope
    resp = requests.post(f"{COGNEE_BASE_URL}/api/v1/recall", json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json()


def section(title: str) -> None:
    print(f"\n{'=' * 10} {title} {'=' * 10}")


def main() -> int:
    person_schema = load_schema("person")
    meeting_schema = load_schema("meeting")

    section("remember() call 1 -- add-contact shaped (root: Person)")
    contact_result = remember(FAKE_CONTACT_TEXT, "contact.txt", person_schema)
    print(json.dumps(contact_result, indent=2)[:2000])

    section("remember() call 2 -- add-meeting shaped (root: Meeting)")
    meeting_result = remember(FAKE_MEETING_TEXT, "meeting.txt", meeting_schema)
    print(json.dumps(meeting_result, indent=2)[:2000])

    # Give the background embedding/indexing a moment to settle even though
    # run_in_background=false already blocked on the graph build itself.
    time.sleep(2)

    section("recall() -- GRAPH_COMPLETION (does the answer combine both calls?)")
    completion = recall(
        "Who is Aria Chen, what meetings has she attended, and what are the open "
        "action items from those meetings?",
        search_type="GRAPH_COMPLETION",
    )
    print(json.dumps(completion, indent=2)[:3000])

    section("recall() -- TRIPLET_COMPLETION (raw subject-predicate-object edges)")
    triplets = recall("Aria Chen", search_type="TRIPLET_COMPLETION")
    print(json.dumps(triplets, indent=2)[:5000])

    section("recall() -- graph_context scope (raw node/edge dump)")
    graph_ctx = recall("Aria Chen fundraising meeting", scope="graph_context")
    print(json.dumps(graph_ctx, indent=2)[:5000])

    section("Manual checklist -- inspect the output above for")
    print(
        "  [ ] A Person node named 'Aria Chen' with expertise/background/how_they_help "
        "populated from call 1\n"
        "  [ ] A Meeting node 'Fundraising Strategy Sync' with decisions/action_items\n"
        "  [ ] Exactly ONE 'Aria Chen' Person node, not two -- if TRIPLET_COMPLETION or "
        "graph_context shows two separate Aria Chen nodes, identity_fields-based merging "
        "did not work as expected and the schema/approach needs revisiting\n"
        "  [ ] An edge connecting Meeting -> Aria Chen (attendees) and Meeting -> a Task "
        "(action_items) and Meeting -> Topic 'fundraising' (discussed) -- note the edge "
        "direction/label will likely be the field name ('attendees'/'discussed'), not the "
        "verb TRD.md names ('attended'/'discussed') -- see summary for why this matters\n"
    )

    section("Cleanup (run manually once you're done inspecting)")
    print(
        f'  curl -X DELETE "{COGNEE_BASE_URL}/api/v1/datasets/<dataset-id>" '
        f"(look up <dataset-id> via GET {COGNEE_BASE_URL}/api/v1/datasets, "
        f'dataset_name="{DATASET_NAME}")'
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
