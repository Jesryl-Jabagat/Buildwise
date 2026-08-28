import { AI_CONFIG } from "./config.js";

/**
 * Generates a consistent hash string for caching AI requests based on the prompt or input parameters.
 * Uses a simple fast hash algorithm for browser use.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Returns cached suggestions if they exist and are not expired.
 * @param {string} prompt The full prompt string used to generate the cache key.
 * @returns {Array|null} Parsed suggestions array, or null if miss/expired.
 */
export function getCachedSuggestions(prompt) {
  try {
    const key = "ai_cache_" + hashString(prompt);
    const cachedItem = sessionStorage.getItem(key);
    
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      
      // Check expiration
      if (Date.now() - timestamp < AI_CONFIG.CACHE_TTL_MS) {
        console.log("⚡ AI Cache Hit: Serving instant results");
        return data;
      } else {
        // Expired
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn("Cache read error:", e);
  }
  return null;
}

/**
 * Saves suggestions to sessionStorage.
 * @param {string} prompt The full prompt string used to generate the cache key.
 * @param {Array} data The parsed suggestions array.
 */
export function setCachedSuggestions(prompt, data) {
  try {
    const key = "ai_cache_" + hashString(prompt);
    const cacheObject = {
      timestamp: Date.now(),
      data: data
    };
    sessionStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (e) {
    console.warn("Cache write error:", e);
  }
}
