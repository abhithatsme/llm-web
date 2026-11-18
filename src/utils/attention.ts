import { softmax } from './math';

export interface AttentionHeadData {
  id: number;
  name: string;
  role: string;
  weights: number[][]; // [queryTokenIdx][keyTokenIdx]
  interpretation: string;
}

export function computeAttentionMatrix(
  tokens: string[],
  headIndex: number = 0,
  isCausal: boolean = true,
  attentionTemp: number = 1.0
): AttentionHeadData {
  const n = tokens.length;
  if (n === 0) {
    return {
      id: headIndex,
      name: "Empty Head",
      role: "None",
      weights: [],
      interpretation: "No tokens provided."
    };
  }

  const rawScores: number[][] = [];
  const headsMeta = [
    {
      name: "Head 1: Syntactic Adjacency",
      role: "Looks at immediate previous words and punctuation boundaries",
      calcScore: (i: number, j: number) => {
        if (i === j) return 1.8;
        if (i - 1 === j) return 2.6; // strong attention to previous token
        return -0.5 * Math.abs(i - j);
      },
      interpretation: "Tracks local n-gram transitions and immediate grammatical modifiers."
    },
    {
      name: "Head 2: Coreference & Semantic Anchor",
      role: "Resolves pronouns ('it', 'they', 'which') to their original subject/object entities",
      calcScore: (i: number, j: number) => {
        const qi = tokens[i].toLowerCase();
        const kj = tokens[j].toLowerCase();
        // High attention if query is a pronoun/reference
        if (["it", "they", "this", "that", "which"].includes(qi)) {
          if (["cat", "dog", "trophy", "animal", "suitcase", "street"].includes(kj)) return 3.2;
        }
        if (qi === kj) return 1.5;
        // Semantic coupling
        if ((qi.includes("cat") && kj.includes("kitten")) || (qi.includes("dog") && kj.includes("puppy"))) return 2.5;
        return 0.2;
      },
      interpretation: "Disambiguates Winograd schema pronouns by linking reference terms to nominal anchors."
    },
    {
      name: "Head 3: Global Context & Initial Anchor",
      role: "Attends heavily to the first token [CLS] / start-of-sequence to store global prompt context",
      calcScore: (i: number, j: number) => {
        if (j === 0) return 2.4; // [CLS] or prompt anchor
        if (i === j) return 1.0;
        return 0.1;
      },
      interpretation: "Acts as a resting/summary sink anchor for information across the sequence."
    },
    {
      name: "Head 4: Key Concept & Predicate Relation",
      role: "Connects verbs, adjectives, and salient content words across clauses",
      calcScore: (i: number, j: number) => {
        const qi = tokens[i].toLowerCase();
        const kj = tokens[j].toLowerCase();
        if (["large", "tired", "sat", "walked", "fell", "crashed"].includes(qi) && 
            ["trophy", "animal", "cat", "prices", "market"].includes(kj)) {
          return 2.9;
        }
        return (i % 2 === j % 2) ? 0.8 : -0.2;
      },
      interpretation: "Associates state modifiers with nouns across longer distances in the sentence."
    }
  ];

  const head = headsMeta[headIndex % headsMeta.length];

  // Compute raw $Q K^T / \sqrt{d_k}$
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (isCausal && j > i) {
        // Causal mask: future tokens cannot be attended to (-infinity)
        row.push(-9999);
      } else {
        const baseScore = head.calcScore(i, j);
        row.push(baseScore);
      }
    }
    rawScores.push(row);
  }

  // Apply row-wise Softmax
  const weights = rawScores.map(row => softmax(row, attentionTemp));

  return {
    id: headIndex,
    name: head.name,
    role: head.role,
    weights,
    interpretation: head.interpretation
  };
}
