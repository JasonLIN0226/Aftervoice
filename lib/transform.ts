export type Transformation = {
  original: string;
  exact_fragments: string[];
  recombined_fragments: string[];
  slight_variants: string[];
  final_residue: string;
};

export const MAX_SENTENCE_LENGTH = 220;

const WORD_REGEX = /[A-Za-z0-9'’]+/g;
const NEGATION_WORDS = new Set([
  "cannot",
  "cant",
  "didnt",
  "dont",
  "never",
  "no",
  "not",
  "without",
  "wont",
]);
const WEAK_EDGE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "because",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "with",
  "without",
]);
const FRAGMENT_OPENERS = new Set([
  "always",
  "just",
  "never",
  "really",
  "sincerely",
  "still",
  "too",
  "truly",
  "very",
]);
const BARE_VERB_ENDINGS = new Set([
  "appreciate",
  "care",
  "hurt",
  "know",
  "meant",
  "remember",
  "share",
  "speak",
  "stay",
  "think",
  "wanted",
]);
const WEAK_RESIDUE_WORDS = new Set([
  "badly",
  "earlier",
  "maybe",
  "normally",
  "really",
  "somehow",
  "then",
]);
const WEAK_CONTEXT_WORDS = new Set([
  ...WEAK_RESIDUE_WORDS,
  "almost",
  "just",
  "still",
  "too",
  "very",
]);
const PRONOUN_WORDS = new Set(["i", "we", "you", "he", "she", "they", "it"]);
const POSSESSIVE_DETERMINERS = new Set([
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "its",
]);
const AUXILIARY_WORDS = new Set([
  "am",
  "are",
  "be",
  "been",
  "being",
  "can",
  "could",
  "did",
  "do",
  "does",
  "get",
  "gets",
  "go",
  "going",
  "got",
  "had",
  "has",
  "have",
  "is",
  "let",
  "may",
  "might",
  "must",
  "shall",
  "should",
  "was",
  "were",
  "will",
  "would",
]);
const SOFT_INTENT_WORDS = new Set([
  "going",
  "know",
  "meant",
  "said",
  "thought",
  "understood",
]);
const CHARGED_WORDS = new Set([
  "bother",
  "canceled",
  "cornered",
  "disappointment",
  "distracted",
  "embarrassed",
  "ignored",
  "forgot",
  "hate",
  "hurt",
  "fixing",
  "okay",
  "overreaction",
  "regret",
  "respect",
  "unheard",
  "worse",
]);
const SETUP_CONTEXT_WORDS = new Set([
  "after",
  "although",
  "argument",
  "before",
  "days",
  "during",
  "even",
  "meeting",
  "planning",
  "project",
  "timeline",
  "trip",
  "weeks",
  "when",
]);
const SETUP_OPENERS = new Set(["after", "although", "before", "during", "even", "when", "while"]);
const CLAUSE_BREAK_WORDS = new Set([
  "and",
  "because",
  "but",
  "though",
  "yet",
]);
const BANNED_FRAGMENTS = new Set([
  "for your",
  "hurt meant",
  "never meant",
  "you enough",
]);
const STRUCTURE_WORDS = new Set([
  ...WEAK_EDGE_WORDS,
  ...WEAK_CONTEXT_WORDS,
  ...PRONOUN_WORDS,
  ...AUXILIARY_WORDS,
]);

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

function allPhraseWindows(sentence: string, maxSize = 4) {
  const tokens = indexedWords(sentence);
  const phrases: string[] = [];

  for (let size = 1; size <= maxSize; size += 1) {
    for (let start = 0; start <= tokens.length - size; start += 1) {
      phrases.push(sliceDirectPhrase(sentence, tokens, start, size));
    }
  }

  return uniqueNonEmpty(phrases);
}

function splitIntoClauses(sentence: string) {
  const normalized = normalizeSentence(sentence);
  const roughParts = normalized
    .split(/[,;:]+/)
    .map((part) => normalizeSentence(part))
    .filter(Boolean);

  const clauses = roughParts.flatMap((part) => {
    const words = wordsFromSentence(part);

    if (words.length <= 4) {
      return [part];
    }

    const lowerWords = words.map(normalizeWord);
    let start = 0;
    const pieces: string[] = [];

    for (let index = 1; index < lowerWords.length - 1; index += 1) {
      if (!CLAUSE_BREAK_WORDS.has(lowerWords[index])) {
        continue;
      }

      const leftSize = index - start;
      const rightSize = lowerWords.length - (index + 1);

      if (leftSize < 2 || rightSize < 2) {
        continue;
      }

      pieces.push(words.slice(start, index).join(" "));
      start = index + 1;
    }

    pieces.push(words.slice(start).join(" "));
    return pieces.map(normalizeSentence).filter(Boolean);
  });

  return uniqueNonEmpty(clauses);
}

function clausePhraseWindows(sentence: string, maxSize = 4) {
  return uniqueNonEmpty(splitIntoClauses(sentence).flatMap((clause) => allPhraseWindows(clause, maxSize)));
}

function lexicalWordScore(word: string) {
  if (!word) {
    return 0;
  }

  if (CHARGED_WORDS.has(word) || word === "badly") {
    return 2.8;
  }

  if (NEGATION_WORDS.has(word)) {
    return 1.6;
  }

  if (SOFT_INTENT_WORDS.has(word)) {
    return 0.45;
  }

  if (STRUCTURE_WORDS.has(word)) {
    return 0;
  }

  return 1.25;
}

function clauseStrength(clause: string, index: number, totalClauses: number) {
  const words = contentWords(clause);

  if (!words.length) {
    return Number.NEGATIVE_INFINITY;
  }

  const chargedCount = words.filter((word) => CHARGED_WORDS.has(word) || word === "badly").length;
  const negationCount = words.filter((word) => NEGATION_WORDS.has(word)).length;
  const softIntentCount = words.filter((word) => SOFT_INTENT_WORDS.has(word)).length;
  const semanticCount = words.filter((word) => lexicalWordScore(word) >= 1).length;
  const startsWithPronounAuxiliary =
    PRONOUN_WORDS.has(words[0] ?? "") && AUXILIARY_WORDS.has(words[1] ?? "");

  let score = words.reduce((sum, word) => sum + lexicalWordScore(word), 0);

  if (chargedCount) {
    score += chargedCount * 1.6;
  }

  if (negationCount && chargedCount) {
    score += 1.3;
  }

  if (totalClauses > 1 && index > 0 && (chargedCount || negationCount)) {
    score += 1.2;
  }

  if (startsWithPronounAuxiliary && semanticCount <= 1) {
    score -= 2.1;
  }

  if (softIntentCount && !chargedCount && !negationCount && semanticCount <= 1) {
    score -= 2.4;
  }

  return score;
}

function strongestClauses(sentence: string) {
  const clauses = splitIntoClauses(sentence);

  if (clauses.length <= 1) {
    return clauses;
  }

  const scored = clauses
    .map((clause, index) => ({
      clause,
      score: clauseStrength(clause, index, clauses.length),
    }))
    .sort((left, right) => right.score - left.score);

  const strongest = scored[0]?.score ?? Number.NEGATIVE_INFINITY;

  return scored
    .filter((entry, index) => index === 0 || entry.score >= strongest - 1.4)
    .slice(0, 2)
    .map((entry) => entry.clause);
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isPlausibleFragment(text: string) {
  const normalized = normalizeSentence(text);

  if (!normalized) {
    return false;
  }

  if (BANNED_FRAGMENTS.has(normalized.toLowerCase())) {
    return false;
  }

  const words = wordsFromSentence(normalized).map(normalizeWord).filter(Boolean);

  if (!words.length) {
    return false;
  }

  const first = words[0];
  const last = words.at(-1) ?? "";

  if (words.length === 1) {
    return !WEAK_EDGE_WORDS.has(first);
  }

  if (WEAK_EDGE_WORDS.has(first) || WEAK_EDGE_WORDS.has(last)) {
    return false;
  }

  if (words.length === 2 && FRAGMENT_OPENERS.has(first) && BARE_VERB_ENDINGS.has(last)) {
    return false;
  }

  return true;
}

function filterPlausibleFragments(values: string[]) {
  return uniqueNonEmpty(values.map(normalizeSentence)).filter(isPlausibleFragment);
}

function appearsInOriginalOrder(input: string, fragment: string) {
  if (!fragment) {
    return false;
  }

  return normalizeSentence(input).toLowerCase().includes(normalizeSentence(fragment).toLowerCase());
}

function firstFragmentIndex(input: string, fragment: string) {
  if (!fragment) {
    return -1;
  }

  return normalizeSentence(input).toLowerCase().indexOf(normalizeSentence(fragment).toLowerCase());
}

function isPlausibleResidue(text: string) {
  if (!isPlausibleFragment(text)) {
    return false;
  }

  const words = wordsFromSentence(normalizeSentence(text)).map(normalizeWord).filter(Boolean);

  if (!words.length || words.length > 4) {
    return false;
  }

  if (words.every((word) => WEAK_RESIDUE_WORDS.has(word) || WEAK_EDGE_WORDS.has(word))) {
    return false;
  }

  if (words.length === 1) {
    return !WEAK_RESIDUE_WORDS.has(words[0]);
  }

  return true;
}

type FragmentKind = "exact" | "recombined" | "variant" | "residue";

function contentWords(text: string) {
  return wordsFromSentence(normalizeSentence(text)).map(normalizeWord).filter(Boolean);
}

function hasNegationShift(input: string, candidate: string) {
  const inputWords = new Set(contentWords(input));
  const candidateWords = new Set(contentWords(candidate));
  const inputHasNegation = [...inputWords].some((word) => NEGATION_WORDS.has(word));
  const candidateHasNegation = [...candidateWords].some((word) => NEGATION_WORDS.has(word));

  return inputHasNegation !== candidateHasNegation;
}

type MixedPolarityInfo = {
  anchorClause: string;
  anchorHasNegation: boolean;
  oppositeClauses: Array<{ clause: string; hasNegation: boolean }>;
};

function getMixedPolarityInfo(input: string): MixedPolarityInfo | null {
  const clauses = splitIntoClauses(input);

  if (clauses.length < 2) {
    return null;
  }

  const clausePolarity = clauses.map((clause) => ({
    clause,
    hasNegation: contentWords(clause).some((word) => NEGATION_WORDS.has(word)),
  }));
  const hasNegatedClause = clausePolarity.some((entry) => entry.hasNegation);
  const hasAffirmedClause = clausePolarity.some((entry) => !entry.hasNegation);

  if (!hasNegatedClause || !hasAffirmedClause) {
    return null;
  }

  // In mixed-polarity sentences, the final affirmed clause often carries the explicit preference.
  const anchor =
    [...clausePolarity].reverse().find((entry) => !entry.hasNegation) ??
    clausePolarity[clausePolarity.length - 1];

  const oppositeClauses = clausePolarity
    .filter((entry) => entry.hasNegation !== anchor.hasNegation)
    .map((entry) => ({
      clause: entry.clause,
      hasNegation: entry.hasNegation,
    }));

  return {
    anchorClause: anchor.clause,
    anchorHasNegation: anchor.hasNegation,
    oppositeClauses,
  };
}

function opposesMixedPolarityPreference(input: string, candidate: string) {
  const info = getMixedPolarityInfo(input);
  const normalized = normalizeSentence(candidate);

  if (!info || !normalized) {
    return false;
  }

  const candidateHasNegation = contentWords(normalized).some((word) => NEGATION_WORDS.has(word));
  const appearsInAnchor = appearsInOriginalOrder(info.anchorClause, normalized);
  const anchorShift = appearsInAnchor && candidateHasNegation !== info.anchorHasNegation;
  const oppositeShift = info.oppositeClauses.some(
    (entry) =>
      appearsInOriginalOrder(entry.clause, normalized) &&
      candidateHasNegation !== entry.hasNegation,
  );
  const appearsInAnyClause =
    appearsInAnchor ||
    info.oppositeClauses.some((entry) => appearsInOriginalOrder(entry.clause, normalized));
  const freeNegationShift = candidateHasNegation !== info.anchorHasNegation && !appearsInAnyClause;

  if (anchorShift || oppositeShift || freeNegationShift) {
    return true;
  }

  return false;
}

function mirrorsMixedPolarityPreference(input: string, candidate: string) {
  const info = getMixedPolarityInfo(input);
  const normalized = normalizeSentence(candidate);

  if (!info || !normalized) {
    return false;
  }

  if (opposesMixedPolarityPreference(input, normalized)) {
    return false;
  }

  const candidateHasNegation = contentWords(normalized).some((word) => NEGATION_WORDS.has(word));
  const mirrorsAnchor =
    appearsInOriginalOrder(info.anchorClause, normalized) &&
    candidateHasNegation === info.anchorHasNegation;
  const mirrorsOpposite = info.oppositeClauses.some(
    (entry) =>
      appearsInOriginalOrder(entry.clause, normalized) &&
      candidateHasNegation === entry.hasNegation,
  );

  return mirrorsAnchor || mirrorsOpposite;
}

function hasAwkwardRepetition(words: string[]) {
  for (let index = 1; index < words.length; index += 1) {
    if (words[index] === words[index - 1]) {
      return true;
    }
  }

  const seen = new Set<string>();

  for (const word of words) {
    if (WEAK_EDGE_WORDS.has(word)) {
      continue;
    }

    if (seen.has(word)) {
      return true;
    }

    seen.add(word);
  }

  return false;
}

function scoreFragmentCandidate(
  input: string,
  candidate: string,
  kind: FragmentKind,
  occurrences: number,
) {
  const normalized = normalizeSentence(candidate);

  if (!isPlausibleFragment(normalized)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (kind === "residue" && !isPlausibleResidue(normalized)) {
    return Number.NEGATIVE_INFINITY;
  }

  const words = contentWords(normalized);

  if (!words.length) {
    return Number.NEGATIVE_INFINITY;
  }

  const first = words[0];
  const last = words.at(-1) ?? "";
  const lexicalScore = words.reduce((sum, word) => sum + lexicalWordScore(word), 0);
  const semanticWordCount = words.filter((word) => lexicalWordScore(word) >= 1).length;
  const chargedWordCount = words.filter((word) => CHARGED_WORDS.has(word) || word === "badly").length;
  const setupWordCount = words.filter((word) => SETUP_CONTEXT_WORDS.has(word)).length;
  const appearsDirectly = appearsInOriginalOrder(input, normalized);
  const startIndex = firstFragmentIndex(input, normalized);
  const inputWords = contentWords(input);
  const isLongSentence = inputWords.length >= 9;
  const clauses = splitIntoClauses(input);
  const preferredClauses = strongestClauses(input);
  const isFromPreferredClause = preferredClauses.some((clause) =>
    appearsInOriginalOrder(clause, normalized),
  );
  const isFromOpeningClause =
    clauses.length > 1 && appearsInOriginalOrder(clauses[0] ?? "", normalized);
  const hasOppositionalShift = opposesMixedPolarityPreference(input, normalized);
  const mirrorsAnchorPreference = mirrorsMixedPolarityPreference(input, normalized);
  const maxWords =
    kind === "exact" ? 4 : kind === "recombined" ? 4 : 3;

  if (words.length > maxWords) {
    return Number.NEGATIVE_INFINITY;
  }

  if (hasAwkwardRepetition(words)) {
    return Number.NEGATIVE_INFINITY;
  }

  if ((kind === "variant" || kind === "residue") && first === "not" && PRONOUN_WORDS.has(words[1] ?? "")) {
    return Number.NEGATIVE_INFINITY;
  }

  if ((kind === "recombined" || kind === "variant") && PRONOUN_WORDS.has(last)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (POSSESSIVE_DETERMINERS.has(last)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (
    (kind === "recombined" || kind === "variant" || kind === "residue") &&
    words.length === 2 &&
    PRONOUN_WORDS.has(first) &&
    AUXILIARY_WORDS.has(last)
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  if ((kind === "recombined" || kind === "variant") && !appearsDirectly && !hasNegationShift(input, normalized)) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;

  if (words.length === 1) score += 2.2;
  if (words.length === 2) score += 5;
  if (words.length === 3) score += 3.2;
  if (words.length === 4) score += 1.2;

  score += lexicalScore * 1.7;
  score += occurrences * 0.9;

  if (appearsDirectly) {
    score += kind === "recombined" ? 0.8 : 1.8;
  }

  if (kind === "recombined" || kind === "variant" || kind === "residue") {
    if (WEAK_CONTEXT_WORDS.has(first)) score -= 2;
    if (WEAK_CONTEXT_WORDS.has(last)) score -= 2.4;
  }

  if (
    (kind === "variant" || kind === "residue") &&
    setupWordCount >= 2 &&
    chargedWordCount === 0
  ) {
    score -= 4.2;
  }

  if (
    kind === "residue" &&
    setupWordCount === words.length &&
    chargedWordCount === 0
  ) {
    score -= 6;
  }

  if (kind === "residue" && SETUP_OPENERS.has(first) && chargedWordCount === 0) {
    score -= 4;
  }

  if ((kind === "recombined" || kind === "variant") && words.length === 5) {
    score -= 1.2;
  }

  if (kind === "exact") {
    score += appearsDirectly ? 1.2 : -2;
  }

  if (semanticWordCount === 0) {
    score -= 5.4;
  } else if (semanticWordCount === 1 && words.length >= 3) {
    score -= 2.4;
  }

  if (
    PRONOUN_WORDS.has(first) &&
    AUXILIARY_WORDS.has(words[1] ?? "") &&
    semanticWordCount <= 1
  ) {
    score -= isLongSentence ? 3.1 : 1.8;
  }

  if (
    isLongSentence &&
    startIndex >= 0 &&
    startIndex < normalizeSentence(input).length * 0.28 &&
    words.some((word) => SOFT_INTENT_WORDS.has(word)) &&
    !words.some((word) => CHARGED_WORDS.has(word))
  ) {
    score -= 2.8;
  }

  if (
    isLongSentence &&
    isFromOpeningClause &&
    !isFromPreferredClause &&
    words.some((word) => SOFT_INTENT_WORDS.has(word)) &&
    chargedWordCount === 0
  ) {
    score -= 3.2;
  }

  if (isLongSentence && isFromPreferredClause) {
    score += 2.2;
  }

  if (
    isLongSentence &&
    chargedWordCount > 0 &&
    words.length <= 2
  ) {
    score += 1.8;
  }

  if (
    isLongSentence &&
    words.some((word) => NEGATION_WORDS.has(word)) &&
    words.some((word) => CHARGED_WORDS.has(word) || SOFT_INTENT_WORDS.has(word))
  ) {
    score += 1.2;
  }

  if (kind === "variant" && hasNegationShift(input, normalized)) {
    score += 3.4;
  }

  if (kind === "variant" && words.some((word) => NEGATION_WORDS.has(word))) {
    score += 0.8;
  }

  if (kind === "recombined" && !appearsDirectly) {
    score += 0.6;
  }

  if ((kind === "recombined" || kind === "variant") && words.length <= 2) {
    score += 1.4;
  }

  if ((kind === "recombined" || kind === "variant") && words.length >= 4) {
    score -= 1.8;
  }

  if ((kind === "recombined" || kind === "variant" || kind === "residue") && words.some((word) => NEGATION_WORDS.has(word))) {
    score += 0.9;
  }

  if ((kind === "recombined" || kind === "variant" || kind === "residue") && hasOppositionalShift) {
    score += 3.2;
  }

  if ((kind === "variant" || kind === "residue") && mirrorsAnchorPreference) {
    score -= 4.8;
  }

  if (chargedWordCount > 0) {
    score += 1.6;
  }

  if (kind === "residue" && chargedWordCount > 0) {
    score += 2;
  }

  if (words.some((word) => ["understood", "meant", "talking", "text"].includes(word))) {
    score += 0.8;
  }

  if (
    (kind === "variant" || kind === "residue") &&
    words.length >= 2 &&
    PRONOUN_WORDS.has(first) &&
    words.some((word) => SOFT_INTENT_WORDS.has(word)) &&
    chargedWordCount === 0
  ) {
    score -= 3.2;
  }

  if (
    kind === "residue" &&
    words.length === 2 &&
    !PRONOUN_WORDS.has(first) &&
    PRONOUN_WORDS.has(last) &&
    chargedWordCount > 0
  ) {
    score += 2.4;
  }

  if (semanticWordCount === 0) {
    score -= 4;
  }

  return score;
}

function chooseBestCandidates(
  input: string,
  candidates: string[],
  kind: FragmentKind,
  count: number,
  exclusions: string[] = [],
) {
  const counts = new Map<string, number>();
  const excluded = new Set(exclusions.map((value) => normalizeSentence(value).toLowerCase()));

  for (const rawCandidate of candidates) {
    const candidate = normalizeSentence(rawCandidate);

    if (!candidate || excluded.has(candidate.toLowerCase())) {
      continue;
    }

    counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([candidate, occurrences]) => ({
      candidate,
      score: scoreFragmentCandidate(input, candidate, kind, occurrences),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .map((entry) => entry.candidate);
}

function removeNegationWords(text: string) {
  const words = wordsFromSentence(normalizeSentence(text));

  if (!words.length) {
    return "";
  }

  const filtered = words.filter((word) => !NEGATION_WORDS.has(normalizeWord(word)));
  return normalizeSentence(filtered.join(" "));
}

function generateVariantCandidates(input: string) {
  const windows = allPhraseWindows(input);
  const withoutNegation = windows
    .map(removeNegationWords)
    .filter((candidate) => candidate && candidate !== normalizeSentence(input));

  return uniqueNonEmpty([...withoutNegation, ...windows]);
}

function chooseBestResidue(input: string, candidates: string[]) {
  return chooseBestCandidates(input, candidates, "residue", 1)[0] ?? "";
}

export function createLocalTransformation(input: string): Transformation {
  const original = normalizeSentence(input);
  const words = wordsFromSentence(original);
  const clauseWindows = clausePhraseWindows(original);
  const exact = chooseBestCandidates(
    original,
    [...sentenceFragments(original), ...clauseWindows, ...allPhraseWindows(original)],
    "exact",
    3,
  );

  const first = exact[0] ?? shortResidue(original);
  const second = exact[1] ?? exact[0] ?? shortResidue(original);
  const third = exact[2] ?? exact[1] ?? exact[0] ?? shortResidue(original);
  const tailWord = words.at(-1) ?? shortResidue(original);
  const residue = shortResidue(original);

  const recombined = chooseBestCandidates(
    original,
    [
      `${second} ${softLower(tailWord)}`.trim(),
      `${third} ${softLower(tailWord)}`.trim(),
      ...clauseWindows,
      ...allPhraseWindows(original),
    ],
    "recombined",
    2,
    exact,
  );

  const variant = chooseBestCandidates(
    original,
    [
      ...generateVariantCandidates(original),
      ...clauseWindows,
    ],
    "variant",
    1,
    [...exact, ...recombined],
  );
  const selectedResidue =
    chooseBestResidue(original, [
      ...variant,
      ...recombined,
      ...exact,
      ...clauseWindows,
      ...allPhraseWindows(original),
      residue,
    ]) || residue;

  return {
    original,
    exact_fragments: exact.slice(0, clamp(exact.length, 2, 3)),
    recombined_fragments: recombined.slice(0, clamp(recombined.length, 1, 2)),
    slight_variants: variant.slice(0, 1),
    final_residue: selectedResidue,
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
  const clauseWindows = clausePhraseWindows(input);
  const exact = chooseBestCandidates(
    input,
    [
      ...filterPlausibleFragments(cleanArray(source.exact_fragments)),
      ...fallback.exact_fragments,
      ...clauseWindows,
      ...allPhraseWindows(input),
    ],
    "exact",
    3,
  );
  const recombined = chooseBestCandidates(
    input,
    [
      ...filterPlausibleFragments(cleanArray(source.recombined_fragments)),
      ...fallback.recombined_fragments,
      ...clauseWindows,
      ...allPhraseWindows(input),
    ],
    "recombined",
    2,
    exact,
  );
  const variants = chooseBestCandidates(
    input,
    [
      ...filterPlausibleFragments(cleanArray(source.slight_variants)),
      ...clauseWindows,
      ...generateVariantCandidates(input),
      ...fallback.slight_variants,
    ],
    "variant",
    1,
    [...exact, ...recombined],
  );
  const hasMixedPolarity = getMixedPolarityInfo(input) !== null;
  const selectedVariants =
    hasMixedPolarity && variants.length > 0 && !opposesMixedPolarityPreference(input, variants[0])
      ? chooseBestCandidates(
          input,
          [
            ...filterPlausibleFragments(cleanArray(source.slight_variants)),
            ...recombined,
            ...generateVariantCandidates(input),
            ...clauseWindows,
            ...fallback.slight_variants,
          ],
          "variant",
          1,
          [...exact, ...recombined],
        ).filter((variant) => opposesMixedPolarityPreference(input, variant))
      : variants;
  const residue = cleanString(source.final_residue);
  const plausibleResidue = chooseBestResidue(input, [
    residue,
    ...(selectedVariants.length ? selectedVariants : variants),
    ...recombined,
    ...exact,
    ...clauseWindows,
    ...allPhraseWindows(input),
  ]);
  const oppositionalResidue = hasMixedPolarity
    ? chooseBestResidue(
        input,
        [
          residue,
          ...(selectedVariants.length ? selectedVariants : variants),
          ...recombined,
          ...filterPlausibleFragments(cleanArray(source.recombined_fragments)),
          ...filterPlausibleFragments(cleanArray(source.slight_variants)),
          ...clauseWindows,
          ...allPhraseWindows(input),
        ].filter((value) => opposesMixedPolarityPreference(input, value)),
      )
    : "";
  const finalResidue =
    hasMixedPolarity && mirrorsMixedPolarityPreference(input, plausibleResidue || "")
      ? oppositionalResidue || plausibleResidue || fallback.final_residue
      : plausibleResidue || fallback.final_residue;
  const finalVariants = selectedVariants.length ? selectedVariants : variants;

  return {
    original,
    exact_fragments: exact.length >= 2 ? exact : fallback.exact_fragments,
    recombined_fragments: recombined.length >= 1 ? recombined : fallback.recombined_fragments,
    slight_variants: finalVariants.length >= 1 ? finalVariants : fallback.slight_variants,
    final_residue: finalResidue,
  };
}

export function hasWeakTransformation(input: string, transformation: Transformation) {
  const recombinedScores = transformation.recombined_fragments.map((fragment) =>
    scoreFragmentCandidate(input, fragment, "recombined", 1),
  );
  const variantScores = transformation.slight_variants.map((fragment) =>
    scoreFragmentCandidate(input, fragment, "variant", 1),
  );
  const residueScore = scoreFragmentCandidate(input, transformation.final_residue, "residue", 1);

  if (recombinedScores.some((score) => score < 5.2)) {
    return true;
  }

  if (variantScores.some((score) => score < 4.8)) {
    return true;
  }

  if (residueScore < 6) {
    return true;
  }

  if (getMixedPolarityInfo(input)) {
    const variantOpposes = transformation.slight_variants.some((fragment) =>
      opposesMixedPolarityPreference(input, fragment),
    );
    const residueOpposes = opposesMixedPolarityPreference(input, transformation.final_residue);
    const residueMirrors = mirrorsMixedPolarityPreference(input, transformation.final_residue);

    if (!variantOpposes && !residueOpposes) {
      return true;
    }

    if (residueMirrors) {
      return true;
    }
  }

  return false;
}
