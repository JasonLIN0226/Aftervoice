export type Transformation = {
  original: string;
  exact_fragments: string[];
  recombined_fragments: string[];
  slight_variants: string[];
  final_residue: string;
};

export const MAX_SENTENCE_LENGTH = 220;

const WORD_REGEX = /[A-Za-z0-9']+/g;

type IndexedWord = {
  value: string;
  start: number;
  end: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeSentence(sentence: string) {
  return sentence.replace(/\s+/g, " ").trim();
}

function wordsFromSentence(sentence: string) {
  return sentence.match(WORD_REGEX) ?? [];
}

function indexedWords(sentence: string) {
  return Array.from(sentence.matchAll(WORD_REGEX)).map<IndexedWord>((match) => ({
    value: match[0],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

function uniqueNonEmpty(values: string[]) {
  return values.filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);
}

function sentenceFragments(sentence: string) {
  const tokens = indexedWords(sentence);
  const words = tokens.map((token) => token.value);

  if (words.length <= 3) {
    return uniqueNonEmpty([
      sentence,
      sliceDirectPhrase(sentence, tokens, 0, 2),
      sliceDirectPhrase(sentence, tokens, Math.max(words.length - 2, 0), 2),
    ]).slice(0, 3);
  }

  const mid = Math.floor(words.length / 2);

  return uniqueNonEmpty([
    sliceDirectPhrase(sentence, tokens, 0, Math.min(3, words.length)),
    sliceDirectPhrase(sentence, tokens, Math.max(mid - 1, 0), Math.min(3, words.length)),
    sliceDirectPhrase(sentence, tokens, Math.max(words.length - 3, 0), Math.min(3, words.length)),
    sliceDirectPhrase(sentence, tokens, 1, Math.min(2, words.length - 1)),
  ]).slice(0, 3);
}

function sliceDirectPhrase(
  sentence: string,
  tokens: IndexedWord[],
  start: number,
  size: number,
) {
  if (!tokens.length) {
    return "";
  }

  const clampedStart = clamp(start, 0, Math.max(tokens.length - 1, 0));
  const clampedSize = clamp(size, 1, Math.min(4, tokens.length - clampedStart));
  const first = tokens[clampedStart];
  const last = tokens[clampedStart + clampedSize - 1];

  return sentence.slice(first.start, last.end).trim();
}

function shortResidue(sentence: string) {
  const words = wordsFromSentence(sentence);

  if (!words.length) {
    return "still here";
  }

  if (words.length === 1) {
    return words[0];
  }

  const mid = Math.floor((words.length - 1) / 2);
  return words.slice(mid, clamp(mid + 2, 1, words.length)).join(" ");
}

export function createLocalTransformation(input: string): Transformation {
  const original = normalizeSentence(input);
  const words = wordsFromSentence(original);
  const exact = sentenceFragments(original);

  const first = exact[0] ?? shortResidue(original);
  const second = exact[1] ?? exact[0] ?? shortResidue(original);
  const third = exact[2] ?? exact[1] ?? exact[0] ?? shortResidue(original);
  const tailWord = words.at(-1) ?? shortResidue(original);
  const residue = shortResidue(original);

  const recombined = uniqueNonEmpty([
    `${first} ${softLower(third)}`.trim(),
    `${second}, ${softLower(third)}`.trim(),
    `${first}, ${softLower(tailWord)}`.trim(),
  ]).slice(0, 2);

  const variant = uniqueNonEmpty([
    `not ${softLower(first)}`.trim(),
    `${residue}, not ${softLower(tailWord)}`.trim(),
  ]).slice(0, 1);

  return {
    original,
    exact_fragments: exact.slice(0, clamp(exact.length, 2, 3)),
    recombined_fragments: recombined.slice(0, clamp(recombined.length, 1, 2)),
    slight_variants: variant.slice(0, 1),
    final_residue: residue,
  };
}

function cleanString(value: unknown) {
  return typeof value === "string" ? normalizeSentence(value) : "";
}

function softLower(value: string) {
  if (!value || /^I(\b|$)/.test(value)) {
    return value;
  }

  return `${value[0].toLowerCase()}${value.slice(1)}`;
}

function cleanArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueNonEmpty(value.map(cleanString)).filter(Boolean);
}

export function coerceTransformation(input: string, candidate: unknown): Transformation {
  const fallback = createLocalTransformation(input);

  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const source = candidate as Partial<Transformation>;

  const original = cleanString(source.original) || fallback.original;
  const exact = cleanArray(source.exact_fragments).slice(0, 3);
  const recombined = cleanArray(source.recombined_fragments).slice(0, 2);
  const variants = cleanArray(source.slight_variants).slice(0, 1);
  const residue = cleanString(source.final_residue);

  return {
    original,
    exact_fragments: exact.length >= 2 ? exact : fallback.exact_fragments,
    recombined_fragments: recombined.length >= 1 ? recombined : fallback.recombined_fragments,
    slight_variants: variants.length >= 1 ? variants : fallback.slight_variants,
    final_residue: residue || fallback.final_residue,
  };
}
