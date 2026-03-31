# kiemtra01

Microservices demo with Django REST Framework, React, TailwindCSS, JWT, Nginx, MySQL, and PostgreSQL.

## Services

- `customer-service` -> MySQL
- `staff-service` -> MySQL
- `laptop-service` -> PostgreSQL
- `mobile-service` -> PostgreSQL
- `clothes-service` -> PostgreSQL
- `api-gateway` -> Nginx
- `frontend-customer` -> React + Tailwind
- `frontend-staff` -> React + Tailwind

## Run UI + BE

1. Copy `.env.example` to `.env`
2. Update values if needed
3. Start all services (UI, BE, DB, gateway):

```bash
docker compose up --build -d
```

4. Open app through gateway: `http://localhost:8080`

## Development URLs

- API Gateway: `http://localhost:8080`
- MySQL (host): `localhost:3307`
- PostgreSQL (host): `localhost:5434`

## Seed accounts

- Customer: `alice` / `password123`
- Customer: `bob` / `password123`
- Staff: `manager` / `password123`
- Staff: `editor` / `password123`

Seed users are created automatically on startup by:

- `customer-service`: `python manage.py seed_data`
- `staff-service`: `python manage.py seed_data`

## Notes

- Django migrations run automatically in each backend container.
- Seed commands are idempotent and run automatically on startup.
- Product tables are created only by Django migrations.
- Databases created automatically:
	- MySQL: `MYSQL_DATABASE_CUSTOMER`, `MYSQL_DATABASE_STAFF`, `MYSQL_DATABASE_EXTRA`
	- PostgreSQL: `POSTGRES_DATABASE_LAPTOP`, `POSTGRES_DATABASE_MOBILE`, `POSTGRES_DATABASE_CLOTHES`, `POSTGRES_DATABASE_EXTRA`
