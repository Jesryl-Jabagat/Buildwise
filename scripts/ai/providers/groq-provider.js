import { BaseProvider } from "./base-provider.js";

export class GroqProvider extends BaseProvider {
  constructor(name, config) {
    super(name, config);
  }

  async sendChatCompletion(messages, signal) {
    const url = this.config.ENDPOINT;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.API_KEY}`,
      },
      body: JSON.stringify({
        model: this.config.MODEL,
        max_tokens: 750,
        temperature: 0.5, // Slightly lower temp for strict JSON adherence
        response_format: { type: "json_object" }, // Enforce JSON format output supported by Groq
        // Note: For json_object to work on Groq, the system prompt must explicitly ask for JSON
        // We handle this by wrapping the messages output in an object if needed, but our prompt already does this.
        messages: this.ensureJsonObjectPrompt(messages)
      }),
      signal: signal
    });

    if (!response.ok) {
      await this.handleHttpError(response);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    
    if (!rawText) {
      throw new Error("No content returned from Groq AI.");
    }

    return rawText;
  }

  /**
   * Groq's json_object mode requires the model output to be a valid JSON object (not a bare array).
   * We subtly adjust the system prompt for Groq to ensure it outputs { "suggestions": [...] }
   */
  ensureJsonObjectPrompt(messages) {
    return messages.map(msg => {
      if (msg.role === "system") {
        return {
          ...msg,
          content: msg.content.replace(
            "OUTPUT STRICT JSON ARRAY OF OBJECTS ONLY: [{", 
            "OUTPUT STRICT JSON OBJECT ONLY WITH A 'suggestions' ARRAY: { \"suggestions\": [{"
          )
        };
      }
      return msg;
    });
  }
}
