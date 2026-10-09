# Credit Card Payment System

Full-stack demo for authentication, saved-card management, simulated
payments, transaction history, and administration.

> **Safety:** This project simulates payment outcomes; it does not
> process real money. Never store or submit real card numbers or CVVs.
> Store only a masked card number and last four digits.

## Stack

-   Frontend: React, Vite, Tailwind CSS
-   User/admin backend: Django, Django REST Framework, JWT
-   Payment backend: FastAPI, SQLAlchemy
-   Database: MySQL
-   Tests: Django test runner, pytest, FastAPI TestClient

## Features

-   Registration, JWT login/logout, protected profile
-   Add/list/delete saved cards with ownership checks
-   Simulated `SUCCESS` and `FAILED` payments
-   Transaction history and filters
-   Admin CSV export/payment summary (where configured)
-   Django Admin and FastAPI Swagger UI

## Project structure

``` text
Credit_Card_Payment_System/
├── .env
├── .venv/
├── django_backend/
├── payment_api/
└── frontend/
```

## Prerequisites

Install Python, Node.js/npm, and MySQL Server.

## Environment variables

Create `.env` in the project root using your own local credentials:

``` env
DB_NAME=credit_card_payment_db
DB_USER=root
DB_PASSWORD=YOUR_LOCAL_MYSQL_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Create `frontend/.env`:

``` env
VITE_DJANGO_API_URL=http://127.0.0.1:8000
VITE_PAYMENT_API_URL=http://127.0.0.1:8001
```

Never commit `.env`, passwords, JWT secrets, tokens, or real payment
information. Never put secrets in `VITE_*` variables because they are
exposed in the browser.

## Database setup

Start MySQL, then create the database if needed:

``` sql
CREATE DATABASE credit_card_payment_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

From `django_backend`, run migrations for Django-managed tables:

``` powershell
..\.venv\Scripts\Activate.ps1
python manage.py migrate
```

The FastAPI `Transaction` model uses the existing/shared database schema
in this project. Check table ownership and schema before making
migrations or schema changes to it.

## Run locally

Open three VS Code terminals.

### Django --- port 8000

``` powershell
cd "C:\Users\Sai Manikanta\Desktop\vs code\Credit_Card_Payment_System\django_backend"
..\.venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

### FastAPI --- port 8001

``` powershell
cd "C:\Users\Sai Manikanta\Desktop\vs code\Credit_Card_Payment_System\payment_api"
..\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001
```

Swagger UI: `http://127.0.0.1:8001/docs`\
Health check: `http://127.0.0.1:8001/health`

### React --- Vite

``` powershell
cd "C:\Users\Sai Manikanta\Desktop\vs code\Credit_Card_Payment_System\frontend"
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Tests

Django:

``` powershell
cd "C:\Users\Sai Manikanta\Desktop\vs code\Credit_Card_Payment_System\django_backend"
..\.venv\Scripts\Activate.ps1
python manage.py test accounts cards
```

FastAPI:

``` powershell
cd "C:\Users\Sai Manikanta\Desktop\vs code\Credit_Card_Payment_System\payment_api"
..\.venv\Scripts\Activate.ps1
python -m pytest test_main.py -v
```

## API endpoints

Verify Django auth URL spellings against `accounts/urls.py` before
submission.

  Method   Endpoint                Purpose
  -------- ----------------------- ---------------------------------
  POST     `/api/auth/register/`   Register user
  POST     `/api/auth/login/`      Obtain JWT tokens
  POST     `/api/auth/refresh/`    Refresh token
  GET      `/api/auth/profile/`    View profile
  POST     `/api/auth/logout/`     Logout/invalidate refresh token
  GET      `/api/cards/`           List own cards
  POST     `/api/cards/`           Add a card
  DELETE   `/api/cards/{id}/`      Delete own card
  GET      `/api/transactions/`    Transaction history/filters
  POST     `/payments/`            Simulate a payment
  GET      `/health`               FastAPI health check
  GET      `/docs`                 FastAPI Swagger UI

Example simulated payment request to
`POST http://127.0.0.1:8001/payments/`:

``` json
{
  "card_id": 1,
  "amount": "500.00",
  "simulate_success": true
}
```

Send `Authorization: Bearer <access_token>` and use a card owned by that
user. Set `simulate_success` to `false` to simulate failure.

## Security checklist

-   Never store/log full card numbers or CVVs.
-   Keep `.env`, credentials, and tokens out of Git.
-   Use a long, random JWT secret outside local demos.
-   Confirm users can access only their own cards and transactions.
-   Restrict admin endpoints to authorized staff.
-   Disable Django debug mode and configure production secrets before
    deployment.
-   This demo is not a real payment gateway and is not PCI DSS
    certified.

## Submission checklist

-   [ ] Run Django and FastAPI tests.
-   [ ] Verify register → login → add card → successful/failed payment →
    transaction history → logout.
-   [ ] Export a database dump with safe demo data only.
-   [ ] Import and verify the Postman collection.
-   [ ] Capture frontend, FastAPI docs, Django Admin, and passing-test
    screenshots.
-   [ ] Commit code, README, Postman collection, and safe supporting
    files to GitHub.
-   [ ] Do not commit `.env`, `.venv/`, `node_modules/`, SQL dumps,
    tokens, or real card data.
