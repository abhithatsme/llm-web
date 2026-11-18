import { LogitCandidate, SamplingConfig, GenerationStep } from '../types/pipeline';
import { softmax } from './math';

export interface NextTokenDistribution {
  candidates: LogitCandidate[];
  selectedCandidate: LogitCandidate;
  entropy: number;
}

// Vocabulary with realistic contextual priors
const CANDIDATE_BANK: Record<string, { token: string; baseLogit: number }[]> = {
  default: [
    { token: "the", baseLogit: 4.8 },
    { token: "mat", baseLogit: 4.2 },
    { token: "sun", baseLogit: 3.9 },
    { token: "dog", baseLogit: 3.5 },
    { token: "cat", baseLogit: 3.3 },
    { token: "rug", baseLogit: 2.8 },
    { token: "quickly", baseLogit: 2.1 },
    { token: "sleeping", baseLogit: 1.9 },
    { token: "softly", baseLogit: 1.6 },
    { token: "and", baseLogit: 1.4 },
    { token: "because", baseLogit: 1.1 },
    { token: "under", baseLogit: 0.9 },
    { token: "outside", baseLogit: 0.6 },
    { token: "yesterday", baseLogit: 0.2 },
    { token: "quietly", baseLogit: -0.3 }
  ],
  code: [
    { token: "return", baseLogit: 5.2 },
    { token: "def", baseLogit: 4.5 },
    { token: "result", baseLogit: 4.0 },
    { token: "if", baseLogit: 3.6 },
    { token: "self", baseLogit: 3.4 },
    { token: "None", baseLogit: 2.9 },
    { token: "True", baseLogit: 2.4 },
    { token: "len", baseLogit: 1.8 },
    { token: "error", baseLogit: 1.5 },
    { token: "import", baseLogit: 1.2 }
  ],
  attention: [
    { token: "weights", baseLogit: 5.4 },
    { token: "matrices", baseLogit: 4.6 },
    { token: "layer", baseLogit: 4.1 },
    { token: "scores", baseLogit: 3.7 },
    { token: "mechanism", baseLogit: 3.2 },
    { token: "vector", baseLogit: 2.7 },
    { token: "dimension", baseLogit: 2.2 },
    { token: "softmax", baseLogit: 1.9 },
    { token: "output", baseLogit: 1.5 }
  ]
};

export function computeNextTokenDistribution(
  contextText: string,
  sampling: SamplingConfig,
  forcedSeed?: number
): NextTokenDistribution {
  const lower = contextText.toLowerCase();
  let baseList = CANDIDATE_BANK.default;
  if (lower.includes("def") || lower.includes("function") || lower.includes("return")) {
    baseList = CANDIDATE_BANK.code;
  } else if (lower.includes("attention") || lower.includes("transformer") || lower.includes("neural")) {
    baseList = CANDIDATE_BANK.attention;
  }

  // Adjust base logits based on prompt context & repetition penalty
  const rawLogits: { token: string; id: number; logit: number }[] = baseList.map((item, idx) => {
    let logit = item.baseLogit;
    
    // Repetition penalty
    if (lower.includes(item.token.toLowerCase())) {
      logit = logit > 0 ? logit / sampling.repetitionPenalty : logit * sampling.repetitionPenalty;
    }

    // Contextual boost
    if (lower.endsWith("on the") && ["mat", "rug", "table", "floor"].includes(item.token)) {
      logit += 2.0;
    }
    if (lower.endsWith("sat on") && item.token === "the") {
      logit += 3.0;
    }

    return { token: item.token, id: 100 + idx, logit };
  });

  // Calculate raw probabilities (T=1.0)
  const rawProbs = softmax(rawLogits.map(c => c.logit), 1.0);

  // Apply Temperature scaling
  const scaledProbs = softmax(rawLogits.map(c => c.logit), sampling.temperature);

  // Create candidate records sorted descending by scaled probability
  let candidates: LogitCandidate[] = rawLogits.map((item, idx) => ({
    token: item.token,
    id: item.id,
    logit: item.logit,
    rawProbability: rawProbs[idx],
    adjustedProbability: scaledProbs[idx],
    isFilteredOut: false
  })).sort((a, b) => b.adjustedProbability - a.adjustedProbability);

  // Apply Top-K filtering
  if (sampling.topK > 0 && sampling.topK < candidates.length) {
    for (let i = sampling.topK; i < candidates.length; i++) {
      candidates[i].isFilteredOut = true;
      candidates[i].filterReason = `Top-K (k=${sampling.topK})`;
    }
  }

  // Apply Top-P (Nucleus) filtering
  let cumSum = 0;
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].isFilteredOut) continue;
    cumSum += candidates[i].adjustedProbability;
    if (cumSum > sampling.topP && i > 0) {
      // Filter out remaining tokens
      for (let j = i + 1; j < candidates.length; j++) {
        if (!candidates[j].isFilteredOut) {
          candidates[j].isFilteredOut = true;
          candidates[j].filterReason = `Top-P Nucleus (p=${sampling.topP})`;
        }
      }
      break;
    }
  }

  // Apply Min-P filtering
  const topProb = candidates.find(c => !c.isFilteredOut)?.adjustedProbability || 1.0;
  const minThreshold = topProb * sampling.minP;
  for (const c of candidates) {
    if (!c.isFilteredOut && c.adjustedProbability < minThreshold) {
      c.isFilteredOut = true;
      c.filterReason = `Min-P (< ${minThreshold.toFixed(3)})`;
    }
  }

  // Renormalize surviving candidates
  const survivors = candidates.filter(c => !c.isFilteredOut);
  const survivorSum = survivors.reduce((sum, c) => sum + c.adjustedProbability, 0) || 1.0;
  survivors.forEach(c => {
    c.adjustedProbability = c.adjustedProbability / survivorSum;
  });

  // Calculate Shannon entropy: H = -sum(p * log2(p))
  const entropy = survivors.reduce((h, c) => {
    return c.adjustedProbability > 0 ? h - c.adjustedProbability * Math.log2(c.adjustedProbability) : h;
  }, 0);

  // Sample next token (greedy if temp <= 0.05, else weighted random)
  let selectedCandidate: LogitCandidate;
  if (sampling.temperature <= 0.08) {
    selectedCandidate = survivors[0] || candidates[0];
  } else {
    const rnd = forcedSeed !== undefined ? forcedSeed : Math.random();
    let acc = 0;
    selectedCandidate = survivors[survivors.length - 1];
    for (const c of survivors) {
      acc += c.adjustedProbability;
      if (rnd <= acc) {
        selectedCandidate = c;
        break;
      }
    }
  }

  return { candidates, selectedCandidate, entropy };
}
