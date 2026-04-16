type LanguagePack = {
  label: string;
  spaceless?: boolean;
  phrases: Record<string, string>;
  replacements: Record<string, string>;
  fallback: string[];
};

const languagePacks: LanguagePack[] = [
  {
    label: "es",
    phrases: {
      "do not": "no",
      "don't": "no",
      "still here": "todavia aqui",
      "i love you": "te quiero",
      "share this": "comparte esto",
      "without voice": "sin voz",
    },
    replacements: {
      after: "despues",
      again: "otra vez",
      and: "y",
      before: "antes",
      between: "entre",
      body: "cuerpo",
      but: "pero",
      echo: "eco",
      hear: "oir",
      hold: "sostener",
      keep: "guardar",
      key: "llave",
      leave: "dejar",
      loss: "perdida",
      love: "amor",
      memory: "memoria",
      name: "nombre",
      no: "no",
      not: "no",
      publicly: "publicamente",
      secret: "secreto",
      sentence: "frase",
      share: "compartir",
      speak: "hablar",
      still: "todavia",
      tell: "decir",
      this: "esto",
      touch: "tocar",
      voice: "voz",
      with: "con",
      without: "sin",
      you: "tu",
      your: "tu",
    },
    fallback: ["sin voz", "memoria", "otra vez", "todavia aqui"],
  },
  {
    label: "fr",
    phrases: {
      "do not": "ne pas",
      "don't": "ne pas",
      "still here": "toujours ici",
      "i love you": "je t'aime",
      "share this": "partage ceci",
      "without voice": "sans voix",
    },
    replacements: {
      after: "apres",
      again: "encore",
      and: "et",
      before: "avant",
      between: "entre",
      body: "corps",
      but: "mais",
      echo: "echo",
      hear: "entendre",
      hold: "garder",
      keep: "garder",
      key: "cle",
      leave: "laisser",
      loss: "perte",
      love: "amour",
      memory: "memoire",
      name: "nom",
      no: "non",
      not: "ne",
      publicly: "publiquement",
      secret: "secret",
      sentence: "phrase",
      share: "partager",
      speak: "parler",
      still: "encore",
      tell: "dire",
      this: "ceci",
      touch: "toucher",
      voice: "voix",
      with: "avec",
      without: "sans",
      you: "toi",
      your: "ton",
    },
    fallback: ["sans voix", "memoire", "encore", "toujours ici"],
  },
  {
    label: "it",
    phrases: {
      "do not": "non",
      "don't": "non",
      "still here": "ancora qui",
      "i love you": "ti amo",
      "share this": "condividi questo",
      "without voice": "senza voce",
    },
    replacements: {
      after: "dopo",
      again: "ancora",
      and: "e",
      before: "prima",
      between: "tra",
      body: "corpo",
      but: "ma",
      echo: "eco",
      hear: "sentire",
      hold: "tenere",
      keep: "tenere",
      key: "chiave",
      leave: "lasciare",
      loss: "perdita",
      love: "amore",
      memory: "memoria",
      name: "nome",
      no: "no",
      not: "non",
      publicly: "pubblicamente",
      secret: "segreto",
      sentence: "frase",
      share: "condividere",
      speak: "parlare",
      still: "ancora",
      tell: "dire",
      this: "questo",
      touch: "toccare",
      voice: "voce",
      with: "con",
      without: "senza",
      you: "tu",
      your: "tuo",
    },
    fallback: ["senza voce", "memoria", "ancora", "ancora qui"],
  },
  {
    label: "zh",
    spaceless: true,
    phrases: {
      "do not": "不要",
      "don't": "不要",
      "still here": "还在这里",
      "i love you": "我爱你",
      "share this": "分享这个",
      "without voice": "没有声音",
    },
    replacements: {
      after: "之后",
      again: "再次",
      and: "和",
      before: "之前",
      between: "之间",
      body: "身体",
      but: "但是",
      echo: "回声",
      hear: "听见",
      hold: "保留",
      keep: "保留",
      key: "钥匙",
      leave: "留下",
      loss: "失去",
      love: "爱",
      memory: "记忆",
      name: "名字",
      no: "不",
      not: "不",
      publicly: "公开地",
      secret: "秘密",
      sentence: "句子",
      share: "分享",
      speak: "说",
      still: "仍然",
      tell: "说出",
      this: "这",
      touch: "触碰",
      voice: "声音",
      with: "和",
      without: "没有",
      you: "你",
      your: "你的",
    },
    fallback: ["没有声音", "记忆", "回声", "还在这里"],
  },
  {
    label: "ja",
    spaceless: true,
    phrases: {
      "do not": "しないで",
      "don't": "しないで",
      "still here": "まだここに",
      "i love you": "愛してる",
      "share this": "これを分けて",
      "without voice": "声のない",
    },
    replacements: {
      after: "あと",
      again: "もう一度",
      and: "と",
      before: "前",
      between: "あいだ",
      body: "からだ",
      but: "でも",
      echo: "こだま",
      hear: "聞こえる",
      hold: "保つ",
      keep: "残す",
      key: "鍵",
      leave: "残す",
      loss: "喪失",
      love: "愛",
      memory: "記憶",
      name: "名前",
      no: "ない",
      not: "ない",
      publicly: "公に",
      secret: "秘密",
      sentence: "文",
      share: "分ける",
      speak: "話す",
      still: "まだ",
      tell: "伝える",
      this: "この",
      touch: "触れる",
      voice: "声",
      with: "と",
      without: "なしで",
      you: "あなた",
      your: "あなたの",
    },
    fallback: ["声のない", "記憶", "こだま", "まだここに"],
  },
  {
    label: "ko",
    spaceless: true,
    phrases: {
      "do not": "하지 마",
      "don't": "하지 마",
      "still here": "아직 여기",
      "i love you": "사랑해",
      "share this": "이걸 나눠",
      "without voice": "목소리 없이",
    },
    replacements: {
      after: "이후",
      again: "다시",
      and: "그리고",
      before: "이전",
      between: "사이",
      body: "몸",
      but: "하지만",
      echo: "메아리",
      hear: "듣다",
      hold: "붙잡다",
      keep: "지키다",
      key: "열쇠",
      leave: "남기다",
      loss: "상실",
      love: "사랑",
      memory: "기억",
      name: "이름",
      no: "아니",
      not: "않",
      publicly: "공공연히",
      secret: "비밀",
      sentence: "문장",
      share: "나누다",
      speak: "말하다",
      still: "여전히",
      tell: "말하다",
      this: "이",
      touch: "만지다",
      voice: "목소리",
      with: "함께",
      without: "없이",
      you: "너",
      your: "너의",
    },
    fallback: ["목소리 없이", "기억", "메아리", "아직 여기"],
  },
];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function tokenize(text: string) {
  return text.split(/(\s+|[.,!?;:]+)/).filter(Boolean);
}

function replaceToken(token: string, replacements: Record<string, string>) {
  const lower = token.toLowerCase();
  const replacement = replacements[lower];

  if (!replacement) {
    return token;
  }

  if (token === token.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (token[0] === token[0]?.toUpperCase()) {
    return `${replacement[0]?.toUpperCase() ?? ""}${replacement.slice(1)}`;
  }

  return replacement;
}

function applyPhraseReplacements(text: string, phrases: Record<string, string>) {
  let next = text;

  for (const [source, target] of Object.entries(phrases)) {
    next = next.replace(new RegExp(source, "gi"), target);
  }

  return next;
}

function compactSpaceless(text: string) {
  return text
    .replace(/\s+/g, "")
    .replace(/([.,!?;:])/g, "$1");
}

export function createForeignEcho(text: string, seed: number) {
  const normalized = text.trim().toLowerCase();
  const packIndex = (hashString(normalized) + seed * 17) % languagePacks.length;
  const pack = languagePacks[packIndex];
  const phraseShifted = applyPhraseReplacements(text, pack.phrases);
  const tokens = tokenize(phraseShifted);
  let swaps = 0;

  const echoed = tokens
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return pack.spaceless ? "" : token;
      }

      const next = replaceToken(token, pack.replacements);

      if (next !== token) {
        swaps += 1;
      }

      return next;
    })
    .join("");

  const finalText = pack.spaceless ? compactSpaceless(echoed) : echoed.replace(/\s+/g, " ").trim();
  const minimumSwaps = Math.max(2, Math.floor(normalized.split(/\s+/).length / 3));

  if (swaps >= minimumSwaps && finalText && finalText.toLowerCase() !== normalized) {
    return {
      text: finalText,
      language: pack.label,
    };
  }

  const fallback = pack.fallback[(hashString(normalized) + seed) % pack.fallback.length];

  return {
    text: fallback,
    language: pack.label,
  };
}
