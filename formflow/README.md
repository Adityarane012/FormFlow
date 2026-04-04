# FormFlow 🚀

**FormFlow** is a premium, schema-driven, and real-time collaborative form builder. Designed for speed and visual excellence, it allows you to go from a simple thought to a fully functional, published form in seconds.

---

## ✨ Key Features

### 🤝 Real-Time Collaboration
*   **Live Multi-User Editing**: Powered by Socket.io, watch as collaborators edit the same form simultaneously.
*   **Presence Indicators**: See who else is in the builder with colorful user avatars and dynamic cursor tracking.
*   **Field Locking**: Prevents conflicts by indicating which field is currently being edited by another user.
*   **Role-Based Sharing**: Invite others as **Editors** (full control) or **Viewers** (read-only).

### ⏳ Schema Versioning
*   **Historical Snapshots**: Every major change is automatically saved as a new version.
*   **Instant Restore**: Revert to any previous iteration of your form with a single click.
*   **Permanent History**: A dedicated side panel tracks your form's evolution over time.

### 🤖 AI-Powered Form Generation
*   **Natural Language Prompting**: Describe your form in plain English (e.g., "Create a job application for a Software Engineer") and let the AI generate the entire schema.
*   **Keyword Intelligence**: Recognizes intent for feedback surveys, registrations, contact forms, and more.
*   **Instant Builder Load**: Generated forms are instantly loaded into the visual builder for final fine-tuning.

### 🎨 Premium Builder Experience
*   **Visual Drag-and-Drop**: A focused, tactile canvas powered by `@dnd-kit`.
*   **Smooth Animations**: Fluid, sliding settings panels and interactive micro-animations.
*   **Focused UI**: Action buttons only appear on hover, keeping the canvas clean and distraction-free.
*   **Dark Mode Support**: A beautiful, curated dark theme for night-time building sessions.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, React, Tailwind CSS
*   **State Management**: Custom hooks + Local Database layer
*   **Real-time Logic**: Socket.io for collaborative event syncing
*   **Icons & Assets**: Lucide-React for crisp, professional iconography
*   **Persistence**: Robust Local-First architecture with `mockDatabase.ts` and `dataService.ts`

---

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Adityarane012/FormFlow.git
    cd FormFlow
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

4.  **Open the App**:
    Navigate to `http://localhost:3000` to start building!

---
