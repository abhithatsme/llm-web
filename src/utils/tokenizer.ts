import { TokenItem, VocabularyMap } from '../types/pipeline';

export const COMMON_SUBWORD_ENDINGS = [
  "##s", "##es", "##ed", "##ing", "##er", "##ly", "##y", "##tion", "##al", "##ic", "##ment", "##able"
];

export function splitIntoWords(text: string): string[] {
  let t = text.toLowerCase();
  t = t.replace(/([.,!?':;"(){}[\]])/g, " $1 ");
  return t.split(/\s+/).filter(w => w.trim() !== "");
}

export function buildVocabularyFromCorpus(
  corpusText: string,
  keepTopN?: number
): {
  vocab: VocabularyMap;
  sortedWords: { word: string; count: number }[];
  subwords: string[];
} {
  const words = splitIntoWords(corpusText);
  const counts: Record<string, number> = {};

  for (const w of words) {
    counts[w] = (counts[w] || 0) + 1;
  }

  const sortedWords = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .map(word => ({ word, count: counts[word] }));

  const letters = [...new Set(words.join("").replace(/[^a-z0-9]/g, ""))].sort();
  const subwords = [
    ...COMMON_SUBWORD_ENDINGS,
    ...letters,
    ...letters.map(ch => "##" + ch)
  ];

  const vocabLimit = keepTopN !== undefined ? Math.min(keepTopN, sortedWords.length) : sortedWords.length;
  const keptWords = sortedWords.slice(0, vocabLimit);

  const vocab: VocabularyMap = { "[PAD]": 0, "[UNK]": 1, "[CLS]": 2, "[SEP]": 3 };
  
  keptWords.forEach(item => {
    if (!(item.word in vocab)) {
      vocab[item.word] = Object.keys(vocab).length;
    }
  });

  subwords.forEach(piece => {
    if (!(piece in vocab)) {
      vocab[piece] = Object.keys(vocab).length;
    }
  });

  return { vocab, sortedWords, subwords };
}

export function splitIntoSubwords(word: string, vocab: VocabularyMap): TokenItem[] {
  const pieces: TokenItem[] = [];
  let start = 0;

  while (start < word.length) {
    let matchedPiece: string | null = null;
    for (let end = word.length; end > start; end--) {
      let piece = word.slice(start, end);
      if (start > 0) piece = "##" + piece;
      if (piece in vocab) {
        matchedPiece = piece;
        break;
      }
    }

    if (matchedPiece === null) {
      // Byte / character fallback or [UNK]
      const charPiece = (start > 0 ? "##" : "") + word[start];
      if (charPiece in vocab) {
        matchedPiece = charPiece;
      } else {
        return [{ id: vocab["[UNK]"] || 1, text: "[UNK]", isSubword: true }];
      }
    }

    pieces.push({
      id: vocab[matchedPiece],
      text: matchedPiece,
      isSubword: matchedPiece.startsWith("##") || start > 0
    });
    start += matchedPiece.replace("##", "").length;
  }

  return pieces;
}

export function encodeText(text: string, vocab: VocabularyMap): TokenItem[] {
  const words = splitIntoWords(text);
  const tokens: TokenItem[] = [];

  for (const w of words) {
    if (w in vocab) {
      tokens.push({
        id: vocab[w],
        text: w,
        isSubword: false
      });
    } else {
      tokens.push(...splitIntoSubwords(w, vocab));
    }
  }

  return tokens;
}

export function colorForTokenId(id: number): string {
  if (id === 0) return 'hsl(215, 15%, 40%)'; // PAD
  if (id === 1) return 'hsl(0, 65%, 55%)';   // UNK
  const hue = (id * 53) % 360;
  return `hsl(${hue}, 75%, 68%)`;
}

export function getTokenStats(rawText: string, tokens: TokenItem[]) {
  const charCount = rawText.length;
  const tokenCount = tokens.length;
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : "0.00";
  const subwordCount = tokens.filter(t => t.isSubword).length;
  const unkCount = tokens.filter(t => t.text === "[UNK]").length;

  return {
    charCount,
    tokenCount,
    charsPerToken,
    subwordCount,
    unkCount,
    compressionRate: tokenCount > 0 ? ((1 - tokenCount / (charCount || 1)) * 100).toFixed(1) + "%" : "0%"
  };
}
