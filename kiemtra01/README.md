# kiemtra01

Demo microservices với Django REST Framework, React (Vite), JWT, Nginx, MySQL và PostgreSQL.

## Cấu trúc service

- `api-gateway`: Nginx reverse proxy
- `customer-service`: Django + MySQL
- `staff-service`: Django + MySQL
- `laptop-service`: Django + PostgreSQL
- `mobile-service`: Django + PostgreSQL
- `clothes-service`: Django + PostgreSQL
- `frontend-customer`: React + Vite + Tailwind
- `frontend-staff`: React + Vite + Tailwind

## Cách chạy nhanh

1. Tạo file môi trường:

```bash
cp .env.example .env
```

2. Build và chạy toàn bộ hệ thống:

```bash
docker compose up --build -d
```

3. Truy cập qua gateway:

- `http://localhost:8080`

## Tài khoản seed

- Customer: `alice` / `password123`
- Customer: `bob` / `password123`
- Staff: `manager` / `password123`
- Staff: `editor` / `password123`

Seed được chạy tự động khi container backend khởi động.

## Cổng phát triển

- Gateway: `localhost:8080`
- MySQL (host): `localhost:3307`
- PostgreSQL (host): `localhost:5434`

## Ghi chú

- Migrations chạy tự động trong mỗi backend container.
- Các lệnh seed được thiết kế idempotent.
- CSDL được tạo theo biến môi trường trong `.env`.
