# 🌀 Zustand Store Cheat Sheet

## /src/store/useSessionStore.ts
```ts
import { create } from 'zustand';

type SessionState = {
  role: 'importer' | 'forwarder' | null;
  setRole: (role: 'importer' | 'forwarder') => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
```

## Usage
```ts
const role = useSessionStore((s) => s.role);
```