import { BaseProvider } from "./base-provider.js";

export class OpenRouterProvider extends BaseProvider {
  constructor(config) {
    super("OPENROUTER", config.OPENROUTER);
  }

  async sendChatCompletion(messages, signal) {
    const url = this.config.ENDPOINT;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.API_KEY}`,
        "HTTP-Referer": window.location.href, // Recommended for OpenRouter
        "X-Title": "BuildWise AI",
      },
      body: JSON.stringify({
        model: this.config.MODEL,
        max_tokens: 750, // Slightly higher to ensure large JSON arrays are not truncated
        messages: messages,
      }),
      signal: signal
    });

    if (!response.ok) {
      await this.handleHttpError(response);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    
    if (!rawText) {
      throw new Error("No content returned from OpenRouter AI.");
    }

    return rawText;
  }
}
