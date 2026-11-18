# LLM Pipeline Explorer (Assignment Edition) 🎓

A clean, decent, interactive educational webpage that demonstrates how Large Language Models (LLMs) turn text into tokens, embed them as points in 3D space, and predict the next word.

Inspired by the [Newton LLM Pipeline Reference](https://llm-pipeline-explorer-newton-64f0.vercel.app/), designed with a clean light theme, clear step-by-step pipeline flow, and intuitive visual controls.

---

## 💡 The 3 Pipeline Steps

### 1. Tokenizer & Subword Vocabulary
- **Corpus Training:** Builds a vocabulary table from learning sentences.
- **Interactive Vocab Slider:** Shrink vocabulary to see dropped words split into subword fragments (`##suffix`) in real-time.
- **Colored Token Chips:** Displays tokens with custom color IDs, character count, and compression ratios.

### 2. Embeddings in 3D Space
- **Vector Representations:** Converts sentences into 64-dimensional vectors using n-gram hashing and L2 normalization.
- **Interactive 3D Plotly Scene:** Rotatable and zoomable 3D scatter plot rendered via PCA (Principal Component Analysis).
- **Closest Pairs Table:** Highlights the top sentence pairs with highest cosine similarity and visual progress meters.

### 3. Pipeline Tracer & Next-Word Prediction
- **Trace Your Own Word / Sentence:** Type any word (e.g. `puppy` or `The friendly dog barked`).
- **End-to-End Visual Flow:**
  1. **Token IDs:** Shows token decomposition.
  2. **3D Point:** Highlights the query in radiant orange in the 3D plot.
  3. **Nearest Neighbors:** Lists the 3 closest contextual sentences.
  4. **Next-Word Prediction:** Displays the most likely next word with probability!

---

## 🖥️ How to Run & View Locally

### Option 1: Just Open in Any Browser (No install needed!)
Double-click `index.html` on your desktop or open it in Google Chrome, Safari, or Edge.

### Option 2: Local Web Server
```bash
# If using Python:
python3 -m http.server 4173
```
Then visit: `http://localhost:4173/`

---

## 🚀 How to Deploy to Vercel (1 Click)

1. Push your folder to GitHub:
   ```bash
   git add .
   git commit -m "feat: clean, decent light-theme LLM pipeline explorer"
   git push
   ```
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Select your repository. Because it's a clean static HTML project, Vercel will deploy it automatically in 15 seconds!

---

## 📄 Assignment Submission Features
- **Print / Save PDF:** Click the button in the top navigation bar to generate a clean, printer-friendly assignment submission sheet.
- **Preset Switcher:** Click **"Preset: Cats & Dogs"** or **"Preset: Coding & AI"** to switch corpora and sentences instantly.
