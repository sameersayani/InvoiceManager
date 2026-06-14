# InvoiceManager

InvoiceManager is a full-stack Invoice Generator and Management web application designed for small and medium-sized businesses. It provides an easy way to create, send, view, and download invoices, manage clients and company profiles (including logo upload), and keep simple accounting records.

**Screenshots & quick explanations**

— Login to your account to access company invoices and settings.
- ![Login](Presentation/1.%20Login.png) 
— Overview dashboard showing recent invoices, totals and quick actions.
- ![Dashboard](Presentation/2.%20Dashboard-Invoice.png) 
 — Create or update invoices, add line items, taxes and discounts.
- ![Create / Update Invoice](Presentation/3.%20Create-Update-Invoice.png)
— View, download (PDF) and send invoices to clients.
- ![View Invoice](Presentation/4.%20View-Invoice.png) 

**How this helps small & medium businesses**

- Fast invoice creation: create professional invoices in minutes.
- Client management: store client contacts, addresses and tax IDs.
- Reduce errors: automatic invoice numbering, tax and total calculations.
- Brandable invoices: upload company logo and customize invoice fields.
- Export & share: download invoices as PDF and send to clients.

**High-level architecture**

- Backend: FastAPI (Python) with SQLAlchemy and PostgreSQL (database schema in `backend/database.sql`).
- Frontend: React + TypeScript, built with Vite (source in `frontend/src`).
- Storage: PostgreSQL by default; sample SQL and migration helpers provided.

**Developer setup (local)**

Prerequisites:

- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL (or Docker)

Clone the repo:

```bash
git clone <your-repo-url>
cd InvoiceManager
```

Backend (local, using virtualenv):

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
pip install -r requirements.txt
# Set DATABASE_URL to point to your local Postgres or a hosted DB
export DATABASE_URL=postgresql://user:pass@localhost:5432/invoice_db
# (Windows PowerShell)
$env:DATABASE_URL = 'postgresql://user:pass@localhost:5432/invoice_db'

# Initialize DB (one-time): run SQL file or use a DB migration tool
# Example using psql:
# psql -U <user> -d invoice_db -f database.sql

# Run backend server (development):
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Database via Docker (quick option):

```bash
docker run --name invoicedb -e POSTGRES_USER=sameer -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=invoice_db -p 5432:5432 -d postgres:15
# Wait, then initialize
docker exec -i invoicedb psql -U sameer -d invoice_db < backend/database.sql
```

Frontend (local):

```bash
cd frontend
npm install
# point the frontend to the backend by creating a .env file
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Notes & tips:

- Frontend uses `VITE_API_URL` (see `frontend/src/services/api.ts`) — change it to match your backend URL.
- Backend expects a Postgres `DATABASE_URL` env var. If you don't set it, the project uses a hosted connection string by default; change it for local development.
- Use the provided `backend/database.sql` to create sample data and schema for quick testing.

**Useful commands**

- Backend: `pip install -r backend/requirements.txt`, `uvicorn app.main:app --reload`.
- Frontend: `cd frontend && npm install && npm run dev` (dev preview on http://localhost:5173).
- Docker DB: `docker run ... postgres:15` then import `backend/database.sql`.

If you want, I can also add a small `.env.example` and a short CONTRIBUTING.md with more run/debug tips — would you like that?
