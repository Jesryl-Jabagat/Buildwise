import { AI_CONFIG } from "./config.js";
import { getCachedSuggestions, setCachedSuggestions } from "./cache.js";
import { aiCircuitBreaker } from "./circuit-breaker.js";
import { parseAiResponse } from "./parser.js";
import { buildChatMessages, extractFormSchema } from "./prompts.js";
import { OpenRouterProvider } from "./providers/openrouter-provider.js";
import { GroqProvider } from "./providers/groq-provider.js";
import { generateSmartFallback } from "./fallback-generator.js";

// Provider Registry
const PROVIDERS = {
  OPENROUTER: new OpenRouterProvider(AI_CONFIG),
  GROQ_PRIMARY: new GroqProvider("GROQ_PRIMARY", AI_CONFIG.GROQ_PRIMARY),
  GROQ_SECONDARY: new GroqProvider("GROQ_SECONDARY", AI_CONFIG.GROQ_SECONDARY)
};

/**
 * Main orchestrator for AI generation.
 * Handles cache checks, multi-provider fallback routing, circuit breaking, and smart rule-based fallback.
 */
export async function generateAiConfiguration(form, typeKey, setupData) {
  const schema = extractFormSchema(form);
  
  // Create a cache key using the stable input parameters (ignore random persona/seed)
  const cacheKeyStr = JSON.stringify({ typeKey, setupData, schema });
  
  // 1. Check Cache
  const cached = getCachedSuggestions(cacheKeyStr);
  if (cached) return cached;

  const messages = buildChatMessages(typeKey, setupData, schema);

  // 2. Iterate through fallback sequence (OpenRouter -> Groq 1 -> Groq 2)
  let lastError = null;

  for (const providerName of AI_CONFIG.PROVIDERS) {
    // Check Circuit Breaker
    if (!aiCircuitBreaker.isHealthy(providerName)) {
      console.warn(`⏭️ Skipping ${providerName} (Circuit Breaker OPEN)`);
      continue;
    }

    console.log(`🤖 Attempting AI generation with ${providerName}...`);
    const provider = PROVIDERS[providerName];
    if (!provider) continue;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

    try {
      // Execute the call
      const rawText = await provider.sendChatCompletion(messages, controller.signal);
      clearTimeout(timeoutId);

      // Parse JSON (resilient)
      const suggestions = parseAiResponse(rawText);
      if (suggestions && suggestions.length > 0) {
        // Success!
        console.log(`✅ Success with ${providerName}`);
        
        // Update Cache
        setCachedSuggestions(cacheKeyStr, suggestions);
        
        return suggestions;
      } else {
        throw new Error(`Parse failure. Output format invalid from ${providerName}`);
      }

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      
      const isAbort = error.name === 'AbortError';
      if (isAbort) {
        console.warn(`⏱️ Timeout exceeded for ${providerName}`);
      } else {
        console.warn(`❌ Error with ${providerName}:`, error.message);
      }
      
      // Update circuit breaker on hard errors
      aiCircuitBreaker.recordFailure(providerName, error);
    }
  }

  // 3. 🚨 TIER 4: Ultimate Safety Net. If all 3 cloud providers fail or timeout, use Deterministic Rule-Based Fallback
  console.error("🚨 All AI Cloud providers failed. Executing Zero-Downtime Deterministic Fallback.");
  const fallbackSuggestions = generateSmartFallback(form, typeKey, setupData);
  
  if (fallbackSuggestions && fallbackSuggestions.length > 0) {
     return fallbackSuggestions;
  }
  
  throw lastError || new Error("All configured AI providers and fallback generator failed.");
}
