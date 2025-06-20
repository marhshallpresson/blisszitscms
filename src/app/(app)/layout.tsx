// This file is intentionally left minimal to avoid routing conflicts.
// The active application layout has been moved to /src/app/app/layout.tsx.
// This file remains to prevent older build artifacts or routing caches from causing issues.
import type { ReactNode } from 'react';

export default function PlaceholderAppLayout({ children }: { children: ReactNode }) {
  // This layout should no longer be active or contain significant structure.
  // It's kept minimal to avoid interfering with the primary /app/app/layout.tsx
  return <>{children}</>;
}
