#  InsightStream

> Paste an article URL. Get a summary, key takeaways, and a sentiment score in seconds.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

InsightStream is a full-stack web app that scrapes any article from a URL and runs it through a Python ML microservice. It returns a summary, key takeaways, a sentiment label with a confidence score, and an estimated reading time. Every result is saved to the user's account, so past articles are one click away in the sidebar.

---

## Features

- **URL to insights:** paste a link, and the backend scrapes the article text and title
- **Summarization:** Flan-T5 generates a short summary of the article
- **Key takeaways:** the most important points are listed as bullets
- **Sentiment analysis:** DistilBERT labels the text positive or negative, with a confidence score
- **Reading time:** estimated from the word count
- **History:** every processed article is saved, and clicking a title in the sidebar reloads its results
- **Authentication:** JWT-based register and login, and each user only sees their own articles
- **Toggleable pipelines:** switch sentiment and summary on or off from the dashboard

---

##  Architecture

```mermaid
flowchart LR
    A[React + Vite<br/>Frontend] -->|REST + JWT| B[Express + TypeScript<br/>Backend]
    B -->|SQL| C[(PostgreSQL)]
    B -->|scrape URL| D[Web page]
    B -->|HTTP| E[FastAPI<br/>ML Microservice]
    E --> F[DistilBERT<br/>sentiment]
    E --> G[Flan-T5<br/>summary]
    E --> H[MiniLM<br/>embeddings]
```

## Detailed Architecture

[![System Architecture](./docs/Architecture.svg)](./docs/Architecture.svg)

**Request flow:**

1. The user pastes a URL in the React dashboard.
2. Express checks the JWT, then scrapes the page for its title and text.
3. Express sends the text to the FastAPI service for the summary and the sentiment analysis.
4. The result is saved in PostgreSQL and returned to the frontend.
5. The dashboard shows the result, and the sidebar history updates.

The ML models are loaded **once at startup** (FastAPI `lifespan`) and kept in memory, so requests don't pay the model-loading cost.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express, TypeScript, JWT, bcrypt |
| Database | PostgreSQL |
| ML service | FastAPI, PyTorch, Hugging Face Transformers |
| Models | `distilbert-base-uncased-finetuned-sst-2-english`, `google/flan-t5-base`, `sentence-transformers/all-MiniLM-L6-v2` |

---

## Project Structure

```
InsightStream/
├── Frontend/          # React + Vite app
│   └── src/
│       ├── api/           # Axios instance with auth interceptor
│       └── components/    # Sidebar, Auth, DataInputZone, StreamOutputBoard, ...
├── Backend/           # Express + TypeScript API
│   └── src/
│       ├── controllers/   # auth and article logic
│       ├── middleware/    # JWT auth
│       ├── models/        # PostgreSQL queries
│       ├── routes/
│       └── services/      # scraper and ML service client
└── ai-service/        # FastAPI ML microservice (main.py)
```

> Folder names may differ slightly from the actual repo layout.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL

### 1. Clone the repo

```bash
git clone https://github.com/shashank-bingading/InsightStream.git
cd InsightStream
```

### 2. Start the ML service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install fastapi uvicorn torch transformers
uvicorn main:app --reload --port 8000
```

On the first run the three models are downloaded, which can take a few minutes. Wait for `All Models ready!` in the terminal. You can check the service at <http://127.0.0.1:8000/health>.

### 3. Start the backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE
JWT_SECRET=replace_with_a_long_random_string
FASTAPI_SERVICE_URL=http://127.0.0.1:8000
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then run:

```bash
npm run dev
```

The tables are created automatically on startup.

### 4. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>), create an account, and paste an article link.

---

## API Reference

### Backend (Express, port 3000)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| POST | `/api/articles` | Bearer token | Scrape, analyze, and save an article. Body: `{ "url": "..." }` |
| GET | `/api/articles` | Bearer token | List the logged-in user's articles, newest first |

### ML service (FastAPI, port 8000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/analyze` | Sentiment label and probabilities |
| POST | `/generate-notes` | Summary and bullet points |
| POST | `/generate-embeddings` | 384-dimensional sentence embedding |

All POST endpoints in the ML service take `{ "text": "..." }`. Interactive docs are available at <http://127.0.0.1:8000/docs>.

---

## Known Limitations

- **Input is truncated by the models:** sentiment reads about the first 512 tokens and the summary about the first 1024, so very long articles are judged on their opening part
- **Binary sentiment:** the model only knows positive and negative, so neutral articles are forced into one side. The confidence score is the better signal
- **Scraping depends on the site:** JavaScript-rendered pages or sites that block scrapers may return little or no text
- **Small models:** Flan-T5-Base is lightweight, so summaries are decent but not perfect

---

## Roadmap

- [ ] Semantic search over saved articles using embeddings (pgvector)
- [ ] Chunk long articles before summarizing
- [ ] Delete and rename entries in history
- [ ] Neutral sentiment class using confidence thresholds
- [ ] Docker Compose setup for all three services

---

## Author

**Shashank Singh**
B.Tech in Artificial Intelligence and Data Science, GGSIPU (East Delhi Campus)

GitHub: [@shashank-bingading](https://github.com/shashank-bingading)

