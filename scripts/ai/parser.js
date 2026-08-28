/**
 * Parses the AI response with a multi-strategy fallback to prevent breakage.
 * It handles raw JSON, Markdown wrapped JSON, and partially malformed JSON.
 * 
 * @param {string} rawText The raw response from the LLM
 * @returns {Array|null} Array of suggestion objects, or null if unparseable
 */
export function parseAiResponse(rawText) {
  if (!rawText) return null;
  let cleanText = rawText.trim();
  
  // Strategy 1: Direct parse
  try {
    const result = JSON.parse(cleanText.replace(/```json/gi, "").replace(/```/g, "").trim());
    if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
  } catch(e) {}

  // Strategy 2: Extract bracket block
  try {
    const match = cleanText.match(/\[[\s\S]*\]/);
    if (match) {
      const result = JSON.parse(match[0]);
      if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
    }
  } catch(e) {}

  // Strategy 3: Extract object block and arrayify
  try {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      const obj = JSON.parse(match[0]);
      let arr = obj.suggestions || obj.fields || obj.configuration || null;
      if (!arr && obj.name && obj.value) arr = [obj];
      if (Array.isArray(arr) && arr.length > 0 && arr[0].name) return arr;
    }
  } catch(e) {}

  // Strategy 4: Trailing comma repair
  try {
    const repaired = cleanText.replace(/,\s*([}\]])/g, "$1");
    const match = repaired.match(/\[[\s\S]*\]/);
    if (match) {
      const result = JSON.parse(match[0]);
      if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
    }
  } catch(e) {}

  // Strategy 5: Partial regex recovery
  try {
    const regex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*(?:"([^"]+)"|([^,]+))\s*,\s*"reason"\s*:\s*"([^"]+)"\s*\}/g;
    const results = [];
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      let val = match[2] !== undefined ? match[2] : match[3].trim();
      if (!isNaN(Number(val))) val = Number(val);
      results.push({ name: match[1], value: val, reason: match[4] });
    }
    if (results.length > 0) return results;
  } catch(e) {}

  return null;
}
