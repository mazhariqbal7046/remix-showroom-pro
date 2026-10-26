# Showroom Pro AI API

Create a local `.env` by copying `.env.example`, then put the OpenAI key in `AI_API_KEY`. Keep this file server-side only.

```powershell
cd "D:\my notes\remix-showroom-pro\ai-service"
py -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8001
```

Health check: `http://localhost:8001/health`
AI endpoint: `POST http://localhost:8001/api/ai/ask`

Backend workflow endpoints:

- `POST /api/notifications/queue` queues an email after showroom auth.
- `POST /api/notifications/process` processes queued emails with `X-Worker-Secret`.
- `POST /api/reports/monthly-closing` saves verified monthly figures.
- `GET /api/admin/metrics` returns protected live platform counts with `X-Admin-Secret`.

Email delivery uses Resend. Add `RESEND_API_KEY` and a verified `EMAIL_FROM` address to `.env`; without them, notifications remain safely queued and no fake email is reported as sent.
