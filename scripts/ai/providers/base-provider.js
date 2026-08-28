/**
 * Abstract Base Provider defining the standard interface for all AI API clients.
 */
export class BaseProvider {
  constructor(name, config) {
    this.name = name;
    this.config = config;
  }

  /**
   * Main interface method to execute chat completions.
   * Must be implemented by subclasses.
   * @param {Array} messages Array of role/content message objects.
   * @param {AbortSignal} signal AbortController signal for timeouts.
   * @returns {string} Raw JSON string response from the LLM.
   */
  async sendChatCompletion(messages, signal) {
    throw new Error(`sendChatCompletion() not implemented in provider ${this.name}`);
  }

  /**
   * Helper to parse standard fetch HTTP errors.
   */
  async handleHttpError(response) {
    let errText = "";
    try {
      errText = await response.text();
    } catch (e) {
      errText = "Unreadable response body";
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("AUTH_ERROR: " + errText);
    }
    if (response.status === 402) {
      throw new Error("INSUFFICIENT_CREDITS: " + errText);
    }
    if (response.status === 429) {
      throw new Error("RATE_LIMIT: " + errText);
    }
    if (response.status >= 500) {
      throw new Error("SERVER_ERROR: " + errText);
    }
    
    throw new Error(`HTTP_${response.status}: ` + errText);
  }
}
