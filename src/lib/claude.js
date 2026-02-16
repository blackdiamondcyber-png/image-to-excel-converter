/**
 * Claude Vision API helper — SERVER-ONLY
 * Never import this file from client components.
 */

const SYSTEM_MESSAGE = `You are an expert document analyst with perfect vision. You extract tabular data from photos of paper documents with 100% fidelity. You never hallucinate or repeat rows.`;

const EXTRACTION_PROMPT = `Extract ALL tabular data from this image of a paper document.

**Step 1 — Identify structure:**
Count the columns (note each header) and count the exact number of data rows.

**Step 2 — Extract every row:**
Read each row top-to-bottom, left-to-right. For every cell:
- Transcribe EXACTLY what is printed — no added punctuation, no corrected abbreviations.
- Empty cells → "". Unclear text → "[unclear]".

**Step 3 — Verify:**
- Each row must be UNIQUE (unless truly identical in the image). NEVER duplicate rows.
- Row count must match what you counted in Step 1.
- Every row must have the same number of values as headers (pad with "" if needed).

Return ONLY this JSON (no markdown fences, no other text):
{"tables":[{"title":"...","headers":["Col1","Col2"],"rows":[["val1","val2"]]}]}`;

export async function extractTablesFromImage(base64Data, mediaType) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
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
