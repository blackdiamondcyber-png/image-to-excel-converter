/**
 * Claude Vision API helper — SERVER-ONLY
 * Never import this file from client components.
 */

const SYSTEM_MESSAGE = `You are an expert document analyst with perfect vision and meticulous attention to detail. Your specialty is extracting tabular data from photographs of documents with 100% fidelity. You never guess, hallucinate, or repeat data — every value you output was read directly from the image.`;

const EXTRACTION_PROMPT = `Extract ALL tabular data from this image. Follow these steps carefully:

**Step 1 — Survey the image:**
Identify how many distinct tables are in the image. Note the boundaries of each.

**Step 2 — For each table, analyze its structure:**
- Count the exact number of columns and identify each column header.
- Count the exact number of data rows (excluding the header row).
- A table with N data rows must produce exactly N rows in the output.

**Step 3 — Extract row by row:**
Read each row from top to bottom, left to right. For every cell:
- Transcribe the EXACT text visible in the image.
- Do NOT add any punctuation (periods, dots, slashes, commas) that is not visibly printed.
- Do NOT expand or correct abbreviations — copy them exactly as printed.
- If a cell is empty or blank, use an empty string "".
- If a cell is partially obscured, transcribe what you can see and use "[unclear]" for unreadable parts.

**Step 4 — Self-check:**
- Verify that each row in your output is UNIQUE (unless two rows are truly identical in the image).
- Verify the number of output rows matches the number you counted in Step 2.
- Verify every row has the same number of values as there are column headers (pad with "" if needed).

**CRITICAL anti-hallucination rules:**
- NEVER copy-paste the same row multiple times. Each row must be independently read from the image.
- If you cannot read a row clearly, output it with "[unclear]" markers rather than duplicating another row.
- Different rows that look similar STILL have different data — read each one independently.

**Transcription fidelity:**
- Transcribe text EXACTLY as it appears — do NOT add, remove, or change any characters.
- Do NOT add periods, dots, slashes, or any punctuation not visibly present in the image.
- Do NOT expand or correct abbreviations — copy them exactly as printed (e.g. if it says "QTY" keep "QTY", not "Qty.").
- When in doubt, leave punctuation OUT rather than adding it.

Return a JSON object with this exact structure (no markdown fences, no explanation outside the JSON):
{
  "tables": [
    {
      "title": "Brief description of the table",
      "headers": ["Column1", "Column2", ...],
      "rows": [
        ["value1", "value2", ...],
        ["value1", "value2", ...]
      ]
    }
  ]
}`;

export async function extractTablesFromImage(base64Data, mediaType) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 16384,
      temperature: 0,
      system: SYSTEM_MESSAGE,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Anthropic API error: ${response.status}`
    );
  }

  const data = await response.json();

  const text = data.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");

  // Strip markdown fences and extract the JSON object from any surrounding text
  let cleaned = text.replace(/```json|```/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Claude response as JSON");
  }

  if (!parsed.tables || !Array.isArray(parsed.tables)) {
    throw new Error("Claude response missing tables array");
  }

  return parsed.tables
    .filter((t) => Array.isArray(t.headers) && t.headers.length > 0 && Array.isArray(t.rows) && t.rows.length > 0)
    .map((t) => ({
      title: t.title || "Extracted Table",
      headers: t.headers.map(String),
      rows: t.rows.map((row) => {
        const arr = Array.isArray(row) ? row : [];
        // Pad rows to match header length
        const padded = [...arr];
        while (padded.length < t.headers.length) {
          padded.push("");
        }
        return padded.map((cell) => String(cell ?? ""));
      }),
    }));
}
