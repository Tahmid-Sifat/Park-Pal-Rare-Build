type GenerateOptions = {
  temperature?: number;
  system?: string;
};

export async function generateText(prompt: string, _options: GenerateOptions = {}) {
  if (process.env.DEMO_MODE === "true" || !hasConfiguredKey()) {
    return [
      "Demo-mode ParkPal response.",
      "This deterministic provider is active because no external model key is configured.",
      prompt.slice(0, 500)
    ].join("\n\n");
  }

  const options = _options;
  const provider = process.env.LLM_PROVIDER || "openai";
  if (provider === "ollama") return callOllama(prompt, options);
  return callOpenAiCompatible(prompt, options);
}

export async function generateJson<T>(prompt: string, schema: T, options: GenerateOptions = {}): Promise<T> {
  await generateText(prompt, options);
  return schema;
}

function hasConfiguredKey() {
  const provider = process.env.LLM_PROVIDER || "openai";
  const keyByProvider: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    groq: process.env.GROQ_API_KEY,
    fireworks: process.env.FIREWORKS_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    lmstudio: process.env.LMSTUDIO_BASE_URL,
    ollama: process.env.OLLAMA_BASE_URL
  };
  return Boolean(keyByProvider[provider]);
}

function providerConfig() {
  const provider = process.env.LLM_PROVIDER || "openai";
  const configs: Record<string, { baseUrl: string; apiKey?: string; model?: string }> = {
    openai: { baseUrl: "https://api.openai.com/v1", apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
    openrouter: { baseUrl: "https://openrouter.ai/api/v1", apiKey: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini" },
    groq: { baseUrl: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || "llama-3.1-8b-instant" },
    fireworks: { baseUrl: "https://api.fireworks.ai/inference/v1", apiKey: process.env.FIREWORKS_API_KEY, model: process.env.FIREWORKS_MODEL },
    deepseek: { baseUrl: "https://api.deepseek.com/v1", apiKey: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL || "deepseek-chat" },
    lmstudio: { baseUrl: process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1", model: process.env.LMSTUDIO_MODEL || "local-model" }
  };
  return configs[provider] || configs.openai;
}

async function callOpenAiCompatible(prompt: string, options: GenerateOptions) {
  const config = providerConfig();
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
    },
    body: JSON.stringify({
      model: config.model,
      temperature: options.temperature ?? 0.2,
      messages: [
        ...(options.system ? [{ role: "system", content: options.system }] : []),
        { role: "user", content: prompt }
      ]
    })
  });
  if (!res.ok) return `Model provider error (${res.status}). Demo fallback: ${prompt.slice(0, 500)}`;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || "";
}

async function callOllama(prompt: string, options: GenerateOptions) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3.1",
      prompt: [options.system, prompt].filter(Boolean).join("\n\n"),
      stream: false,
      options: { temperature: options.temperature ?? 0.2 }
    })
  });
  if (!res.ok) return `Local model error (${res.status}). Demo fallback: ${prompt.slice(0, 500)}`;
  const data = (await res.json()) as { response?: string };
  return data.response || "";
}
