# FormFlow

A modern, open-source form builder with a focus on UX and flexibility. 

## Features

- **Visual Builder**: Drag-and-drop canvas for building forms with real-time preview
- **Conditional Logic**: Show/hide fields based on previous answers dynamically
- **Form Renderer**: Clean, responsive standalone form renderer for end users
- **Real-time Sync**: Multi-user collaboration with live schema updates via WebSockets (if applicable)
- **Modern Stack**: Built with Next.js, Tailwind CSS, PostgreSQL (via Supabase), and Express

## Project Structure

This is a monorepo setup containing the frontend, backend, and shared typings.

- `/formflow/frontend` - Next.js (App Router), Tailwind CSS, shadcn/ui, dnd-kit
- `/formflow/backend` - Node.js/Express REST API and WebSocket server
- `/formflow/shared` - Shared TypeScript schemas and types

## Getting Started

### Prerequisites

You'll need a Supabase project (or local Postgres via Supabase CLI) to handle the database layer.

### 1. Database Setup

Run the included schema file against your Supabase Postgres database. You can just copy and paste it into the Supabase SQL editor.
\`\`\`bash
cat supabase_schema.sql
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd formflow/backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory with your Supabase credentials:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PORT=4000
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd formflow/frontend
npm install
\`\`\`

Create a `.env.local` file in the `frontend` directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app should now be running at [http://localhost:3000](http://localhost:3000).

## How it Works

Forms are built and stored as JSON schema documents. The builder UI modifies this schema, and the standalone preview/renderer components parse the schema to build out the final form interface. This allows for deep customization like conditional field visibility without having to write custom React code per form.
