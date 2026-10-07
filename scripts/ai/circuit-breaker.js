/**
 * Circuit Breaker tracks provider health across the session.
 * If a provider returns a persistent error (like 402 out of credits),
 * it is marked as 'OPEN' (disabled) so we don't waste time retrying it.
 */
class CircuitBreaker {
  constructor() {
    this.states = {}; // { providerName: 'CLOSED' | 'OPEN' }
  }

  /**
   * Checks if a provider is allowed to be called.
   * @param {string} providerName 
   * @returns {boolean} true if healthy (CLOSED), false if disabled (OPEN)
   */
  isHealthy(providerName) {
    if (!this.states[providerName]) {
      this.states[providerName] = 'CLOSED'; // Default healthy state
    }
    return this.states[providerName] === 'CLOSED';
  }

  /**
   * Registers a failure. Some errors (like INSUFFICIENT_CREDITS) trigger an immediate OPEN state.
   */
  recordFailure(providerName, error) {
    const errorMsg = error?.message || String(error);
    
    // Immediate disable conditions
    if (errorMsg.includes("INSUFFICIENT_CREDITS") || errorMsg.includes("AUTH_ERROR")) {
      console.warn(`🛑 Circuit Breaker tripped for ${providerName}: Permanent error detected.`);
      this.states[providerName] = 'OPEN';
    } else {
      // For rate limits or temporary server errors, we might implement a half-open state or counter later.
      // For now, we allow retries on transient errors on the next attempt.
      console.warn(`⚠️ Circuit Breaker logged transient error for ${providerName}: ${errorMsg}`);
    }
  }

  /**
   * Resets a provider to healthy state (useful if we want to manually re-test).
   */
  reset(providerName) {
    this.states[providerName] = 'CLOSED';
  }
}

export const aiCircuitBreaker = new CircuitBreaker();
