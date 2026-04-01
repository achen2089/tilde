import fs from "node:fs";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
}

function getConfig(): AIConfig {
  // Try OpenAI first, then Anthropic
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.TILDE_MODEL || "gpt-4o-mini",
    };
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return {
      provider: "anthropic",
      apiKey: anthropicKey,
      model: process.env.TILDE_MODEL || "claude-sonnet-4-20250514",
    };
  }

  throw new Error(
    "No API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable."
  );
}

async function callOpenAI(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as any;
  return data.choices[0].message.content;
}

async function callAnthropic(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system,
      messages: userMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as any;
  return data.content[0].text;
}

async function chat(messages: ChatMessage[]): Promise<string> {
  const config = getConfig();
  if (config.provider === "openai") {
    return callOpenAI(config, messages);
  }
  return callAnthropic(config, messages);
}

export async function polishFile(filePath: string): Promise<string> {
  const content = fs.readFileSync(filePath, "utf-8");

  const result = await chat([
    {
      role: "system",
      content: `You are a technical writing expert. You improve markdown documents by:
- Tightening prose (remove filler words, redundancy)
- Improving structure and headings
- Fixing grammar and formatting
- Making instructions clearer and more actionable
- Preserving the original intent and all important content

Return ONLY the improved markdown. No explanations, no wrapping.`,
    },
    {
      role: "user",
      content: `Improve this markdown document:\n\n${content}`,
    },
  ]);

  return result;
}

export async function generateMarkdown(description: string): Promise<string> {
  const result = await chat([
    {
      role: "system",
      content: `You are a markdown document generator. Given a description, create a well-structured markdown document.
- Use proper headings, lists, and formatting
- Be comprehensive but concise
- Include practical examples where relevant
- Use frontmatter if appropriate

Return ONLY the markdown. No explanations, no wrapping.`,
    },
    {
      role: "user",
      content: `Create a markdown document for: ${description}`,
    },
  ]);

  return result;
}
