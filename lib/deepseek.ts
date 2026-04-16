import {
  getDeepSeekRuntimeConfig,
} from "@/lib/deepseek-config";
import {
  coerceTransformation,
  createLocalTransformation,
  hasWeakTransformation,
  type Transformation,
} from "@/lib/transform";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export type TransformSource = "llm" | "local";
export type TransformResult = {
  source: TransformSource;
  transformation: Transformation;
};

export class DeepSeekConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekConfigError";
  }
}

function buildPrompt(sentence: string) {
  return [
    "Return valid JSON only.",
    "",
    "First identify the sentence's most essential core:",
    "- the emotional hinge, central action, or decisive claim",
    "- the part without which the sentence would lose its main force",
    "",
    "All transformed outputs should stay anchored to that essential core.",
    "Prefer the most essential words and phrases over secondary details.",
    "For longer or multi-clause sentences, identify the decisive clause before transforming.",
    "If one clause is only setup and another carries the real emotional turn, prefer the emotional turn.",
    "Avoid defaulting to opening scaffolding such as 'I was going', 'we were talking', or 'I thought' unless that is clearly the sentence's main force.",
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
    "Try your best to shift the output away from the original purpose of the sentence while still using only words from that sentence.",
    'Example: "I do not like you" may become "like you".',
    "The transformed outputs should still express a meaningful stance strongly correlated to the sentence's main purpose, whether negative or positive.",
    "Prefer dropping words over adding structure.",
    "If dropping one small word changes the meaning sharply, prefer that move.",
    "Shorter is usually better.",
    "",
    "This is a short transformation task. Keep outputs minimal, fast, and low-variance.",
    "Prefer extraction, omission, shortening, and recombination over invention.",
    "",
    "Do not explain.",
    "Do not summarize.",
    "Do not sound like an assistant.",
    "Do not generate unrelated poetic language.",
    "Keep everything very short, sparse, and fragmentary.",
    "Make sure every transformed output remains meaningful.",
    'Do not produce broken word combinations like "hurt meant" or other fragments that read like accidental word soup.',
    "Especially for the final residue, keep the wording natural and preserve the original word order when possible.",
    "Every output must be syntactically valid and semantically clear on its own.",
    "Never end a fragment on a dangling determiner or possessive (for example: 'hate his', 'with the', 'for your').",
    "The final_residue must read like a complete, natural mini-utterance, not a truncated leftover.",
    "For longer sentences, final_residue should capture the emotional consequence, not scene-setting context.",
    "Prefer impact phrases like 'felt ignored', 'actually respect me', 'canceled the night before' over setup phrases like 'during the argument' or 'spent weeks planning'.",
    "If a phrase is grammatical but bland context, do not use it as final_residue when a stronger emotional phrase exists in the sentence.",
    "",
    "Use this exact JSON shape:",
    '{ "original": string, "exact_fragments": string[], "recombined_fragments": string[], "slight_variants": string[], "final_residue": string }',
    "Constraints:",
    "- original: unchanged input sentence",
    "- exact_fragments: 2 to 3 short phrases copied directly from the input; together they should feel like the first break from the intact sentence",
    "- recombined_fragments: 1 to 2 short outputs using mostly original words in altered order, reduced context, or selective emphasis; together they should feel like the sentence has begun to be misquoted",
    "- slight_variants: 1 short output with stronger semantic drift, possibly even contradiction, but still visibly tied to the original wording",
    "- final_residue: 1 very short phrase, ideally 1 to 4 words; this should feel like the sentence's final afterimage",
    "- most words across all outputs should come directly from the input",
    "- use only words that appear in the input sentence, except for unavoidable punctuation",
    "- center the outputs on the most essential part of the sentence, not on incidental details",
    "- prefer fragments that preserve the main emotional or semantic charge",
    "- if you can invert or redirect the sentence's original purpose through omission or recombination, do so",
    "- prefer omission-based shifts such as removing negation, softening, or qualifiers when that creates a strong contrast",
    "- for contrastive inputs (for example, one clause rejects and another affirms), make slight_variants explicitly oppose the original preference or target emphasis",
    "- avoid neutral restatements when a clear oppositional shift is possible",
    '- for patterns like "I don\'t like him, I like you", prefer oppositional outcomes such as "like him" or "don\'t like you", not "like you"',
    "- the output should still mean something clear; avoid vague leftovers with no stance",
    "- keep each fragment under 4 words when possible",
    "- avoid long clause-like outputs",
    "- prefer 1 to 3 charged words over 5 to 6 flat words",
    "- avoid full paraphrase",
    "- avoid unrelated invention",
    '- avoid outputs that are grammatically or semantically broken, such as "hurt meant"',
    "- final_residue should usually be a natural short phrase that still appears in the original wording or in the original word order",
    "- final_residue must be grammatical and meaningful as a standalone phrase",
    "- do not output dangling endings such as possessive-only tails ('his', 'her', 'their') unless they are completed by a noun",
    "- for long or multi-clause sentences, avoid neutral context residues (time/place/setup scaffolding) when an emotional-impact residue is available",
    "- avoid final_residue choices like 'during the argument' or 'spent weeks planning' if the sentence contains stronger consequence words",
    "- if contradiction appears, it should emerge from omission, context loss, or recombination",
    "- select quotable, emotionally charged, or easily extractable parts when possible",
    "",
    `Sentence: ${sentence}`,
  ].join("\n");
}

async function requestDeepSeekTransformation(
  sentence: string,
  apiKey: string,
  extraInstruction?: string,
) {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
          content: extraInstruction
            ? `${buildPrompt(sentence)}\n\nRevision note:\n${extraInstruction}`
            : buildPrompt(sentence),
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
}

export async function transformSentence(sentence: string): Promise<TransformResult> {
  const config = getDeepSeekRuntimeConfig();

  if (!config.useLlm) {
    return {
      source: "local",
      transformation: createLocalTransformation(sentence),
    };
  }

  if (config.configError) {
    throw new DeepSeekConfigError(config.configError);
  }

  try {
    let transformation = await requestDeepSeekTransformation(sentence, config.apiKey!);

    if (hasWeakTransformation(sentence, transformation)) {
      transformation = await requestDeepSeekTransformation(
        sentence,
        config.apiKey!,
        [
          "The previous output was too weak or awkward.",
          "Regenerate with a stronger essential core.",
          "For longer sentences, prefer the decisive clause over the setup clause.",
          "Avoid weak context fragments such as 'earlier but', 'then somehow', or 'meant but'.",
          "Avoid opening scaffolding such as 'I never', 'we were talking', or 'I said' when a later clause is more emotionally decisive.",
          "Avoid broken combinations, repeated words, or clumsy outputs such as 'can you let okay' or 'talking turned'.",
          "Make recombined_fragments and slight_variants shorter, sharper, and more contrastive.",
          "Prefer dropping words to flip or redirect meaning.",
          "For contrastive sentences, make slight_variants clearly oppose the original preference direction.",
          "Avoid neutral outputs that preserve both sides without a clear stance shift.",
          "For examples like 'I do not like him, I like you', prefer 'like him' or 'do not like you' over 'like you'.",
          "Avoid long fragments when 2 or 3 words can carry the shift.",
          "Every fragment, especially final_residue, must be grammatically complete and meaningful by itself.",
          "Reject dangling tails like 'hate his' or other incomplete endings.",
          "For long sentences, avoid setup/context residues and choose emotional consequence phrases instead.",
          "Do not settle on outputs like 'during the argument' or 'spent weeks planning' when stronger impact wording exists.",
          "Make final_residue the clearest short afterimage of the sentence's core.",
        ].join("\n"),
      );
    }

    return {
      source: "llm",
      transformation,
    };
  } catch (error) {
    console.warn("[After Distortion] Warning: DeepSeek request failed. Using local fallback.", error);
    return {
      source: "local",
      transformation: createLocalTransformation(sentence),
    };
  }
}
