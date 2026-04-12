import { coerceTransformation, createLocalTransformation, type Transformation } from "@/lib/transform";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function buildPrompt(sentence: string) {
  return [
    "Return valid json only.",
    "Transform the user's sentence into sparse textual residue.",
    "Keep the output recognizably derived from the input.",
    "Preserve exact words and phrases from the input in most outputs.",
    "Meaning may drift or contradict, but the original wording must remain legible.",
    "Do not explain.",
    "Do not sound like an assistant.",
    "Keep everything short and fragmentary.",
    "Use this exact json shape:",
    '{ "original": string, "exact_fragments": string[], "recombined_fragments": string[], "slight_variants": string[], "final_residue": string }',
    "Constraints:",
    "- original: unchanged input sentence",
    "- exact_fragments: 2 to 4 short phrases copied directly from input",
    "- recombined_fragments: 2 to 3 short outputs using mostly original words in altered order or context",
    "- slight_variants: 1 to 2 short outputs with semantic drift but visible ties to original wording",
    "- final_residue: 1 very short phrase",
    `Sentence: ${sentence}`,
  ].join("\n");
}

export async function transformSentence(sentence: string): Promise<Transformation> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return createLocalTransformation(sentence);
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.9,
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
  } catch {
    return createLocalTransformation(sentence);
  }
}
