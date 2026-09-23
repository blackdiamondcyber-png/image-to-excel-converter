import { describe, it, expect } from "vitest";
import { parseTablesFromResponseText } from "../src/lib/claude.js";

// This exercises only the parse-and-repair step pulled out of
// extractTablesFromImage. No network call happens anywhere here: every
// input below is text a model could plausibly have returned, typed out by
// hand to match the shapes the repair logic in src/lib/claude.js exists to
// handle (markdown fences, surrounding prose, short rows, non-string cells).

const VALID_PAYLOAD = {
  tables: [
    {
      title: "Invoice Lines",
      headers: ["Item", "Qty", "Price"],
      rows: [
        ["Widget", "2", "9.99"],
        ["Gadget", "1", "19.99"],
      ],
    },
  ],
};

describe("parseTablesFromResponseText", () => {
  it("parses clean JSON with no fences or extra text", () => {
    const result = parseTablesFromResponseText(JSON.stringify(VALID_PAYLOAD));
    expect(result).toEqual([
      {
        title: "Invoice Lines",
        headers: ["Item", "Qty", "Price"],
        rows: [
          ["Widget", "2", "9.99"],
          ["Gadget", "1", "19.99"],
        ],
      },
    ]);
  });

  it("strips a ```json fenced code block around the payload", () => {
    const text = "```json\n" + JSON.stringify(VALID_PAYLOAD) + "\n```";
    const result = parseTablesFromResponseText(text);
    expect(result[0].title).toBe("Invoice Lines");
    expect(result[0].rows).toHaveLength(2);
  });

  it("strips a plain ``` fence with no json language tag", () => {
    const text = "```\n" + JSON.stringify(VALID_PAYLOAD) + "\n```";
    const result = parseTablesFromResponseText(text);
    expect(result[0].headers).toEqual(["Item", "Qty", "Price"]);
  });

  it("extracts the JSON object out of surrounding prose", () => {
    const text =
      "Here is the extracted data:\n" +
      JSON.stringify(VALID_PAYLOAD) +
      "\nLet me know if you need anything else.";
    const result = parseTablesFromResponseText(text);
    expect(result[0].title).toBe("Invoice Lines");
  });

  it("throws a clear error on JSON that still fails to parse after repair", () => {
    const text = "{ this is not valid json, the model trailed off";
    expect(() => parseTablesFromResponseText(text)).toThrow(
      "Failed to parse Claude response as JSON",
    );
  });

  it("throws when the tables key is missing", () => {
    const text = JSON.stringify({ notTables: [] });
    expect(() => parseTablesFromResponseText(text)).toThrow(
      "Claude response missing tables array",
    );
  });

  it("throws when tables is present but not an array", () => {
    const text = JSON.stringify({ tables: "oops" });
    expect(() => parseTablesFromResponseText(text)).toThrow(
      "Claude response missing tables array",
    );
  });

  it("drops tables with no headers or no rows instead of keeping empty ones", () => {
    const text = JSON.stringify({
      tables: [
        { title: "Empty headers", headers: [], rows: [["a"]] },
        { title: "Empty rows", headers: ["A"], rows: [] },
        { title: "Missing rows key", headers: ["A"] },
        VALID_PAYLOAD.tables[0],
      ],
    });
    const result = parseTablesFromResponseText(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Invoice Lines");
  });

  it("pads a short row out to the header count instead of dropping it", () => {
    const text = JSON.stringify({
      tables: [
        {
          title: "Short row",
          headers: ["Item", "Qty", "Price"],
          rows: [["Widget", "2"]],
        },
      ],
    });
    const result = parseTablesFromResponseText(text);
    expect(result[0].rows[0]).toEqual(["Widget", "2", ""]);
  });

  it("coerces non-string headers and cells to strings", () => {
    const text = JSON.stringify({
      tables: [
        {
          title: "Numeric cells",
          headers: ["Item", 2024],
          rows: [
            ["Widget", 2],
            [null, undefined],
          ],
        },
      ],
    });
    const result = parseTablesFromResponseText(text);
    expect(result[0].headers).toEqual(["Item", "2024"]);
    expect(result[0].rows[0]).toEqual(["Widget", "2"]);
    // null/undefined cells become "" rather than the strings "null"/"undefined"
    expect(result[0].rows[1]).toEqual(["", ""]);
  });

  it("falls back to a default title when the model omits one", () => {
    const text = JSON.stringify({
      tables: [{ headers: ["A"], rows: [["1"]] }],
    });
    const result = parseTablesFromResponseText(text);
    expect(result[0].title).toBe("Extracted Table");
  });

  it("treats a non-array row as empty and pads it out", () => {
    const text = JSON.stringify({
      tables: [
        {
          title: "Malformed row",
          headers: ["A", "B"],
          rows: ["not-an-array"],
        },
      ],
    });
    const result = parseTablesFromResponseText(text);
    expect(result[0].rows[0]).toEqual(["", ""]);
  });
});
