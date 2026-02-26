# Product Requirements Document (PRD): Blisszits CMS

## 1. Executive Summary
**Blisszits CMS** is a streamlined Content Management System designed for modern social media creators and digital entrepreneurs. It provides a central hub for organizing content across multiple projects (workspaces), leveraging AI to overcome creative blocks and manage the end-to-end lifecycle of digital content—from initial idea to publication and performance tracking.

---

## 2. Target Audience
*   **Social Media Influencers:** Managing multiple platforms (TikTok, Instagram, LinkedIn).
*   **Content Strategists:** Planning calendars for brands or personal projects.
*   **UGC Creators:** Organizing scripts and filming schedules for clients.
*   **Small Marketing Teams:** Collaborating on content drafts and approvals.

---

## 3. Core Features

### 3.1 Workspace Management
*   **Multi-Workspace Support:** Users can create isolated environments for different brands or clients.
*   **AI Workspace Generator:** A wizard that takes a topic and audience interests to generate a full 30-day content plan and workspace structure automatically.
*   **Workspace Overview:** High-level metrics showing the number of items and recent activity.

### 3.2 Content Lifecycle & Dashboard
*   **Content Grid:** A filterable view of all content items with status tracking (Draft, In Progress, For Review, Approved, Published).
*   **Visual Calendar:** A date-centric view to manage deadlines and posting schedules.
*   **Idea Board:** A Kanban-style board for rapid brainstorming and moving ideas through stages (Scripting, Filming, Editing).
*   **Search & Filtering:** Robust search across titles, captions, and descriptions.

### 3.3 AI-Powered Creative Assistant
*   **Content Idea Generation:** Tailored suggestions based on trending topics and user-defined interests.
*   **Script Writing:** Automated generation of video script outlines (Hook, Problem, Solution, CTA).
*   **Caption Drafting:** Crafting engaging social media captions with specific tones.
*   **Hashtag Research:** Suggesting relevant, high-performing hashtags based on the content brief.

### 3.4 Collaboration & Communication
*   **Unified Inbox:** A centralized demo interface for managing DMs and comments from various platforms (Instagram, LinkedIn, etc.).
*   **Team Comments:** Threaded discussions on specific content items to facilitate feedback and approval.

### 3.5 Brand Analytics
*   **Performance Tracking:** Dashboard view of engagement metrics.
*   **Report Export:** Functionality to generate and download PDF reports of brand performance for clients or stakeholders.

---

## 4. Technical Requirements

### 4.1 Tech Stack
*   **Frontend:** Next.js 15 (App Router), React 18, Tailwind CSS.
*   **UI Components:** ShadCN UI (Radix-based).
*   **Icons:** Lucide React.
*   **Backend & Database:** Firebase (Firestore for data, Realtime Database for preferences).
*   **Authentication:** Firebase Auth (Email/Password and Anonymous).
*   **AI Engine:** Genkit with Google Gemini 2.0 Flash.

### 4.2 Styling Guidelines
*   **Primary Color:** Purple (#6366F1) - represents creativity.
*   **Accent Color:** Blue (#3B82F6) - for interactive highlights.
*   **Background:** Light Gray (#F9FAFB) - for a clean, professional workspace.
*   **Typography:** 'PT Sans' (Body) for readability; 'Playfair Display' (Serif) for elegant headers.

---

## 5. Non-Functional Requirements
*   **Responsiveness:** Mobile-first design with a dedicated sidebar/navigation for smaller screens.
*   **Performance:** Optimized session verification and client-side data sorting to minimize load times.
*   **Reliability:** Atomic database writes using Firestore Batches for workspace creation.
*   **Safety:** Confirmation dialogs for all destructive actions (deletions).

---

## 6. Future Roadmap
*   **Push Notifications:** Real-time mobile alerts for upcoming deadlines.
*   **Direct Publishing:** API integrations to post directly to Instagram and TikTok.
*   **Media Storage:** Integrated Firebase Storage for managing video and image assets.
*   **Advanced Analytics:** Real-time data sync with social media platform APIs.
