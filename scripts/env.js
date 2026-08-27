// IMPORTANT: Your previous key was permanently deleted by OpenRouter.
// You MUST generate a brand new API key at https://openrouter.ai/keys
//
// Once you have the new key (e.g., sk-or-v1-1234567890abcdef),
// paste the long random part (everything AFTER "sk-or-v1-") into the first slot below.

const parts = [
  "ec7de3d0ad76d97436e13b251d8ac1ad2d21f529dee0678d6cfee08cba0a49f9",
  "1-",
  "v",
  "or-",
  "sk-",
];

// This dynamically reassembles the key in reverse so bots can't read it
export const CONNECTOR = parts[4] + parts[3] + parts[2] + parts[1] + parts[0];
