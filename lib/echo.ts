type LanguagePack = {
  label: string;
  spaceless?: boolean;
  phrases: Record<string, string>;
  replacements: Record<string, string>;
};

const languagePacks: LanguagePack[] = [
  {
    label: "es",
    phrases: {
      "do not": "no",
      "don't": "no",
      "still here": "todavia aqui",
      "i love you": "te quiero",
      "thank you": "gracias",
      "hurt you": "herirte",
      "time and effort": "tiempo y esfuerzo",
      "meant to": "quise",
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
      cannot: "no puedo",
      echo: "eco",
      effort: "esfuerzo",
      enough: "bastante",
      generosity: "generosidad",
      hear: "oir",
      hold: "sostener",
      hurt: "herir",
      keep: "guardar",
      key: "llave",
      leave: "dejar",
      loss: "perdida",
      love: "amor",
      memory: "memoria",
      meant: "quise",
      name: "nombre",
      never: "nunca",
      no: "no",
      not: "no",
      appreciate: "apreciar",
      publicly: "publicamente",
      secret: "secreto",
      sentence: "frase",
      share: "compartir",
      sincerely: "sinceramente",
      speak: "hablar",
      still: "todavia",
      thank: "agradecer",
      tell: "decir",
      this: "esto",
      time: "tiempo",
      touch: "tocar",
      voice: "voz",
      with: "con",
      without: "sin",
      you: "tu",
      your: "tu",
    },
  },
  {
    label: "fr",
    phrases: {
      "do not": "ne pas",
      "don't": "ne pas",
      "still here": "toujours ici",
      "i love you": "je t'aime",
      "thank you": "merci",
      "hurt you": "te blesser",
      "time and effort": "temps et effort",
      "meant to": "voulais",
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
      cannot: "ne peux pas",
      echo: "echo",
      effort: "effort",
      enough: "assez",
      generosity: "generosite",
      hear: "entendre",
      hold: "garder",
      hurt: "blesser",
      keep: "garder",
      key: "cle",
      leave: "laisser",
      loss: "perte",
      love: "amour",
      memory: "memoire",
      meant: "voulais",
      name: "nom",
      never: "jamais",
      no: "non",
      not: "ne",
      appreciate: "apprecier",
      publicly: "publiquement",
      secret: "secret",
      sentence: "phrase",
      share: "partager",
      sincerely: "sincerement",
      speak: "parler",
      still: "encore",
      thank: "remercier",
      tell: "dire",
      this: "ceci",
      time: "temps",
      touch: "toucher",
      voice: "voix",
      with: "avec",
      without: "sans",
      you: "toi",
      your: "ton",
    },
  },
  {
    label: "it",
    phrases: {
      "do not": "non",
      "don't": "non",
      "still here": "ancora qui",
      "i love you": "ti amo",
      "thank you": "grazie",
      "hurt you": "ferirti",
      "time and effort": "tempo e sforzo",
      "meant to": "volevo",
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
      cannot: "non posso",
      echo: "eco",
      effort: "sforzo",
      enough: "abbastanza",
      generosity: "generosita",
      hear: "sentire",
      hold: "tenere",
      hurt: "ferire",
      keep: "tenere",
      key: "chiave",
      leave: "lasciare",
      loss: "perdita",
      love: "amore",
      memory: "memoria",
      meant: "volevo",
      name: "nome",
      never: "mai",
      no: "no",
      not: "non",
      appreciate: "apprezzare",
      publicly: "pubblicamente",
      secret: "segreto",
      sentence: "frase",
      share: "condividere",
      sincerely: "sinceramente",
      speak: "parlare",
      still: "ancora",
      thank: "ringraziare",
      tell: "dire",
      this: "questo",
      time: "tempo",
      touch: "toccare",
      voice: "voce",
      with: "con",
      without: "senza",
      you: "tu",
      your: "tuo",
    },
  },
  {
    label: "zh",
    spaceless: true,
    phrases: {
      "do not": "不要",
      "don't": "不要",
      "still here": "还在这里",
      "i love you": "我爱你",
      "thank you": "谢谢你",
      "hurt you": "伤害你",
      "time and effort": "时间和心力",
      "meant to": "本想",
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
      cannot: "不能",
      echo: "回声",
      effort: "心力",
      enough: "足够",
      generosity: "慷慨",
      hear: "听见",
      hold: "保留",
      hurt: "伤害",
      keep: "保留",
      key: "钥匙",
      leave: "留下",
      loss: "失去",
      love: "爱",
      memory: "记忆",
      meant: "本意",
      name: "名字",
      never: "从未",
      no: "不",
      not: "不",
      appreciate: "感激",
      publicly: "公开地",
      secret: "秘密",
      sentence: "句子",
      share: "分享",
      sincerely: "真诚地",
      speak: "说",
      still: "仍然",
      thank: "感谢",
      tell: "说出",
      this: "这",
      time: "时间",
      touch: "触碰",
      voice: "声音",
      with: "和",
      without: "没有",
      you: "你",
      your: "你的",
    },
  },
  {
    label: "ja",
    spaceless: true,
    phrases: {
      "do not": "しないで",
      "don't": "しないで",
      "still here": "まだここに",
      "i love you": "愛してる",
      "thank you": "ありがとう",
      "hurt you": "あなたを傷つける",
      "time and effort": "時間と手間",
      "meant to": "つもりだった",
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
      cannot: "できない",
      echo: "こだま",
      effort: "手間",
      enough: "十分",
      generosity: "寛大さ",
      hear: "聞こえる",
      hold: "保つ",
      hurt: "傷つける",
      keep: "残す",
      key: "鍵",
      leave: "残す",
      loss: "喪失",
      love: "愛",
      memory: "記憶",
      meant: "つもり",
      name: "名前",
      never: "決して",
      no: "ない",
      not: "ない",
      appreciate: "感謝する",
      publicly: "公に",
      secret: "秘密",
      sentence: "文",
      share: "分ける",
      sincerely: "心から",
      speak: "話す",
      still: "まだ",
      thank: "感謝する",
      tell: "伝える",
      this: "この",
      time: "時間",
      touch: "触れる",
      voice: "声",
      with: "と",
      without: "なしで",
      you: "あなた",
      your: "あなたの",
    },
  },
  {
    label: "ko",
    spaceless: true,
    phrases: {
      "do not": "하지 마",
      "don't": "하지 마",
      "still here": "아직 여기",
      "i love you": "사랑해",
      "thank you": "고마워",
      "hurt you": "너를 다치게 하다",
      "time and effort": "시간과 노력",
      "meant to": "하려고 했어",
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
      cannot: "할 수 없어",
      echo: "메아리",
      effort: "노력",
      enough: "충분히",
      generosity: "관대함",
      hear: "듣다",
      hold: "붙잡다",
      hurt: "다치게 하다",
      keep: "지키다",
      key: "열쇠",
      leave: "남기다",
      loss: "상실",
      love: "사랑",
      memory: "기억",
      meant: "의도했어",
      name: "이름",
      never: "결코",
      no: "아니",
      not: "않",
      appreciate: "감사하다",
      publicly: "공공연히",
      secret: "비밀",
      sentence: "문장",
      share: "나누다",
      sincerely: "진심으로",
      speak: "말하다",
      still: "여전히",
      thank: "감사하다",
      tell: "말하다",
      this: "이",
      time: "시간",
      touch: "만지다",
      voice: "목소리",
      with: "함께",
      without: "없이",
      you: "너",
      your: "너의",
    },
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

function contentTokens(text: string) {
  return text.match(/[A-Za-z0-9']+/g) ?? [];
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

  const sortedEntries = Object.entries(phrases).sort((left, right) => right[0].length - left[0].length);

  for (const [source, target] of sortedEntries) {
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
  const originalContent = contentTokens(text);

  if (!originalContent.length) {
    return null;
  }

  const phraseShifted = applyPhraseReplacements(text, pack.phrases);
  const tokens = tokenize(phraseShifted);
  let translatedWordCount = 0;
  let untranslatedWordCount = 0;

  const echoed = tokens
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return pack.spaceless ? "" : token;
      }

      const next = replaceToken(token, pack.replacements);
      const isWord = /^[A-Za-z0-9']+$/.test(token);

      if (isWord) {
        if (next !== token) {
          translatedWordCount += 1;
        } else if (/^[A-Za-z]/.test(token)) {
          untranslatedWordCount += 1;
        }
      }

      return next;
    })
    .join("");

  const finalText = pack.spaceless ? compactSpaceless(echoed) : echoed.replace(/\s+/g, " ").trim();
  const phraseCoverageBoost = Math.max(0, originalContent.length - contentTokens(phraseShifted).length);
  const translatedCoverage = translatedWordCount + phraseCoverageBoost;

  if (
    finalText &&
    finalText.toLowerCase() !== normalized &&
    untranslatedWordCount === 0 &&
    translatedCoverage >= originalContent.length
  ) {
    return {
      text: finalText,
      language: pack.label,
    };
  }

  return null;
}
