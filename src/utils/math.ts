// Mathematical utilities for LLM pipeline exploration

export function dot(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0)) || 1e-12;
}

export function normalize(v: number[]): number[] {
  const mag = magnitude(v);
  return v.map(x => x / mag);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dot(a, b) / (magA * magB);
}

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

// 64-bucket n-gram spelling vector (matching Newton reference)
export function spellingVector(text: string, buckets: number = 64): number[] {
  const s = text.toLowerCase();
  const v = new Array(buckets).fill(0);
  if (s.length < 3) {
    for (let i = 0; i < s.length; i++) {
      v[hashString(s[i]) % buckets] += 1;
    }
    return normalize(v);
  }
  for (let i = 0; i + 3 <= s.length; i++) {
    const trigram = s.slice(i, i + 3);
    v[hashString(trigram) % buckets] += 1;
  }
  return normalize(v);
}

// Principal Component Analysis (squash D dimensions to 3D) using power iteration with deflation
export function pcaTo3D(vectors: number[][]): [number, number, number][] {
  const n = vectors.length;
  if (n === 0) return [];
  const d = vectors[0].length;

  if (n < 4) {
    // Fallback pseudo-projection for tiny datasets
    return vectors.map((v, idx) => [
      v[0] || (idx * 1.2),
      v[1] || (idx * 0.8),
      v[2] || ((idx % 2 === 0 ? 1 : -1) * 0.5)
    ]);
  }

  // 1. Center the data
  const mean = new Array(d).fill(0);
  for (const v of vectors) {
    for (let j = 0; j < d; j++) mean[j] += v[j] / n;
  }
  const X = vectors.map(v => v.map((x, j) => x - mean[j]));

  // 2. Covariance matrix C (d x d)
  const C: number[][] = [];
  for (let a = 0; a < d; a++) {
    C.push(new Array(d).fill(0));
    for (let b = 0; b < d; b++) {
      for (let i = 0; i < n; i++) {
        C[a][b] += X[i][a] * X[i][b];
      }
      C[a][b] /= (n - 1);
    }
  }

  // 3. Power iteration with deflation to find top 3 eigenvectors
  const components: number[][] = [];
  for (let k = 0; k < 3; k++) {
    let v = normalize(Array.from({ length: d }, (_, j) => Math.sin(j + 1 + k * 1.5)));
    for (let iter = 0; iter < 40; iter++) {
      const nextV = C.map(row => dot(row, v));
      v = normalize(nextV);
    }
    const lambda = dot(v, C.map(row => dot(row, v)));
    components.push(v);

    // Deflation
    for (let a = 0; a < d; a++) {
      for (let b = 0; b < d; b++) {
        C[a][b] -= lambda * v[a] * v[b];
      }
    }
  }

  // 4. Project centered data onto components
  return X.map(x => [
    dot(x, components[0]),
    dot(x, components[1]),
    dot(x, components[2])
  ]);
}

// Softmax with temperature scaling
export function softmax(logits: number[], temperature: number = 1.0): number[] {
  if (logits.length === 0) return [];
  const safeTemp = Math.max(0.01, temperature);
  const scaled = logits.map(x => x / safeTemp);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map(x => Math.exp(x - maxVal));
  const sumExps = exps.reduce((acc, val) => acc + val, 0);
  return exps.map(x => x / (sumExps || 1));
}

// Sinusoidal Positional Encoding generator: PE(pos, 2i) = sin(pos/10000^(2i/d))
export function getSinusoidalPositionalEncoding(pos: number, dModel: number = 16): number[] {
  const pe = new Array(dModel);
  for (let i = 0; i < dModel / 2; i++) {
    const divTerm = Math.pow(10000, (2 * i) / dModel);
    pe[2 * i] = Math.sin(pos / divTerm);
    pe[2 * i + 1] = Math.cos(pos / divTerm);
  }
  return pe;
}
