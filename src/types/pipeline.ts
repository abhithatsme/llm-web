export interface TokenItem {
  id: number;
  text: string;
  isSubword?: boolean;
  color?: string;
  charStart?: number;
  charEnd?: number;
  frequency?: number;
}

export interface VocabularyMap {
  [word: string]: number;
}

export interface EmbeddingPoint {
  id: string;
  text: string;
  category: string;
  vector: number[];
  projected: [number, number, number];
  isUser?: boolean;
  nearestNeighbors?: { text: string; similarity: number }[];
}

export interface AttentionMatrix {
  tokens: string[];
  weights: number[][]; // [fromTokenIdx][toTokenIdx]
  headName: string;
  headRole: string;
}

export interface SamplingConfig {
  temperature: number;
  topK: number;
  topP: number;
  minP: number;
  repetitionPenalty: number;
}

export interface LogitCandidate {
  token: string;
  id: number;
  logit: number;
  rawProbability: number;
  adjustedProbability: number;
  isFilteredOut: boolean;
  filterReason?: string;
}

export interface GenerationStep {
  step: number;
  token: string;
  tokenId: number;
  probability: number;
  contextTokens: string[];
  kvCacheMemoryKb: number;
}

export type ViewMode = 'story' | 'sandbox' | 'compare';

export interface ModelPreset {
  id: string;
  name: string;
  description: string;
  corpus: string;
  sampleInput: string;
  defaultSentences: string[];
}
