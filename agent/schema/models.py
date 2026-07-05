"""Canonical graph schema for Founder's Second Brain, mirroring docs/TRD.md Section 5.

These are plain pydantic BaseModels, not cognee DataPoint subclasses -- cognee's
graph_model_to_graph_schema/graph_schema_to_graph_model round trip (see
cognee/shared/graph_model_utils.py in the cognee checkout) expects models authored
this way and rebinds them onto DataPoint dynamically at ingestion time.

Two root models are exposed, matching the two capture skills that will submit data:

- Person: what the add-contact skill remembers.
- Meeting: what the add-meeting skill remembers.

Both reference Topic and (Meeting only) Task as nested types. Person and Topic
declare identity_fields=["name"] so cognee derives the same deterministic node id
for the same name every time (see DataPoint.id_for), which is what lets a Person
mentioned in a Meeting.attendees list merge with the Person node created earlier
by a standalone add-contact call, instead of creating a duplicate.

Deliberate simplifications vs. a literal reading of TRD.md Section 5 -- flagged
in docs/OPEN_ITEMS.md, not silently applied:

1. Person.met_at is a plain string (event/meeting title) rather than a nested
   Meeting object. A true Person<->Meeting bidirectional type reference would be
   a recursive schema (Meeting.attendees: list[Person] and Person.met_at: Meeting),
   which is an untested edge case for cognee's JSON-schema-to-pydantic conversion.
   Keeping it a string sidesteps that risk for this validation pass.
2. Task has no linked_to back-reference field. Task only ever appears nested
   under Meeting.action_items, so the parent/child nesting itself produces the
   "Task --from--> Meeting" edge; an explicit field would be redundant.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Topic(BaseModel):
    name: str
    metadata: dict = {"index_fields": ["name"], "identity_fields": ["name"]}


class Task(BaseModel):
    description: str
    due_date: Optional[str] = None
    status: str = "open"
    metadata: dict = {"index_fields": ["description"]}


class Person(BaseModel):
    name: str
    expertise: list[Topic] = []
    background: Optional[str] = None
    how_they_help: Optional[str] = None
    met_at: Optional[str] = None
    met_date: Optional[str] = None
    birthday: Optional[str] = None
    last_interaction_date: Optional[str] = None
    tags: list[str] = []
    metadata: dict = {"index_fields": ["name"], "identity_fields": ["name"]}


class Meeting(BaseModel):
    title: str
    date: Optional[str] = None
    agenda: Optional[str] = None
    decisions: list[str] = []
    action_items: list[Task] = []
    notes: Optional[str] = None
    attendees: list[Person] = []
    discussed: list[Topic] = []
    metadata: dict = {"index_fields": ["title"], "identity_fields": ["title"]}


ROOT_MODELS = {
    "Person": Person,
    "Meeting": Meeting,
}
