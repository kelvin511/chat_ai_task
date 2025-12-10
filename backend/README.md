# Node.js Express Backend Starter

This is a production-ready scaffold for a Node.js Express backend using TypeScript, Prisma (MongoDB), and Winston logger.

## Features or Tech Stack

-   **Runtime**: Node.js
-   **Language**: TypeScript
-   **Framework**: Express.js
-   **Database**: MongoDB (via Prisma ORM)
-   **Logging**: Winston
-   **Validation**: Zod (Ready to use)
-   **Security**: Helmet, CORS, Rate Limiting
-   **Docs**: Swagger UI (`/api-docs`)

## Getting Started

### Prerequisites

-   Node.js (v14+ recommended)
-   MongoDB Database (Connection string)

### Installation

1.  Clone the repository and navigate to `backend`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    copy `.env.example` to `.env` and update `DATABASE_URL`.
    ```bash
    cp .env.example .env
    ```

### Running the Project

-   **Development**:
    ```bash
    npm run dev
    ```
-   **Production Build**:
    ```bash
    npm run build
    npm start
    ```
-   **Linting**:
    ```bash
    npm run lint
    ```

## API Documentation

Start the server and visit `http://localhost:3000/api-docs` (Note: You need to configure the swagger spec for full details).

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configs
│   ├── controllers/    # Request Handlers
│   ├── middlewares/    # Middlewares (Error, Auth, Logger)
│   ├── routes/         # API Routes
│   ├── services/       # Business Logic
│   ├── utils/          # Utilities
│   ├── app.ts          # Express App
│   └── server.ts       # Entry Point
└── prisma/             # Database Schema
```
