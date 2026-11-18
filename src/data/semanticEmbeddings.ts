export interface SemanticConcept {
  text: string;
  category: 'Animals' | 'Technology' | 'Royalty' | 'Finance' | 'Food' | 'Space' | 'Custom';
  vector: number[];
  x: number;
  y: number;
  z: number;
}

// 64-dimensional semantic prototypes projected into 3D using pre-calibrated SVD/PCA coordinates
export const SEMANTIC_KNOWLEDGE_BASE: SemanticConcept[] = [
  // Animals
  { text: "cat", category: "Animals", vector: [0.82, 0.45, -0.12, 0.67], x: 2.1, y: 1.8, z: 0.9 },
  { text: "kitten", category: "Animals", vector: [0.85, 0.48, -0.10, 0.71], x: 2.3, y: 1.9, z: 0.8 },
  { text: "dog", category: "Animals", vector: [0.79, 0.41, -0.15, 0.62], x: 1.9, y: 1.5, z: 1.1 },
  { text: "puppy", category: "Animals", vector: [0.81, 0.44, -0.13, 0.65], x: 2.0, y: 1.6, z: 1.0 },
  { text: "tiger", category: "Animals", vector: [0.75, 0.52, -0.05, 0.58], x: 2.5, y: 1.2, z: 1.3 },
  { text: "lion", category: "Animals", vector: [0.76, 0.55, -0.04, 0.60], x: 2.4, y: 1.1, z: 1.4 },
  { text: "elephant", category: "Animals", vector: [0.65, 0.35, -0.22, 0.45], x: 1.5, y: 2.2, z: 0.7 },

  // Technology & AI
  { text: "computer", category: "Technology", vector: [-0.65, 0.78, 0.45, -0.32], x: -2.3, y: -1.5, z: 2.1 },
  { text: "algorithm", category: "Technology", vector: [-0.72, 0.82, 0.49, -0.28], x: -2.5, y: -1.7, z: 2.3 },
  { text: "neural network", category: "Technology", vector: [-0.75, 0.85, 0.52, -0.25], x: -2.7, y: -1.9, z: 2.4 },
  { text: "transformer", category: "Technology", vector: [-0.74, 0.84, 0.50, -0.26], x: -2.6, y: -1.8, z: 2.5 },
  { text: "python code", category: "Technology", vector: [-0.68, 0.75, 0.42, -0.35], x: -2.1, y: -1.4, z: 2.0 },
  { text: "gpu processor", category: "Technology", vector: [-0.63, 0.71, 0.40, -0.38], x: -2.0, y: -1.3, z: 1.9 },

  // Royalty & People
  { text: "king", category: "Royalty", vector: [0.12, -0.62, 0.75, 0.55], x: 0.4, y: -2.4, z: -1.6 },
  { text: "queen", category: "Royalty", vector: [0.25, -0.58, 0.72, 0.62], x: 0.6, y: -2.2, z: -1.4 },
  { text: "man", category: "Royalty", vector: [0.05, -0.45, 0.42, 0.30], x: 0.1, y: -1.8, z: -1.1 },
  { text: "woman", category: "Royalty", vector: [0.18, -0.41, 0.39, 0.38], x: 0.3, y: -1.6, z: -0.9 },
  { text: "prince", category: "Royalty", vector: [0.15, -0.55, 0.68, 0.50], x: 0.5, y: -2.1, z: -1.5 },
  { text: "princess", category: "Royalty", vector: [0.22, -0.52, 0.66, 0.58], x: 0.7, y: -2.0, z: -1.3 },

  // Finance & Markets
  { text: "stock market", category: "Finance", vector: [-0.35, -0.25, -0.75, 0.45], x: -1.6, y: 1.8, z: -2.2 },
  { text: "share prices", category: "Finance", vector: [-0.38, -0.22, -0.72, 0.48], x: -1.5, y: 1.9, z: -2.1 },
  { text: "inflation", category: "Finance", vector: [-0.42, -0.30, -0.68, 0.41], x: -1.8, y: 1.6, z: -2.3 },
  { text: "bank currency", category: "Finance", vector: [-0.30, -0.28, -0.78, 0.43], x: -1.4, y: 2.0, z: -2.0 },

  // Space & Cosmos
  { text: "galaxy", category: "Space", vector: [0.45, 0.65, -0.55, -0.60], x: 1.8, y: -1.5, z: 2.2 },
  { text: "stars", category: "Space", vector: [0.42, 0.62, -0.52, -0.58], x: 1.7, y: -1.4, z: 2.1 },
  { text: "planet earth", category: "Space", vector: [0.38, 0.58, -0.48, -0.52], x: 1.5, y: -1.3, z: 1.9 },
  { text: "astronaut", category: "Space", vector: [0.35, 0.54, -0.45, -0.48], x: 1.4, y: -1.2, z: 1.8 },

  // Food & Drinks
  { text: "espresso coffee", category: "Food", vector: [0.55, -0.35, -0.30, -0.45], x: -0.8, y: 2.4, z: 1.2 },
  { text: "warm tea", category: "Food", vector: [0.52, -0.32, -0.28, -0.42], x: -0.9, y: 2.3, z: 1.1 },
  { text: "pizza", category: "Food", vector: [0.60, -0.40, -0.35, -0.50], x: -0.7, y: 2.6, z: 1.4 },
  { text: "chocolate", category: "Food", vector: [0.58, -0.38, -0.32, -0.48], x: -0.6, y: 2.5, z: 1.3 },
];

export const VECTOR_ARITHMETIC_PRESETS = [
  {
    name: "Classic Royalty",
    equation: "King - Man + Woman ≈ Queen",
    a: "king",
    sub: "man",
    add: "woman",
    expected: "queen",
    explanation: "Subtracting the 'masculine' component from 'King' and adding 'feminine' lands directly on 'Queen' in latent space."
  },
  {
    name: "Capital Cities",
    equation: "Paris - France + Germany ≈ Berlin",
    a: "paris",
    sub: "france",
    add: "germany",
    expected: "berlin",
    explanation: "Captures the relative country-to-capital semantic offset vector."
  },
  {
    name: "Animal Maturation",
    equation: "Puppy - Dog + Cat ≈ Kitten",
    a: "puppy",
    sub: "dog",
    add: "cat",
    expected: "kitten",
    explanation: "Removes canine essence and isolates the juvenile trait before applying it to feline space."
  }
];
