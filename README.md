# SuperAdmin Backend & Minimal UI

This project implements a production-quality Super Admin backend with a minimal React UI for testing. The Super Admin can manage users, roles, audit logs, analytics, and feature toggles.

---

## Features

- **REST APIs** for Super Admin operations with secure JWT & role checks
- **User Management**: CRUD, role assignment, audit logging
- **Role Management**: CRUD, assign roles to users
- **Audit Logs**: View/filter logs for all admin actions
- **Analytics**: Dashboard with user/role stats
- **Minimal React UI**: Login, users list/detail, role assignment, audit logs, analytics
- **Tests**: Jest + Supertest for backend APIs
- **Postman Collection**: For API testing
- **Docker**: For easy local DB setup
- **Acces**: Only superadmin roles user can login

---

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM, MySQL
- **Auth**: JWT with superadmin role middleware
- **Frontend**: React (Vite)
- **Testing**: Jest, Supertest
- **API Docs**: Postman collection
- **Containerization**: Docker (for DB)

---

## Project Structure

```
.
├── .gitignore
├── README.md
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── utils/
│   └── ...
└── superadmin-backend/
    ├── package.json
    ├── .env
    ├── docker-compose.yml
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.js
    │   └── migrations/
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── middleware/
    │   ├── routes/
    │   └── services/
    ├── tests/
    └── superAdmin.postman_collection.json
```

---

## Quick Start

### 1. Clone & Install

```sh
git clone https://github.com/vid0326/SuperAdmin.git
cd superadmin-backend
npm install (install prisma nodemon supertest jest cors joi jsonwebtoken express express-rate-limiter  dotenv bcryptjs morgan @prisma/client)
cd ../frontend
npm install
```

### 2. Start MySQL with Docker

```sh
cd ../superadmin-backend
docker-compose up -d
```

### 3. Setup Database & Seed Superadmin

```sh
npx prisma migrate dev --name init
npm run db:seed
```

- Superadmin credentials:  
  **Email:** `superadmin@example.com`  
  **Password:** `Test1234!`

### 4. Run Backend

```sh
npm run dev
# or
npm start
```

### 5. Run Frontend

```sh
cd ../frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

---

## API Endpoints

See [superadmin-backend/superAdmin.postman_collection.json](superadmin-backend/superAdmin.postman_collection.json) for full details.

- **Auth:** `POST /api/v1/auth/login`
- **Users:** `GET/POST/PUT/DELETE /api/v1/superadmin/users`
- **Roles:** `GET/POST/PUT/DELETE /api/v1/superadmin/roles`
- **Assign Role:** `POST /api/v1/superadmin/roles/assign-role`
- **Audit Logs:** `GET /api/v1/superadmin/audit-logs`
- **Analytics:** `GET /api/v1/superadmin/analytics/summary`


---

## Environment Variables

Copy `superadmin-backend/.env` or create `.env` with:

```
DATABASE_URL="mysql://app:app123@localhost:3307/superadmin"
JWT_SECRET="your-secret"
PORT=3000
```

---

## Testing

```sh
cd superadmin-backend
npm run test
```

---

## Architecture

- **Backend**: Express.js REST API, Prisma ORM, JWT Auth, modular structure
- **Frontend**: React (Vite), Axios, React Router, TailwindCSS
- **Database**: MySQL (via Docker), Prisma migrations, seed script

See [superadmin-backend/prisma/schema.prisma](superadmin-backend/prisma/schema.prisma) for DB schema.

---

## Postman Collection

Import [superadmin-backend/superAdmin.postman_collection.json](superadmin-backend/superAdmin.postman_collection.json) into Postman for ready-to-use API requests.

---

## Screenshots / Demo

[![Watch the demo video](https://img.youtube.com/vi/2mUroRjE_uU/0.jpg)](https://youtu.be/2mUroRjE_uU)

[Watch on YouTube](https://youtu.be/2mUroRjE_uU)

---

## License
