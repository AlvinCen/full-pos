# Full-Stack Point of Sale (POS) System - v2

This repository contains a production-ready Point of Sale (POS) system designed for Indonesian SMEs. It is built using a modern full-stack architecture within a monorepo.

## Project Architecture

- **Monorepo:** Managed with npm workspaces.
- **Frontend (`apps/web`):** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui. Runs on `http://localhost:3000`.
- **Backend (`apps/server`):** Node.js, Express, TypeScript. Runs on `http://localhost:4000`.
- **Database:** PostgreSQL, managed with Prisma ORM. Runs on `localhost:5432`.

## Prerequisites

- **Node.js:** v18 or later.
- **npm:** v8 or later.
- **PostgreSQL:** A running instance. You can use a local installation or Docker.
- **Git:** For version control.

## Windows Development Setup

### 1. Database Setup

Ensure you have a PostgreSQL server running. Create a new database for this project (e.g., `pos_db_v2`).

### 2. Environment Configuration

Create a `.env` file in the root of the project by copying the example:

```bash
copy .env.example .env
```

Now, edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL connection string. It should look something like this:

```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/pos_db_v2?schema=public"
```

Replace `USERNAME`, `PASSWORD`, and `pos_db_v2` with your actual database credentials.

### 3. Install Dependencies

Install all dependencies for the entire monorepo from the root directory:

```bash
npm install
```

### 4. Database Migration & Seeding

This command will apply the database schema and populate it with initial demo data (users, roles, products, sales, etc.).

```bash
npm run prisma:migrate
```

This combines `prisma migrate deploy` and `prisma db seed`.

## Running the Application

### 1. Start the Backend Server

Open a terminal in the project root and run:

```bash
npm run server
```

The backend API will be available at `http://localhost:4000`.

**Important Note for Windows Users:** If you need to run another Prisma command (like `prisma studio` or `prisma migrate dev`) while the server is running, you might get an `EPERM: operation not permitted, rename` error. To fix this, **stop the server (`Ctrl + C`) before running any other `prisma` commands.**

### 2. Start the Frontend Development Server

Open a **new** terminal in the project root and run:

```bash
npm run web
```

The frontend application will be available at `http://localhost:3000`.

## Available Scripts

All scripts should be run from the **root directory** of the project.

- `npm run web`: Starts the Next.js frontend dev server.
- `npm run server`: Starts the Express backend dev server using `ts-node-dev`.
- `npm run prisma:generate`: Generates the Prisma Client based on your schema.
- `npm run prisma:deploy`: Applies pending database migrations.
- `npm run prisma:seed`: Populates the database with seed data.
- `npm run prisma:migrate`: A convenience script that runs `deploy` and then `seed`. Use this for initial setup.
- `npm run prisma:studio`: Opens the Prisma Studio to view and manage your data.

## Demo Users

- **Admin:** `admin@rekber.id` / `admin123`
- **Buyer:** `buyer@test.com` / `buyer123`
- **Seller:** `seller@test.com` / `seller123`
