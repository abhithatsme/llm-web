# LLM Pipeline Explorer Studio 🚀
### Interactive Neural Network & Transformer Visualizer

An interactive, laboratory-grade visualizer designed to deconstruct the internal mechanics of Large Language Models (LLMs) and Transformer architectures from raw text to autoregressive generation.

Built as an advanced, unique evolution inspired by the [Newton LLM Pipeline Reference](https://llm-pipeline-explorer-newton-64f0.vercel.app/).

---

## 🌟 Why This Architecture is Unique (10x Leap Over Baseline)

| Feature | Reference Assignment (Newton Baseline) | **LLM Pipeline Explorer Studio** |
| :--- | :--- | :--- |
| **Pipeline Coverage** | Only 2 stages (Tokenizer & Trigram Embedding) | **All 7 End-to-End Stages** (Tokenization $\to$ 3D Latent Space $\to$ Attention $\to$ FFN $\to$ Norm $\to$ Sampling $\to$ Autoregression) |
| **Embedding Engine** | Naive 3-letter spelling hash (no semantics) | **Dual Engine**: Real Dense Semantic Clusters **+** Baseline N-Gram Hashes |
| **Vector Geometry** | Basic 3D scatter plot | **Interactive 3D WebGL** + Vector Arithmetic ($\vec{v}_{\text{King}} - \vec{v}_{\text{Man}} + \vec{v}_{\text{Woman}} \approx \vec{v}_{\text{Queen}}$) |
| **Attention Mechanism** | ❌ None | **Multi-Head Self-Attention Heatmap** ($Q, K, V$) with Winograd Pronoun Resolution |
| **Residual & FFN** | ❌ None | **Residual Highway** + Interactive Activation Curves (SwiGLU, GELU, ReLU) |
| **Normalization** | ❌ None | **RMSNorm vs LayerNorm** + Un-embedding Matrix ($W_U$) projection to Logits |
| **Sampling Lab** | ❌ None | **Real-Time Interactive Softmax**, Temperature ($T$), Top-K, Top-P Nucleus, Min-P |
| **Generation Loop** | ❌ None | **Live Autoregressive Loop** + **KV-Cache Memory Visualizer** |
| **Workflow Modes** | Single static column | **Story Stepper** (Stages 1-7) + **All-in-One Sandbox** + **Deep Token Tracer** |
| **Assignment Export**| ❌ None | **One-Click Academic Submission Report Generator** (.md & PDF printable) |

---

## 🔬 The 7 Interactive Pipeline Stages

### 1. Tokenizer & Subword Vocabulary Lab
- **BPE / WordPiece Subword Tokenization:** Watch words decompose into frequency-ranked stems and `##` suffixes.
- **Dynamic Vocabulary Slider:** Prune vocabulary from 100% down to 10% and observe the token count grow as subwords compensate.
- **Real-Time Token Chips:** Color-coded tokens with deterministic HSL IDs and compression ratios (chars/token).

### 2. Embeddings & 3D Latent Space
- **High-Dimensional Geometry ($\mathbb{R}^{64}$):** Normalized vectors projected via Principal Component Analysis (power iteration with deflation).
- **Vector Arithmetic Engine:** Test linear semantic offsets ($King - Man + Woman = Queen$, $Paris - France + Germany = Berlin$).
- **Positional Encoding:** Compare Vaswani Sinusoidal functions with modern Rotary Position Embeddings (RoPE).

### 3. Multi-Head Self-Attention Matrix
- **Scaled Dot-Product Equation:**
  $$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
- **Head Specialization:** Syntactic Adjacency, Coreference (resolving *"it"* to antecedent nouns), and Global Sequence Sinks.
- **Causal Masking:** Toggle between Autoregressive (GPT) and Bidirectional (BERT).

### 4. Residual Stream & Feed-Forward Memory
- **The Residual Highway:** $\mathbf{x}_l = \mathbf{x}_{l-1} + \text{Attn}(\mathbf{x}_{l-1}) + \text{FFN}(\mathbf{x}_{l-1})$.
- **Interactive Non-Linear Curves:** Compare SwiGLU (Llama 3/Mistral), GELU (GPT-3), and ReLU.

### 5. Normalization & Logits Projection
- **RMSNorm vs LayerNorm:** Variance stabilization before vocabulary un-embedding.
- **Un-embedding Matrix ($W_U \in \mathbb{R}^{d \times V}$):** Dot product projection generating raw unnormalized Logits ($z$).

### 6. Decoding & Sampling Dynamics
- **Softmax Temperature:** Smooth from greedy argmax ($T \to 0$) to creative diversity ($T > 1.0$).
- **Top-K & Top-P (Nucleus) Filters:** Truncating low-probability tails with Shannon entropy tracking.

### 7. Autoregressive Loop & KV-Cache
- **Token-by-Token Streaming:** Watch generated tokens appended back into context.
- **KV-Cache Visualizer:** Experience how past keys and values are cached in GPU VRAM to achieve $O(1)$ constant time inference per step instead of quadratic $O(N^2)$ recomputation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React 18 + TypeScript + Vite
- **Styling & UI:** Tailwind CSS + Lucide Icons + Glassmorphism
- **3D Graphics & Charts:** WebGL Plotly 3D Engine
- **Mathematical Typography:** KaTeX LaTeX Renderer
- **Deployment:** Vercel / Netlify / GitHub Pages ready (Zero backend required)

---

## 🚀 Instant Deployment Guide

### Deploy to Vercel (Recommended)
1. Push this folder to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/llm-pipeline-explorer.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository. Vercel will auto-detect Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**! Your site will be live on `https://<your-project>.vercel.app` in under 60 seconds.

### Local Development
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## 📝 Assignment Submission Package
Click the **"Assignment Report"** button in the header bar of the app to generate a formatted laboratory report in Academic Markdown with theoretical formulations, dataset metrics, and cosine similarity tables ready for assignment grading!
