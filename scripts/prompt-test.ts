#!/usr/bin/env -S node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { DeepSeekConfigError, transformSentence, type TransformResult } from "../lib/deepseek";
import { MAX_SENTENCE_LENGTH, normalizeSentence } from "../lib/transform";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

type Options = {
  prompt: string | null;
  promptFile: string | null;
  system: string | null;
  systemFile: string | null;
  model: string;
  temperature: number;
  maxTokens: number;
  jsonMode: boolean;
  sentenceTransform: boolean;
  interactive: boolean;
  help: boolean;
};

function printHelp() {
  console.log(`Prompt testing CLI (DeepSeek)

Usage:
  npm run prompt:test -- [options]

Options:
  --prompt, -p <text>          Prompt text to send as user message
  --prompt-file <path>         Load prompt text from file
  --system, -s <text>          Optional system message
  --system-file <path>         Load system message from file
  --model <name>               Model name (default: deepseek-chat)
  --temperature <number>       Temperature (default: 0.3)
  --max-tokens <number>        Max response tokens (default: 512)
  --json-mode                  Ask model to return a JSON object
  --sentence-transform         Use the exact same sentence transform path as the web app API
  --interactive, -i            Interactive loop mode
  --help, -h                   Show this help

Examples:
  npm run prompt:test -- -p "Rewrite this in one sentence"
  npm run prompt:test -- --sentence-transform -p "I don't like him, i like you"
  npm run prompt:test -- --system-file prompts/system.txt --prompt-file prompts/input.txt
  npm run prompt:test -- -i --system "You are a concise editor"
`);
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    prompt: null,
    promptFile: null,
    system: null,
    systemFile: null,
    model: "deepseek-chat",
    temperature: 0.3,
    maxTokens: 512,
    jsonMode: false,
    sentenceTransform: false,
    interactive: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--prompt" || arg === "-p") {
      options.prompt = argv[++i] ?? null;
      continue;
    }

    if (arg === "--prompt-file") {
      options.promptFile = argv[++i] ?? null;
      continue;
    }

    if (arg === "--system" || arg === "-s") {
      options.system = argv[++i] ?? null;
      continue;
    }

    if (arg === "--system-file") {
      options.systemFile = argv[++i] ?? null;
      continue;
    }

    if (arg === "--model") {
      options.model = argv[++i] ?? options.model;
      continue;
    }

    if (arg === "--temperature") {
      const value = Number(argv[++i]);

      if (Number.isNaN(value)) {
        throw new Error("--temperature must be a number");
      }

      options.temperature = value;
      continue;
    }

    if (arg === "--max-tokens") {
      const value = Number(argv[++i]);

      if (!Number.isInteger(value) || value <= 0) {
        throw new Error("--max-tokens must be a positive integer");
      }

      options.maxTokens = value;
      continue;
    }

    if (arg === "--json-mode") {
      options.jsonMode = true;
      continue;
    }

    if (arg === "--sentence-transform") {
      options.sentenceTransform = true;
      continue;
    }

    if (arg === "--interactive" || arg === "-i") {
      options.interactive = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

async function loadTextFromFile(filePath: string) {
  const resolved = path.resolve(process.cwd(), filePath);
  return fs.readFile(resolved, "utf8");
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalIndex = trimmed.indexOf("=");

      if (equalIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, equalIndex).trim();
      const value = stripWrappingQuotes(trimmed.slice(equalIndex + 1).trim());

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional; shell-exported env vars also work.
  }
}

async function readPipedInput() {
  if (input.isTTY) {
    return "";
  }

  const chunks: string[] = [];

  for await (const chunk of input) {
    chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
  }

  return chunks.join("").trim();
}

function buildMessages(prompt: string, system: string) {
  const messages: Array<{ role: "system" | "user"; content: string }> = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });
  return messages;
}

async function requestCompletion({
  apiKey,
  model,
  temperature,
  maxTokens,
  jsonMode,
  prompt,
  system,
}: {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  jsonMode: boolean;
  prompt: string;
  system: string;
}) {
  const body: Record<string, unknown> = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: buildMessages(prompt, system),
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const startedAt = Date.now();
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const elapsedMs = Date.now() - startedAt;
  const payload = (await response.json().catch(() => null)) as
    | {
        choices?: Array<{ message?: { content?: string | null } }>;
        usage?: unknown;
      }
    | null;

  if (!response.ok) {
    const details = payload ? JSON.stringify(payload) : "No response body";
    throw new Error(`API error ${response.status}: ${details}`);
  }

  return {
    content: payload?.choices?.[0]?.message?.content ?? "",
    usage: payload?.usage ?? null,
    elapsedMs,
  };
}

async function resolveSystemPrompt(options: Options) {
  if (options.systemFile) {
    return (await loadTextFromFile(options.systemFile)).trim();
  }

  return options.system?.trim() || "";
}

async function resolveOneShotPrompt(options: Options) {
  if (options.promptFile) {
    return (await loadTextFromFile(options.promptFile)).trim();
  }

  if (options.prompt) {
    return options.prompt.trim();
  }

  const piped = await readPipedInput();

  if (piped) {
    return piped;
  }

  return "";
}

function normalizeAndValidateSentence(text: string) {
  const sentence = normalizeSentence(text);

  if (!sentence) {
    throw new Error("Sentence is required.");
  }

  if (sentence.length > MAX_SENTENCE_LENGTH) {
    throw new Error(`Sentence must be ${MAX_SENTENCE_LENGTH} characters or fewer.`);
  }

  return sentence;
}

async function runSentenceTransform(sentence: string) {
  const startedAt = Date.now();
  const result: TransformResult = await transformSentence(normalizeAndValidateSentence(sentence));

  return {
    content: JSON.stringify(result.transformation, null, 2),
    source: result.source,
    elapsedMs: Date.now() - startedAt,
  };
}

async function runInteractive(options: Options, apiKey: string, system: string) {
  const rl = readline.createInterface({ input, output });

  console.log("Interactive mode started. Type /exit to quit.");

  while (true) {
    const prompt = (await rl.question("\n> ")).trim();

    if (!prompt) {
      continue;
    }

    if (prompt === "/exit" || prompt === "/quit") {
      break;
    }

    try {
      if (options.sentenceTransform) {
        const result = await runSentenceTransform(prompt);
        console.log("\n--- response ---");
        console.log(result.content);
        console.log(`\n[${result.elapsedMs} ms]`);
        console.log(`[source] ${result.source}`);
        continue;
      }

      const result = await requestCompletion({
        apiKey,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        jsonMode: options.jsonMode,
        prompt,
        system,
      });

      console.log("\n--- response ---");
      console.log(result.content || "(empty response)");
      console.log(`\n[${result.elapsedMs} ms]`);

      if (result.usage) {
        console.log(`[usage] ${JSON.stringify(result.usage)}`);
      }
    } catch (error) {
      console.error(`\nRequest failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  rl.close();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  await loadDotEnv();

  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY. Add it to .env or export it in your shell.");
  }

  const system = await resolveSystemPrompt(options);

  if (options.interactive) {
    await runInteractive(options, apiKey, system);
    return;
  }

  const prompt = await resolveOneShotPrompt(options);

  if (!prompt) {
    throw new Error("No prompt provided. Use --prompt, --prompt-file, stdin, or --interactive.");
  }

  if (options.sentenceTransform) {
    const result = await runSentenceTransform(prompt);
    console.log(result.content);
    console.error(`\n[${result.elapsedMs} ms]`);
    console.error(`[source] ${result.source}`);
    return;
  }

  const result = await requestCompletion({
    apiKey,
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    jsonMode: options.jsonMode,
    prompt,
    system,
  });

  console.log(result.content || "(empty response)");
  console.error(`\n[${result.elapsedMs} ms]`);

  if (result.usage) {
    console.error(`[usage] ${JSON.stringify(result.usage)}`);
  }
}

main().catch((error) => {
  if (error instanceof DeepSeekConfigError) {
    console.error(error.message);
    process.exit(1);
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
