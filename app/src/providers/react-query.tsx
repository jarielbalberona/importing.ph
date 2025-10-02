"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

export const appQueryClient = new QueryClient({});

export default function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={appQueryClient}> {children} </QueryClientProvider>
  );
}
