import { CONNECTOR, GROQ_KEY_1, GROQ_KEY_2 } from "../env.js?v=6";

export const AI_CONFIG = {
  // Provider failover sequence: Primary -> Secondary -> Tertiary
  PROVIDERS: ["OPENROUTER", "GROQ_PRIMARY", "GROQ_SECONDARY"],
  
  // Timeout per provider attempt (in ms)
  TIMEOUT_MS: 10000,
  
  // Max retries per specific provider (network errors only)
  MAX_RETRIES: 1,

  // Cache Time-To-Live in milliseconds (30 minutes)
  CACHE_TTL_MS: 30 * 60 * 1000,

  OPENROUTER: {
    API_KEY: CONNECTOR,
    ENDPOINT: "https://openrouter.ai/api/v1/chat/completions",
    MODEL: "google/gemini-2.5-flash",
  },
  
  GROQ_PRIMARY: {
    API_KEY: GROQ_KEY_1,
    ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
    MODEL: "openai/gpt-oss-20b",
  },

  GROQ_SECONDARY: {
    API_KEY: GROQ_KEY_2,
    ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
    MODEL: "openai/gpt-oss-20b",
  }
};
