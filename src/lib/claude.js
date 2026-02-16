/**
 * Claude Vision API helper — SERVER-ONLY
 * Never import this file from client components.
 */

const EXTRACTION_PROMPT = `Analyze this image and extract ALL tabular data you can find. Return ONLY a valid JSON object with this exact structure, no markdown, no backticks, no explanation:
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
}
Rules:
- Extract every table, list, or structured data you see
- If data isn't clearly tabular, structure it into the most logical table format
- Keep all values as strings
- If there are multiple distinct tables, include them all in the "tables" array
- If you see a price list, invoice, form, or any structured content, convert it to tabular format
- Pad shorter rows with empty strings so every row has the same number of columns as headers
- Return ONLY the JSON, nothing else

CRITICAL — Transcription fidelity:
- Transcribe text EXACTLY as it appears in the image — do NOT add, remove, or change any characters
- Do NOT add periods, dots, slashes, or any punctuation that is not visibly present in the image
- Do NOT expand or correct abbreviations — copy them exactly as printed (e.g. if it says "QTY" keep "QTY", not "Qty.")
- Do NOT add trailing periods to words, names, descriptions, or abbreviations
- If a cell in the image has no period at the end, the extracted value must have no period at the end
- When in doubt, leave punctuation OUT rather than adding it`;

export async function extractTablesFromImage(base64Data, mediaType) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
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

  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Claude response as JSON");
  }

  if (!parsed.tables || !Array.isArray(parsed.tables)) {
    throw new Error("Claude response missing tables array");
  }

  return parsed.tables.map((t) => ({
    title: t.title || "Extracted Table",
    headers: t.headers || [],
    rows: (t.rows || []).map((row) => {
      // Pad rows to match header length
      const padded = [...row];
      while (padded.length < (t.headers || []).length) {
        padded.push("");
      }
      return padded.map(String);
    }),
  }));
}
