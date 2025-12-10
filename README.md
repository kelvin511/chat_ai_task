# Real-time Chat Application with AI Assistance

A robust, real-time chat application built with a modern tech stack, featuring instant messaging, user presence, and AI-powered text suggestions.

## Features

-   **Real-time Messaging**: Instant message delivery using Socket.IO with optimistic UI updates for zero-latency feel.
-   **AI Assistant**: Integrated OpenAI support to generate or complete messages (Sparkles icon).
-   **User Presence**: Live "Online Users" list excluding the current user.
-   **Persistent History**: Chat history stored reliably in PostgreSQL.
-   **Smart Notifications**: Toasts for incoming messages from others, suppressed for self.
-   **Modern UI**: Built with Next.js and TailwindCSS, featuring a dark/premium aesthetic.

## Tech Stack

-   **Backend**: Node.js, Express, Socket.IO, Prisma (PostgreSQL).
-   **Frontend**: Next.js 14, Redux Toolkit (RTK Query), Socket.IO Client, TailwindCSS.
-   **Database**: PostgreSQL.

## Prerequisites

-   Node.js (v18+)
-   PostgreSQL Database local or cloud (e.g., Supabase, Neon)

## Setup Instructions

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in `backend/` based on `.env.example`:
    ```env
    PORT=3003
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    OPENAI_API_KEY="sk-..." # Required for AI features
    ```
4.  Run Database Migrations:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Start the Server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in `client/` based on `.env.sample`. **Note:** No trailing slash!
    ```env
    NEXT_PUBLIC_BACKEND_URL="http://localhost:3003"
    ```
4.  Start the Client:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## usage

1.  **Join**: Enter a unique username to join the chat.
2.  **Chat**: Select a user from the sidebar to start a private chat.
3.  **AI**: Click the **Sparkles** icon in the input bar to auto-generate text.
4.  **History**: Refreshing the page restores chat history from the database.
