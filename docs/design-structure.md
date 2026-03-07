﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿# Blisszits Design Structure

## Purpose
This document captures the current design structure of Blisszits as implemented in the codebase. It maps the UI layers, layout system, component taxonomy, and visual foundations that define the product experience.

## Experience Layers
### 1) Marketing Layer (Public)
- Routes live under `src/app/*` and use the marketing shell wrapper.
- Primary goal: explain product value, showcase modules, and drive sign-up.
- Core pages: Home, Platform, Publishing, Engagement, Analytics, Pricing, Integrations, Customers, Resources, Security, Terms, Privacy.

### 2) Application Layer (Authenticated)
- Routes live under `src/app/app/*` and use the app layout with side navigation.
- Primary goal: run daily workflows for planning, publishing, inbox, and analytics.
- Key work areas: dashboard, workspaces, analytics, inbox, settings, workspace hub.

## Layout System
### Root Layout
- Global layout provides fonts, background, SEO metadata, and app-wide providers.
- Context providers include authentication and workspace selection.
- Toast notifications are available globally.

### Marketing Shell
- Structure: header → main content → footer.
- Header emphasizes top navigation modules and calls to action.
- Footer reinforces positioning and compliance pages.

### App Layout
- Desktop: persistent left sidebar with workspace-aware navigation.
- Mobile: sheet-based navigation with centered brand mark.
- Main content uses a wide container for data-rich views.

## Navigation Architecture
### Marketing Navigation
- Primary modules: Platform, Publishing, Engagement, Analytics, Pricing, Integrations, Customers, Resources.
- Authentication entry points: Log in and Start free.

### App Navigation
- Base items: Dashboard, Workspaces, Analytics, Inbox, Settings.
- Workspace hub appears when a workspace is active.
- Sign out is always accessible in the sidebar footer.

## Design Foundations
### Typography
- Body: PT Sans for readability and operational clarity.
- Headlines: Playfair Display for premium, editorial emphasis.

### Color Tokens
- Primary: Purple for brand energy and key actions.
- Accent: Blue for highlights and secondary emphasis.
- Background: Light gray for clean, high-contrast surfaces.
- Semantic tokens drive light and dark themes via CSS variables.

### Theming
- Tailwind configuration maps design tokens to utility classes.
- Dark mode supported through class-based theme switching.

## Component System
### UI Primitives
- Located in `src/components/ui`.
- Built on Radix UI + class-variance-authority for variants.
- Core building blocks: Button, Card, Badge, Tabs, Table, Dialog, Sheet, Tooltip.

### Feature Components
- Organized by domain: analytics, inbox, publishing, content, onboarding, admin.
- Marketing components live under `src/components/marketing`.
- Layout components live under `src/components/layout`.

## Marketing Module Structure
### Module Pages
- Module pages share a consistent template with hero, capability cards, and CTAs.
- Marketing content is centralized in `src/lib/marketing-content`.

### Capability Tables
- Integrations page uses a capability matrix to show network coverage.
- Network capability rows are a structured data source for messaging consistency.

## Application Module Structure
### Workspace-Centric Design
- Workspace context powers navigation and personalization.
- Active workspace callouts surface in the sidebar.

### Workflow Hubs
- Dashboard: system snapshot and quick access.
- Workspaces: manage and switch between client or team hubs.
- Inbox: reply, triage, and collaboration.
- Analytics: performance and best-time insights.
- Settings: profile and workspace configuration.

## Content Architecture
### Structured Content
- Marketing messaging data stored in `src/lib` for reuse across pages.
- Pricing plans and add-ons are defined in `src/lib/pricing-content`.

### Messaging Consistency
- Headline and CTA patterns are reused across pages to reinforce positioning.
- Feature descriptions align with module names used in navigation.

## Design Principles Embedded in Code
- Clear separation between marketing and product workflows.
- Reusable shell patterns to enforce visual consistency.
- Workspace-first navigation to mirror the product’s ICP needs.
- Data-backed marketing modules to keep copy synchronized across pages.
