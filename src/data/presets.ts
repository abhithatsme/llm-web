import { ModelPreset } from '../types/pipeline';

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'newton-classic',
    name: 'Classic Assignment Corpus (Newton Reference)',
    description: 'The exact baseline dataset from the reference assignment, upgraded with multi-stage transformer analytics.',
    corpus: `The cat sat on the mat.
The dog sat on the rug.
The cat saw the dog!
A dog and a cat can be friends.
Do you like the cat?
I don't like the rain, but I like the sun.`,
    sampleInput: 'The dogs liked the sunny zebra.',
    defaultSentences: [
      'The cat sat on the mat.',
      'A kitten rested on the rug.',
      'The bat sat on the mat.',
      'I love programming in Python.',
      'Coding in Python is my passion.',
      'Pythons are large snakes.',
      'The stock market crashed today.',
      'Share prices fell sharply.'
    ]
  },
  {
    id: 'ai-transformers',
    name: 'Modern AI & Deep Learning',
    description: 'Explore how large language models represent neural architectures, attention layers, and GPUs.',
    corpus: `Attention is all you need for language modeling.
Transformers process input tokens in parallel with self attention.
Neural networks update weights through gradient backpropagation.
Deep learning models scale with compute power and training data.
The query and key matrices calculate attention scores.
Vectors capture rich semantic meaning across dimensions.`,
    sampleInput: 'The transformer layer calculated attention weights efficiently.',
    defaultSentences: [
      'Transformers process tokens in parallel.',
      'Self-attention calculates token interactions.',
      'Neural networks learn representation vectors.',
      'The puppy chased the bright yellow ball.',
      'A friendly dog bounded across the park.',
      'Stock portfolios suffer during market downturns.',
      'Investors watched volatile index valuations drop.',
      'Quantum superposition allows parallel quantum states.'
    ]
  },
  {
    id: 'creative-narrative',
    name: 'Coreference & Storytelling',
    description: 'Observe how self-attention resolves ambiguous pronouns like "it" based on context (Winograd Schema).',
    corpus: `The detective inspected the dusty old attic with a magnifying glass.
The animal did not cross the street because it was tired.
The animal did not cross the street because it was wide.
The trophy could not fit inside the brown suitcase because it was too large.
The trophy could not fit inside the brown suitcase because it was too small.
She opened the mysterious antique wooden door and stepped outside into the starry night.`,
    sampleInput: 'The trophy could not fit in the brown suitcase because it was too large.',
    defaultSentences: [
      'The animal did not cross the street because it was tired.',
      'The animal did not cross the street because it was wide.',
      'The brave astronaut looked at Earth from space.',
      'Cosmonauts observe blue oceans from the orbital station.',
      'Freshly brewed espresso smells divine in the morning.',
      'A warm cup of dark coffee started his day.',
      'The king ruled the prosperous medieval empire.',
      'The queen commanded the royal court with grace.'
    ]
  },
  {
    id: 'code-reasoning',
    name: 'Code & Algorithmic Logic',
    description: 'See how code syntax, indentation, and variable assignments are tokenized and processed.',
    corpus: `def compute_similarity(vector_a, vector_b):
    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    magnitude_a = math.sqrt(sum(a * a for a in vector_a))
    magnitude_b = math.sqrt(sum(b * b for b in vector_b))
    return dot_product / (magnitude_a * magnitude_b)
const response = await fetch('/api/tokens');
const data = await response.json();`,
    sampleInput: 'return sum(x * y for x, y in zip(u, v))',
    defaultSentences: [
      'def binary_search(arr, target): return mid',
      'function findIndex(list, key) { return idx; }',
      'The king sat upon the golden royal throne.',
      'The queen addressed the high court of the kingdom.',
      'A cute kitten purred softly on the warm sofa.',
      'An affectionate cat snoozed in the afternoon sunshine.',
      'Inflation caused consumer prices to rise quickly.',
      'Central banks raised interest rates to stabilize inflation.'
    ]
  }
];
