# 🎫 Ticketera: Modular AI Ticketing System

Ticketera is a modular, multi-tenant ticketing system designed for AI agents and modern web applications. It follows a **local-first** approach with file-based storage, making it lightweight, fast, and easy to deploy.

## 🏗️ Architecture

The project is structured as a monorepo using **npm workspaces**, divided into two main categories: `apps` and `packages`.

### 📂 Apps
- **`apps/api`**: A high-performance **Fastify** backend.
  - Zod validation for all inputs.
  - API Key-based authentication middleware.
  - RESTful endpoints for ticket and context management.
- **`apps/admin`**: A modern **Next.js 15** dashboard.
  - Built with **React 19** and **Tailwind CSS 4**.
  - UI components from **Shadcn/UI** and **Base UI**.
  - Visualizes tickets, priorities, and AI conversation contexts.

### 📦 Packages
- **`@ticketera/sdk`**: A universal **Web Component** and JS SDK.
  - Can be embedded in any website with a single `<ticket-widget>` tag.
  - Automatically captures conversation history to provide full context to support agents.
  - Built with **tsup** for ESM/CJS compatibility.
- **`@ticketera/storage`**: The data abstraction layer.
  - Local-first file-based storage using JSON.
  - Handles persistence for tickets, organizations, and conversation contexts.

---

## 🛠️ Implementation Details

### 1. Data Flow
1. The **SDK** captures user input and conversation history.
2. It sends a POST request to the **API** with the `Authorization` header (API Key).
3. The **API** validates the request using **Zod** and identifies the organization.
4. The **Storage** layer persists the ticket and the conversation context into `data/*.json`.
5. The **Admin** dashboard fetches this data to display it to support staff.

### 2. Multi-Tenancy
Each request to the API requires an `api-key`. The system maps this key to an `Organization`, ensuring that data remains isolated between different clients.

### 3. AI Context Capture
Unlike traditional ticketing systems, Ticketera is built for AI. The SDK allows developers to pass the current conversation history directly into the ticket, allowing human agents to see exactly what the AI and the user were discussing before the escalation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Install dependencies for the entire monorepo
npm install
```

### Development
```bash
# Run all apps and packages in development mode
npm run dev
```

- **Admin Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:3001](http://localhost:3001)

---

## 📋 Applied Modules & Technologies

| Module | Core Tech | Purpose |
|--------|-----------|---------|
| **API** | Fastify, Zod, Nanoid | Backend logic & Validation |
| **Admin** | Next.js, Shadcn/UI, Lucide | Management UI |
| **SDK** | Web Components, tsup | Universal Integration |
| **Storage** | fs-extra, TypeScript | Data Persistence |

---

## 🚧 Pending Work & Roadmap

### Phase 1: Core Enhancements
- [ ] **Advanced Authentication**: Implement NextAuth or Clerk for secure Admin access.
- [ ] **Real-time Notifications**: Add WebSockets (Socket.io) for instant ticket alerts.
- [ ] **Status Transitions**: Implement a full state machine for ticket statuses (Open -> In Progress -> Resolved).

### Phase 2: AI & Integrations
- [ ] **AI Summarization**: Automatically summarize conversation contexts using OpenAI/Anthropic.
- [ ] **Sentiment Analysis**: Tag tickets based on the user's mood during the conversation.
- [ ] **Webhooks**: Notify external systems (Slack, Discord) when a new ticket is created.

### Phase 3: Scaling & Polish
- [ ] **Database Support**: Add a PostgreSQL/Prisma adapter for the `@ticketera/storage` package.
- [ ] **File Attachments**: Support for uploading screenshots or logs.
- [ ] **Multilingual Support**: Internationalization (i18n) for the SDK and Admin panel.
- [ ] **Testing**: Implement Vitest for unit tests and Playwright for E2E testing.

---

## 📄 License
MIT
