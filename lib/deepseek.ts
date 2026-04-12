import {
  getDeepSeekRuntimeConfig,
} from "@/lib/deepseek-config";
import { coerceTransformation, createLocalTransformation, type Transformation } from "@/lib/transform";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export class DeepSeekConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekConfigError";
  }
}

function buildPrompt(sentence: string) {
  return [
    "Return valid json only.",
    "",
    "Transform the user's sentence as if it passes through a medium in four combined conditions:",
    "1. retention",
    "2. fragmentation",
    "3. misquotation",
    "4. residue",
    "",
    "These are not separate random categories. The outputs should collectively feel like a progression:",
    "first the sentence is retained,",
    "then broken into fragments,",
    "then partially misquoted through loss of context or recombination,",
    "and finally reduced to a short residue.",
    "",
    "Keep the output recognizably derived from the input.",
    "Preserve exact words and phrases from the input in most outputs.",
    "Meaning may drift, harden, or even contradict the original intention, but the original wording must remain clearly legible.",
    "",
    "This is a short transformation task. Keep outputs minimal, fast, and low-variance.",
    "Prefer extraction, omission, shortening, and recombination over invention.",
    "",
    "Do not explain.",
    "Do not summarize.",
    "Do not sound like an assistant.",
    "Do not generate unrelated poetic language.",
    "Keep everything very short, sparse, and fragmentary.",
    "",
    "Use this exact json shape:",
    '{ "original": string, "exact_fragments": string[], "recombined_fragments": string[], "slight_variants": string[], "final_residue": string }',
    "Constraints:",
    "- original: unchanged input sentence",
    "- exact_fragments: 2 to 3 short phrases copied directly from the input; together they should feel like the first break from the intact sentence",
    "- recombined_fragments: 1 to 2 short outputs using mostly original words in altered order, reduced context, or selective emphasis; together they should feel like the sentence has begun to be misquoted",
    "- slight_variants: 1 short output with stronger semantic drift, possibly even contradiction, but still visibly tied to the original wording",
    "- final_residue: 1 very short phrase, ideally 1 to 4 words; this should feel like the sentence's final afterimage",
    "- most words across all outputs should come directly from the input",
    "- keep each fragment under 6 words when possible",
    "- avoid full paraphrase",
    "- avoid unrelated invention",
    "- if contradiction appears, it should emerge from omission, context loss, or recombination",
    "- select quotable, emotionally charged, or easily extractable parts when possible",
    `Sentence: ${sentence}`,
  ].join("\n");
}

export async function transformSentence(sentence: string): Promise<Transformation> {
  const config = getDeepSeekRuntimeConfig();

  if (!config.useLlm) {
    return createLocalTransformation(sentence);
  }

  if (config.configError) {
    throw new DeepSeekConfigError(config.configError);
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.45,
        max_tokens: 350,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You produce valid json only. No markdown, no commentary, no prose outside the json object.",
          },
          {
            role: "user",
            content: buildPrompt(sentence),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("DeepSeek returned empty content");
    }

    return coerceTransformation(sentence, JSON.parse(content));
  } catch (error) {
    console.warn("[After Distortion] Warning: DeepSeek request failed. Using local fallback.", error);
    return createLocalTransformation(sentence);
  }
}
