// Feed-Forward Networks, Activation Functions & Residual Streams

export function relu(x: number): number {
  return Math.max(0, x);
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function gelu(x: number): number {
  // Gaussian Error Linear Unit approximation
  const sqrt2OverPi = Math.sqrt(2 / Math.PI);
  return 0.5 * x * (1 + Math.tanh(sqrt2OverPi * (x + 0.044715 * Math.pow(x, 3))));
}

export function swiglu(x: number, gate: number = 1.0): number {
  // Swish(x) = x * sigmoid(x), then gated by gate component
  const swish = x * sigmoid(x);
  return swish * gate;
}

export interface ActivationPoint {
  x: number;
  relu: number;
  gelu: number;
  swish: number;
}

export function generateActivationCurves(min: number = -3.5, max: number = 3.5, steps: number = 70): ActivationPoint[] {
  const points: ActivationPoint[] = [];
  const step = (max - min) / steps;
  for (let i = 0; i <= steps; i++) {
    const val = min + i * step;
    points.push({
      x: Number(val.toFixed(2)),
      relu: Number(relu(val).toFixed(3)),
      gelu: Number(gelu(val).toFixed(3)),
      swish: Number((val * sigmoid(val)).toFixed(3))
    });
  }
  return points;
}

export function computeRMSNorm(vector: number[], epsilon: number = 1e-6): { normalized: number[]; rms: number } {
  const sumSquares = vector.reduce((acc, x) => acc + x * x, 0);
  const rms = Math.sqrt(sumSquares / vector.length + epsilon);
  return {
    normalized: vector.map(x => x / rms),
    rms
  };
}

export function computeLayerNorm(vector: number[], epsilon: number = 1e-6): { normalized: number[]; mean: number; variance: number } {
  const mean = vector.reduce((acc, x) => acc + x, 0) / vector.length;
  const variance = vector.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / vector.length;
  const std = Math.sqrt(variance + epsilon);
  return {
    normalized: vector.map(x => (x - mean) / std),
    mean,
    variance
  };
}
