# [Project Name] — AI Agent Guide

> **How to use this template**: Copy this file to your project root as `AGENT.md`. Fill in the bracketed placeholders `[...]` with your project-specific details. Use the section below to generate a folder structure.

> **Note to AI Agents**: This file provides a comprehensive overview of the project's architecture, conventions, and guidelines. Read this before initiating any changes to ensure consistency and adherence to established patterns.

---

## 🚀 Project Overview

**[Project Name]** is a [Brief description: e.g., Next.js 14 travel booking platform].

- **Primary Goal**: [e.g., provide a seamless booking experience for tours in Nepal]
- **Key Modules**: [e.g., Auth, Dashboard, Booking Engine, Payment Integration]

### Technical Stack

- **Framework**: [e.g., Next.js 14 (App Router)]
- **Language**: [e.g., TypeScript]
- **Styling**: [e.g., Tailwind CSS]
- **State Management**: [e.g., Zustand]
- **Forms**: [e.g., React Hook Form + Zod]
- **Auth**: [e.g., NextAuth.js]
- **Database/API**: [e.g., Custom Backend API / Supabase]

---

## 📂 Project Structure

```
[root]/
├── app/                          # Main application logic (App Router)
│   ├── (group)/                  # Logic-grouped routes
│   ├── actions/                  # Server Actions
│   └── api/                      # API Route Handlers
├── components/
│   ├── ui/                       # Base UI primitives (e.g., shadcn/ui)
│   ├── common/                   # Shared feature components
│   └── layout/                   # Global layout components
├── hooks/                        # Custom React hooks
├── lib/                          # Core logic, utilities, and config
│   ├── store/                    # State management (Zustand/Redux)
│   └── utils/                    # Helper functions
├── services/                     # Data fetching / API layer
├── types/                        # TypeScript definitions
├── schemas/                      # Validation schemas (Zod)
└── urls/                         # Route constants
```

> **Tip**: To update the structure above, run: `find . -maxdepth 2 -not -path '*/.*'`. For a deeper tree, use `tree -L 2` if available.

---

## 🛠 Key Conventions

### 1. Routing & Pages

- **Route Constants**: Avoid hardcoding URLs. Use `urls/index.ts` or similar.
- **Server vs Client**: Default to Server Components. Use `'use client'` only when interaction or browser APIs are needed.

### 2. Component & Code Structure

- **Flat vs nested**: Keep components flat within feature folders. Avoid deep nesting (max 2-3 levels deep).
- **Colocation**: Keep hooks, types, and sub-components close to the components that use them. Move to `common/` or `hooks/` only if reused across features.
- **Index Files**: Use `index.ts` files in component folders to keep imports clean: `import { Button } from '@/components/ui'`.
- **Naming**: Use `PascalCase` for component folders and files (e.g., `HeroSection/HeroSection.tsx`).

#### 🏗️ How to Build a New Feature (Workflow)

1. **Define Schema**: Create a Zod schema in `schemas/` for validation.
2. **Add Service**: Implement data fetching in `services/[feature].service.ts`.
3. **Create Components**: Build UI in `components/common/[FeatureName]/`.
4. **State Management**: If needed, add a store in `lib/store/` (Zustand).
5. **Server Action**: If performing mutations, add to `app/actions/`.
6. **Route/Page**: Implement the final page in `app/(main)/...`.

### 3. Data Fetching & API Optimization

- **Avoid Waterfalls**: Use `Promise.all()` for independent fetches or fetch data at the highest possible level in Server Components.
- **Caching**: Leverage Next.js `cache()` for deduplication and `revalidate` for ISR.
- **Deduplication**: Never call the same API endpoint twice in the same render cycle if the data can be shared via props or state.
- **Services**: All API calls should reside in `services/`.
- **Server Actions**: Use `app/actions/` for mutations (POST/PATCH/DELETE) and revalidate data using `revalidatePath`.

### 4. State Management (Zustand)

- **Persist sparingly**: Only persist state to LocalStorage if necessary (e.g., Cart, Wishlist).
- **Selectors**: Always use selectors to prevent unnecessary re-renders: `const user = useUserStore(s => s.user)`.
- **Logic placement**: Keep complex state transitions inside the store actions, not the component.

### 4. Forms & Validation

- **Zod**: Mandatory for all form validation and API response parsing.
- **React Hook Form**: Use with `@hookform/resolvers` for form state management.

### 5. Performance & React Hooks

- **Avoid `useEffect`**: Before adding a `useEffect`, check if the logic can be handled in an **event handler** or during **rendering** (e.g., `useMemo` or calculating derived state).
- **Derived State**: Don't sync props to state. Calculate values from props or existing state during render.
- **Memoization**: Use `useMemo` and `useCallback` strategically for heavy computations or preventing unnecessary re-renders of memoized components.
- **State Locality**: Keep state as close as possible to where it's used. Avoid global state for component-specific UI toggles.

### 6. Styling

- **Tailwind CSS**: Use utility classes. Avoid custom CSS in `globals.css` unless absolutely necessary.
- **Responsive Design**: Mobile-first approach is mandatory.

---

## 🤖 Agent Roles & Constraints

1. **Safety First**: Never delete large directories without confirmation.
2. **Context Awareness**: Always check `package.json` for existing libraries before suggesting new ones.
3. **Consistency**: Follow the existing naming conventions and file structures strictly.
4. **Documentation**: Update this file or relevant `README.md` files if architectural changes are made.
5. **No Placeholders**: Do not use `lorem ipsum` or placeholder images in production-ready components.

---

## 💻 Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Linting
pnpm run lint
```

---

## 🔐 Environment Variables

Explain the key environment variables needed for the project here.

- `NEXT_PUBLIC_API_URL`: Path to the backend service.
- `NEXTAUTH_SECRET`: Secret for session encryption.

---

## 📝 Important Files Summary

| File                 | Responsibility               |
| -------------------- | ---------------------------- |
| `auth.ts`            | Authentication configuration |
| `middleware.ts`      | Route guards and redirects   |
| `lib/api.ts`         | Typed fetch wrapper          |
| `tailwind.config.ts` | Design tokens and theme      |

---

> Generated by Antigravity AI Agent. Use this as a baseline for all feature development.
