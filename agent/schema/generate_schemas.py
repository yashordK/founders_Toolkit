"""Dump each root model in models.py to a standalone JSON schema file.

Run this whenever models.py changes:

    agent/.venv/Scripts/python agent/schema/generate_schemas.py

The generated files are the exact `graph_model` payload cognee's /api/v1/remember
and /api/v1/cognify endpoints expect (a JSON-serialised pydantic schema with a
top-level "title" key). They're committed to the repo so skills and validation
scripts can load a static file at runtime instead of re-deriving it from Python.
"""

import json
from pathlib import Path

from pydantic.json_schema import GenerateJsonSchema
from pydantic._internal._core_utils import CoreSchemaOrField, is_core_schema

from models import ROOT_MODELS

GENERATED_DIR = Path(__file__).parent / "generated"


class GenerateJsonSchemaWithoutDefaultTitles(GenerateJsonSchema):
    """Matches cognee's own schema generator (cognee/shared/graph_model_utils.py)
    so the output round-trips through cognee's JsonSchema-to-pydantic conversion
    the same way a model authored inside the cognee checkout would.
    """

    def field_title_should_be_set(self, schema: CoreSchemaOrField) -> bool:
        return_value = super().field_title_should_be_set(schema)
        if return_value and is_core_schema(schema):
            return False
        return return_value


def main() -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    for name, model in ROOT_MODELS.items():
        schema = model.model_json_schema(schema_generator=GenerateJsonSchemaWithoutDefaultTitles)
        out_path = GENERATED_DIR / f"{name.lower()}.schema.json"
        out_path.write_text(json.dumps(schema, indent=2) + "\n")
        print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
